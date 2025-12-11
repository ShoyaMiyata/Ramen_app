import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { GACHA_BADGES, getBadgesByRarity } from "../src/lib/constants/gachaBadges";

// 天井カウントの閾値
const PITY_THRESHOLD_4 = 50;  // 50連で★4以上確定
const PITY_THRESHOLD_5 = 100; // 100連で★5確定

/**
 * レアリティ抽選ロジック
 * 累積確率で判定
 */
function drawRarity(counter50: number, counter100: number): number {
  // 天井システム
  if (counter100 >= PITY_THRESHOLD_5) {
    return 5; // ★5確定
  }
  if (counter50 >= PITY_THRESHOLD_4) {
    // ★4以上確定（★4か★5をランダム）
    return Math.random() < 0.9 ? 4 : 5;
  }

  // 通常抽選 - 累積確率で判定
  const random = Math.random() * 100;

  // ★5: 0.5%
  if (random < 0.5) return 5;
  // ★4: 4.5% (累積5%)
  if (random < 5) return 4;
  // ★3: 15% (累積20%)
  if (random < 20) return 3;
  // ★2: 35% (累積55%)
  if (random < 55) return 2;
  // ★1: 45%
  return 1;
}

/**
 * 指定レアリティからランダムにバッジを選択
 */
function selectBadgeFromRarity(rarity: number): {
  code: string;
  name: string;
  icon: string;
  description: string;
  rarity: number;
  category: string;
} {
  const badgesOfRarity = getBadgesByRarity(rarity as 1 | 2 | 3 | 4 | 5);

  if (badgesOfRarity.length === 0) {
    throw new Error(`レアリティ${rarity}のバッジが見つかりません`);
  }

  const randomIndex = Math.floor(Math.random() * badgesOfRarity.length);
  return badgesOfRarity[randomIndex];
}

/**
 * ユーザーのチケット残高を取得
 */
export const getUserTickets = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const ticketData = await ctx.db
      .query("gachaTickets")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    return {
      ticketCount: ticketData?.ticketCount ?? 0,
    };
  },
});

/**
 * デイリーガチャが引けるか確認
 */
export const checkDailyGacha = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    const dailyRecord = await ctx.db
      .query("dailyGacha")
      .withIndex("by_userId_date", (q) =>
        q.eq("userId", args.userId).eq("lastDrawDate", today)
      )
      .first();

    return {
      canDraw: !dailyRecord, // レコードが存在しない = まだ引いていない
      lastDrawDate: dailyRecord?.lastDrawDate ?? null,
    };
  },
});

/**
 * 天井カウンターを取得
 */
export const getPityCounter = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const pityData = await ctx.db
      .query("pityCounter")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    return {
      counter50: pityData?.counter50 ?? 0,
      counter100: pityData?.counter100 ?? 0,
    };
  },
});

/**
 * ガチャ履歴を取得
 */
export const getGachaHistory = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;

    const history = await ctx.db
      .query("gachaHistory")
      .withIndex("by_userId_createdAt", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);

    return history;
  },
});

/**
 * チケット追加（投稿時などに呼ばれる）
 */
export const addTickets = mutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    if (args.amount <= 0) {
      throw new Error("チケット数は1以上である必要があります");
    }

    const existingTickets = await ctx.db
      .query("gachaTickets")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    const now = Date.now();

    if (existingTickets) {
      const newTotal = existingTickets.ticketCount + args.amount;
      await ctx.db.patch(existingTickets._id, {
        ticketCount: newTotal,
        updatedAt: now,
      });
      return { newTotal };
    } else {
      await ctx.db.insert("gachaTickets", {
        userId: args.userId,
        ticketCount: args.amount,
        updatedAt: now,
      });
      return { newTotal: args.amount };
    }
  },
});

/**
 * ガチャを引く（メインロジック）
 */
export const drawGacha = mutation({
  args: {
    userId: v.id("users"),
    gachaType: v.union(v.literal("daily"), v.literal("ticket")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const today = new Date().toISOString().split("T")[0];

    // 1. 引けるか確認
    if (args.gachaType === "daily") {
      const dailyRecord = await ctx.db
        .query("dailyGacha")
        .withIndex("by_userId_date", (q) =>
          q.eq("userId", args.userId).eq("lastDrawDate", today)
        )
        .first();

      if (dailyRecord) {
        throw new Error("本日のデイリーガチャは既に引いています");
      }
    } else if (args.gachaType === "ticket") {
      const ticketData = await ctx.db
        .query("gachaTickets")
        .withIndex("by_userId", (q) => q.eq("userId", args.userId))
        .first();

      if (!ticketData || ticketData.ticketCount < 1) {
        throw new Error("チケットが不足しています");
      }

      // チケット消費
      await ctx.db.patch(ticketData._id, {
        ticketCount: ticketData.ticketCount - 1,
        updatedAt: now,
      });
    }

    // 2. 天井カウンター取得
    let pityData = await ctx.db
      .query("pityCounter")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!pityData) {
      // 初回の場合は作成
      const pityId = await ctx.db.insert("pityCounter", {
        userId: args.userId,
        counter50: 0,
        counter100: 0,
        updatedAt: now,
      });
      pityData = await ctx.db.get(pityId);
      if (!pityData) {
        throw new Error("天井カウンターの作成に失敗しました");
      }
    }

    // 3. レアリティ抽選
    const counter50 = pityData.counter50;
    const counter100 = pityData.counter100;
    const rarity = drawRarity(counter50, counter100);

    // 4. バッジ選択
    const badge = selectBadgeFromRarity(rarity);

    // 5. 既存バッジチェック
    const existingBadge = await ctx.db
      .query("userBadges")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("badgeCode"), badge.code))
      .first();

    const isNew = !existingBadge;

    // 6. 新規バッジなら追加
    if (isNew) {
      await ctx.db.insert("userBadges", {
        userId: args.userId,
        badgeCode: badge.code,
        acquiredAt: now,
      });
    }

    // 7. 天井カウンター更新
    let newCounter50 = counter50 + 1;
    let newCounter100 = counter100 + 1;

    if (rarity >= 5) {
      // ★5が出たら両方リセット
      newCounter50 = 0;
      newCounter100 = 0;
    } else if (rarity >= 4) {
      // ★4が出たら50カウントのみリセット
      newCounter50 = 0;
    }

    await ctx.db.patch(pityData._id, {
      counter50: newCounter50,
      counter100: newCounter100,
      updatedAt: now,
    });

    // 8. ガチャ履歴記録
    await ctx.db.insert("gachaHistory", {
      userId: args.userId,
      badgeCode: badge.code,
      rarity: rarity,
      gachaType: args.gachaType,
      pity_count: counter100 + 1, // 引く前の値+1
      createdAt: now,
    });

    // 9. デイリーガチャの場合は記録更新
    if (args.gachaType === "daily") {
      const existingDaily = await ctx.db
        .query("dailyGacha")
        .withIndex("by_userId", (q) => q.eq("userId", args.userId))
        .first();

      if (existingDaily) {
        await ctx.db.patch(existingDaily._id, {
          lastDrawDate: today,
          drawCount: 1,
        });
      } else {
        await ctx.db.insert("dailyGacha", {
          userId: args.userId,
          lastDrawDate: today,
          drawCount: 1,
        });
      }
    }

    // 10. 結果を返す
    return {
      badge: {
        code: badge.code,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        rarity: badge.rarity,
        category: badge.category,
      },
      isNew,
      pityInfo: {
        counter50: newCounter50,
        counter100: newCounter100,
      },
    };
  },
});

