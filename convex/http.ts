import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import Stripe from "stripe";
import { internal } from "./_generated/api";

const http = httpRouter();

// Stripe Webhook エンドポイント
http.route({
  path: "/stripe/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    if (!process.env.STRIPE_SECRET_KEY) {
      return new Response("Stripe not configured", { status: 500 });
    }
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-12-15.clover",
    });

    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return new Response("No signature", { status: 400 });
    }

    const body = await request.text();

    let event: Stripe.Event;

    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return new Response("Webhook signature verification failed", {
        status: 400,
      });
    }

    // イベントタイプに応じた処理
    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;

          // サブスクリプション作成時
          if (session.mode === "subscription") {
            await ctx.runMutation(internal.subscriptions.handleCheckoutCompleted, {
              sessionId: session.id,
              customerId: session.customer as string,
              subscriptionId: session.subscription as string,
              clientReferenceId: session.client_reference_id, // Clerk userId
            });
          }
          break;
        }

        case "customer.subscription.updated": {
          const subscription = event.data.object as Stripe.Subscription;

          await ctx.runMutation(internal.subscriptions.handleSubscriptionUpdated, {
            subscriptionId: subscription.id,
            customerId: subscription.customer as string,
            status: subscription.status,
            currentPeriodEnd: (subscription as any).current_period_end,
          });
          break;
        }

        case "customer.subscription.deleted": {
          const subscription = event.data.object as Stripe.Subscription;

          await ctx.runMutation(internal.subscriptions.handleSubscriptionDeleted, {
            subscriptionId: subscription.id,
            customerId: subscription.customer as string,
          });
          break;
        }

        case "invoice.payment_failed": {
          const invoice = event.data.object as Stripe.Invoice;

          await ctx.runMutation(internal.subscriptions.handlePaymentFailed, {
            customerId: invoice.customer as string,
            subscriptionId: (invoice as any).subscription as string | undefined,
          });
          break;
        }

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error processing webhook:", error);
      return new Response("Webhook processing failed", { status: 500 });
    }
  }),
});

export default http;
