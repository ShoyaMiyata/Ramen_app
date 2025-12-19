import { v } from "convex/values";
import { action, mutation, query, internalMutation, internalQuery } from "./_generated/server";
import Stripe from "stripe";
import { internal } from "./_generated/api";

// Stripe Clientを取得するヘルパー関数
function getStripeClient(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-12-15.clover",
  });
}

// ========================================
// Query Functions
// ========================================

/**
 * 現在のユーザーのサブスクリプション状態を取得
 */
export const getStatus = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      // 認証されていない場合はデフォルトのFreeプランを返す
      return {
        plan: "free",
        stripeCustomerId: undefined,
        subscriptionId: undefined,
        subscriptionStatus: undefined,
      };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      // ユーザーが見つからない場合もデフォルトのFreeプランを返す
      return {
        plan: "free",
        stripeCustomerId: undefined,
        subscriptionId: undefined,
        subscriptionStatus: undefined,
      };
    }

    return {
      plan: user.plan ?? "free",
      stripeCustomerId: user.stripeCustomerId,
      subscriptionId: user.subscriptionId,
      subscriptionStatus: user.subscriptionStatus,
    };
  },
});

// ========================================
// Mutation Functions (Public)
// ========================================

/**
 * Stripe Checkoutセッションを作成
 * クライアントはこのURLにリダイレクトしてStripe決済ページを表示
 */
export const createCheckoutSession = action({
  args: {
    successUrl: v.string(),
    cancelUrl: v.string(),
  },
  handler: async (ctx, args): Promise<{ sessionId: string; url: string | null }> => {
    const stripe = getStripeClient();
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("認証が必要です");
    }

    // actionではctx.dbが使えないのでrunQueryを使う
    const user = await ctx.runQuery(internal.subscriptions.getUserByClerkId, {
      clerkId: identity.subject,
    });

    if (!user) {
      throw new Error("ユーザーが見つかりません");
    }

    // 既存のStripe Customerがあれば使用、なければ新規作成
    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          clerkId: identity.subject,
          convexUserId: user._id,
        },
      });
      customerId = customer.id;

      // ConvexにCustomer IDを保存
      await ctx.runMutation(internal.subscriptions.updateStripeCustomerId, {
        userId: user._id,
        customerId: customerId,
      });
    }

    // Checkout Sessionを作成
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      client_reference_id: identity.subject, // Clerk userId
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_PREMIUM_PRICE_ID!,
          quantity: 1,
        },
      ],
      success_url: args.successUrl,
      cancel_url: args.cancelUrl,
      subscription_data: {
        metadata: {
          clerkId: identity.subject,
          convexUserId: user._id,
        },
      },
    });

    return {
      sessionId: session.id,
      url: session.url,
    };
  },
});

/**
 * Stripe Customer Portalセッションを作成
 * サブスクリプション管理・キャンセル・請求書確認用
 */
export const createPortalSession = action({
  args: {
    returnUrl: v.string(),
  },
  handler: async (ctx, args): Promise<{ url: string }> => {
    const stripe = getStripeClient();
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("認証が必要です");
    }

    const user = await ctx.runQuery(internal.subscriptions.getUserByClerkId, {
      clerkId: identity.subject,
    });

    if (!user || !user.stripeCustomerId) {
      throw new Error("サブスクリプション情報が見つかりません");
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: args.returnUrl,
    });

    return {
      url: session.url,
    };
  },
});

// ========================================
// Internal Mutation Functions (Webhook用)
// ========================================

/**
 * Stripe Checkoutセッション完了時の処理
 */
export const handleCheckoutCompleted = internalMutation({
  args: {
    sessionId: v.string(),
    customerId: v.string(),
    subscriptionId: v.string(),
    clientReferenceId: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    if (!args.clientReferenceId) {
      console.error("No client_reference_id provided");
      return;
    }

    // Clerk IDからユーザーを検索
    const clerkId = args.clientReferenceId; // 非nullを保証
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .unique();

    if (!user) {
      console.error(`User not found for clerkId: ${args.clientReferenceId}`);
      return;
    }

    // ユーザー情報を更新
    await ctx.db.patch(user._id, {
      plan: "premium",
      stripeCustomerId: args.customerId,
      subscriptionId: args.subscriptionId,
      subscriptionStatus: "active",
    });

    console.log(`Subscription activated for user: ${user._id}`);
  },
});

/**
 * サブスクリプション更新時の処理
 */
export const handleSubscriptionUpdated = internalMutation({
  args: {
    subscriptionId: v.string(),
    customerId: v.string(),
    status: v.string(),
    currentPeriodEnd: v.number(),
  },
  handler: async (ctx, args) => {
    // Customer IDからユーザーを検索
    const user = await ctx.db
      .query("users")
      .withIndex("by_stripeCustomerId", (q) => q.eq("stripeCustomerId", args.customerId))
      .unique();

    if (!user) {
      console.error(`User not found for customerId: ${args.customerId}`);
      return;
    }

    // ステータスに応じてplanを更新
    const plan = args.status === "active" ? "premium" : "free";

    await ctx.db.patch(user._id, {
      plan,
      subscriptionStatus: args.status,
      subscriptionId: args.subscriptionId,
    });

    console.log(`Subscription updated for user: ${user._id}, status: ${args.status}`);
  },
});

/**
 * サブスクリプション削除・キャンセル時の処理
 */
export const handleSubscriptionDeleted = internalMutation({
  args: {
    subscriptionId: v.string(),
    customerId: v.string(),
  },
  handler: async (ctx, args) => {
    // Customer IDからユーザーを検索
    const user = await ctx.db
      .query("users")
      .withIndex("by_stripeCustomerId", (q) => q.eq("stripeCustomerId", args.customerId))
      .unique();

    if (!user) {
      console.error(`User not found for customerId: ${args.customerId}`);
      return;
    }

    // プランをfreeに戻す
    await ctx.db.patch(user._id, {
      plan: "free",
      subscriptionStatus: "canceled",
    });

    console.log(`Subscription canceled for user: ${user._id}`);
  },
});

/**
 * 支払い失敗時の処理
 */
export const handlePaymentFailed = internalMutation({
  args: {
    customerId: v.string(),
    subscriptionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Customer IDからユーザーを検索
    const user = await ctx.db
      .query("users")
      .withIndex("by_stripeCustomerId", (q) => q.eq("stripeCustomerId", args.customerId))
      .unique();

    if (!user) {
      console.error(`User not found for customerId: ${args.customerId}`);
      return;
    }

    // ステータスを更新
    await ctx.db.patch(user._id, {
      subscriptionStatus: "past_due",
    });

    console.log(`Payment failed for user: ${user._id}`);

    // TODO: ユーザーに通知を送る（notifications テーブルに追加）
  },
});

// ========================================
// Internal Helper Functions (Action用)
// ========================================

/**
 * Clerk IDからユーザーを取得
 */
export const getUserByClerkId = internalQuery({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    return user;
  },
});

/**
 * ユーザーのStripe Customer IDを更新
 */
export const updateStripeCustomerId = internalMutation({
  args: {
    userId: v.id("users"),
    customerId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      stripeCustomerId: args.customerId,
    });
  },
});
