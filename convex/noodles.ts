import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// フォロー機能が有効かどうかを確認するヘルパー
async function isFollowEnabled(ctx: { db: any }) {
  const setting = await ctx.db
    .query("appSettings")
    .withIndex("by_key", (q: any) => q.eq("key", "followEnabled"))
    .unique();

  // 設定がない場合はデフォルトで有効
  if (!setting) return true;

  try {
    return JSON.parse(setting.value) === true;
  } catch {
    return true;
  }
}

export const list = query({
  args: {
    genres: v.optional(v.array(v.string())),
    searchText: v.optional(v.string()),
    sortBy: v.optional(
      v.union(v.literal("newest"), v.literal("rating"), v.literal("visitDate"))
    ),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    viewerId: v.optional(v.id("users")), // 閲覧者のID（鍵アカウントフィルタ用）
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    const offset = args.offset ?? 0;

    let noodles = await ctx.db.query("noodles").order("desc").collect();

    // ユーザー情報を取得（後でエンリッチメントにも使用）
    const users = await ctx.db.query("users").collect();
    const userMap = new Map(users.map((u) => [u._id, u]));

    // フォロー機能が無効の場合は鍵アカウントのフィルタリングをスキップ
    const followEnabled = await isFollowEnabled(ctx);

    if (followEnabled) {
      // 閲覧者がフォローしているユーザーのIDを取得
      let followingIds: Set<string> = new Set();
      if (args.viewerId) {
        const following = await ctx.db
          .query("follows")
          .withIndex("by_followerId", (q) => q.eq("followerId", args.viewerId!))
          .collect();
        followingIds = new Set(following.map((f) => f.followingId));
      }

      // 鍵アカウントのユーザーの投稿を除外（自分・フォロー中は除く）
      noodles = noodles.filter((noodle) => {
        const noodleUser = userMap.get(noodle.userId);
        if (!noodleUser) return false;

        // 公開アカウントは表示
        if (!noodleUser.isPrivate) return true;

        // 自分の投稿は表示
        if (args.viewerId && noodle.userId === args.viewerId) return true;

        // フォローしているユーザーの投稿は表示
        if (args.viewerId && followingIds.has(noodle.userId)) return true;

        // それ以外の鍵アカウントの投稿は非表示
        return false;
      });
    }

    // Filter by genres
    if (args.genres && args.genres.length > 0) {
      noodles = noodles.filter((noodle) =>
        args.genres!.some((genre) => noodle.genres.includes(genre))
      );
    }

    // Filter by search text (shop name or ramen name)
    if (args.searchText) {
      const searchLower = args.searchText.toLowerCase();
      const shops = await ctx.db.query("shops").collect();
      const shopMap = new Map(shops.map((s) => [s._id, s.name]));

      noodles = noodles.filter((noodle) => {
        const shopName = shopMap.get(noodle.shopId) || "";
        return (
          noodle.ramenName.toLowerCase().includes(searchLower) ||
          shopName.toLowerCase().includes(searchLower)
        );
      });
    }

    // Sort
    if (args.sortBy === "rating") {
      noodles.sort((a, b) => (b.evaluation || 0) - (a.evaluation || 0));
    } else if (args.sortBy === "visitDate") {
      noodles.sort((a, b) => (b.visitDate || 0) - (a.visitDate || 0));
    }

    // Total count before pagination
    const totalCount = noodles.length;

    // Apply pagination
    const paginatedNoodles = noodles.slice(offset, offset + limit);
    const hasMore = offset + limit < totalCount;

    // Enrich with user and shop data and image URLs
    const shops = await ctx.db.query("shops").collect();
    const shopMap = new Map(shops.map((s) => [s._id, s]));

    const items = await Promise.all(
      paginatedNoodles.map(async (noodle) => {
        // 複数画像を優先、なければ単一画像にフォールバック
        let imageUrl: string | null = null;
        let imageUrls: string[] = [];

        if (noodle.imageIds && noodle.imageIds.length > 0) {
          const urls = await Promise.all(
            noodle.imageIds.map((id) => ctx.storage.getUrl(id))
          );
          imageUrls = urls.filter((url): url is string => url !== null);
          imageUrl = imageUrls[0] || null;
        } else if (noodle.imageId) {
          imageUrl = await ctx.storage.getUrl(noodle.imageId);
          if (imageUrl) imageUrls = [imageUrl];
        }

        return {
          ...noodle,
          user: userMap.get(noodle.userId),
          shop: shopMap.get(noodle.shopId),
          imageUrl,
          imageUrls,
        };
      })
    );

    return {
      items,
      totalCount,
      hasMore,
      nextOffset: hasMore ? offset + limit : null,
    };
  },
});

export const getById = query({
  args: { id: v.id("noodles") },
  handler: async (ctx, args) => {
    const noodle = await ctx.db.get(args.id);
    if (!noodle) return null;

    const user = await ctx.db.get(noodle.userId);
    const shop = await ctx.db.get(noodle.shopId);

    // 複数画像を優先、なければ単一画像にフォールバック
    let imageUrl: string | null = null;
    let imageUrls: string[] = [];

    if (noodle.imageIds && noodle.imageIds.length > 0) {
      const urls = await Promise.all(
        noodle.imageIds.map((id) => ctx.storage.getUrl(id))
      );
      imageUrls = urls.filter((url): url is string => url !== null);
      imageUrl = imageUrls[0] || null;
    } else if (noodle.imageId) {
      imageUrl = await ctx.storage.getUrl(noodle.imageId);
      if (imageUrl) imageUrls = [imageUrl];
    }

    return {
      ...noodle,
      user,
      shop,
      imageUrl,
      imageUrls,
    };
  },
});

export const getByUser = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    const offset = args.offset ?? 0;

    const allNoodles = await ctx.db
      .query("noodles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    const totalCount = allNoodles.length;
    const noodles = allNoodles.slice(offset, offset + limit);
    const hasMore = offset + limit < totalCount;

    const shops = await ctx.db.query("shops").collect();
    const shopMap = new Map(shops.map((s) => [s._id, s]));

    const results = await Promise.all(
      noodles.map(async (noodle) => {
        // 複数画像を優先、なければ単一画像にフォールバック
        let imageUrl: string | null = null;
        let imageUrls: string[] = [];

        if (noodle.imageIds && noodle.imageIds.length > 0) {
          const urls = await Promise.all(
            noodle.imageIds.map((id) => ctx.storage.getUrl(id))
          );
          imageUrls = urls.filter((url): url is string => url !== null);
          imageUrl = imageUrls[0] || null;
        } else if (noodle.imageId) {
          imageUrl = await ctx.storage.getUrl(noodle.imageId);
          if (imageUrl) imageUrls = [imageUrl];
        }

        return {
          ...noodle,
          shop: shopMap.get(noodle.shopId),
          imageUrl,
          imageUrls,
        };
      })
    );

    return {
      items: results,
      totalCount,
      hasMore,
      nextOffset: hasMore ? offset + limit : null,
    };
  },
});

// ギャラリー用：写真付きの記録のみ取得
export const getGalleryByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const noodles = await ctx.db
      .query("noodles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    // 画像あり（imageIds または imageId）のみ
    const withImages = noodles.filter((n) => (n.imageIds && n.imageIds.length > 0) || n.imageId);

    const shops = await ctx.db.query("shops").collect();
    const shopMap = new Map(shops.map((s) => [s._id, s]));

    const results = await Promise.all(
      withImages.map(async (noodle) => {
        let imageUrl: string | null = null;
        let imageUrls: string[] = [];

        if (noodle.imageIds && noodle.imageIds.length > 0) {
          const urls = await Promise.all(
            noodle.imageIds.map((id) => ctx.storage.getUrl(id))
          );
          imageUrls = urls.filter((url): url is string => url !== null);
          imageUrl = imageUrls[0] || null;
        } else if (noodle.imageId) {
          imageUrl = await ctx.storage.getUrl(noodle.imageId);
          if (imageUrl) imageUrls = [imageUrl];
        }

        return {
          ...noodle,
          shop: shopMap.get(noodle.shopId),
          imageUrl,
          imageUrls,
        };
      })
    );

    return results;
  },
});

export const create = mutation({
  args: {
    userId: v.id("users"),
    shopId: v.id("shops"),
    ramenName: v.string(),
    genres: v.array(v.string()),
    visitDate: v.optional(v.number()),
    comment: v.optional(v.string()),
    evaluation: v.optional(v.number()),
    imageId: v.optional(v.id("_storage")), // 後方互換用
    imageIds: v.optional(v.array(v.id("_storage"))), // 複数画像（最大5枚）
  },
  handler: async (ctx, args) => {
    // 投稿を作成
    const noodleId = await ctx.db.insert("noodles", {
      userId: args.userId,
      shopId: args.shopId,
      ramenName: args.ramenName,
      genres: args.genres,
      visitDate: args.visitDate,
      comment: args.comment,
      evaluation: args.evaluation,
      imageId: args.imageId,
      imageIds: args.imageIds,
      createdAt: Date.now(),
    });

    // ガチャチケット付与（1投稿 = 1チケット）
    const existingTickets = await ctx.db
      .query("gachaTickets")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (existingTickets) {
      await ctx.db.patch(existingTickets._id, {
        ticketCount: existingTickets.ticketCount + 1,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("gachaTickets", {
        userId: args.userId,
        ticketCount: 1,
        updatedAt: Date.now(),
      });
    }

    // 店舗の都道府県を取得してバッジチェック
    const shop = await ctx.db.get(args.shopId);
    let badgeResult = null;
    if (shop?.prefecture) {
      // インラインでバッジチェックを実行
      const noodles = await ctx.db
        .query("noodles")
        .withIndex("by_userId", (q) => q.eq("userId", args.userId))
        .collect();

      const shopIds = [...new Set(noodles.map((n) => n.shopId))];
      const shops = await Promise.all(shopIds.map((id) => ctx.db.get(id)));

      const prefectureShopCount = shops.filter(
        (s) => s?.prefecture === shop.prefecture
      ).length;

      const getTier = (count: number) => {
        if (count >= 10) return "gold";
        if (count >= 5) return "silver";
        if (count >= 1) return "bronze";
        return null;
      };

      const newTier = getTier(prefectureShopCount);
      if (newTier) {
        const prefecture = shop.prefecture;
        const existingBadge = await ctx.db
          .query("prefectureBadges")
          .withIndex("by_userId_prefecture", (q) =>
            q.eq("userId", args.userId).eq("prefecture", prefecture)
          )
          .first();

        const now = Date.now();

        if (existingBadge) {
          const tierRank = { bronze: 1, silver: 2, gold: 3 };
          if (tierRank[newTier as keyof typeof tierRank] > tierRank[existingBadge.tier as keyof typeof tierRank]) {
            await ctx.db.patch(existingBadge._id, {
              tier: newTier,
              visitCount: prefectureShopCount,
              updatedAt: now,
            });
            badgeResult = { type: "upgraded" as const, tier: newTier, prefecture: shop.prefecture };
          } else {
            await ctx.db.patch(existingBadge._id, {
              visitCount: prefectureShopCount,
              updatedAt: now,
            });
          }
        } else {
          await ctx.db.insert("prefectureBadges", {
            userId: args.userId,
            prefecture: shop.prefecture,
            tier: newTier,
            visitCount: prefectureShopCount,
            earnedAt: now,
            updatedAt: now,
          });
          badgeResult = { type: "new" as const, tier: newTier, prefecture: shop.prefecture };
        }
      }
    }

    return { noodleId, badgeResult };
  },
});

export const update = mutation({
  args: {
    id: v.id("noodles"),
    userId: v.id("users"),
    shopId: v.id("shops"),
    ramenName: v.string(),
    genres: v.array(v.string()),
    visitDate: v.optional(v.number()),
    comment: v.optional(v.string()),
    evaluation: v.optional(v.number()),
    imageId: v.optional(v.id("_storage")), // 後方互換用
    imageIds: v.optional(v.array(v.id("_storage"))), // 複数画像
    removeImage: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Record not found");
    if (existing.userId !== args.userId) throw new Error("Unauthorized");

    // 画像の処理（複数画像対応）
    let newImageIds: typeof existing.imageIds = existing.imageIds;
    let newImageId: typeof existing.imageId = existing.imageId;

    if (args.removeImage) {
      // 画像全削除の場合
      if (existing.imageIds) {
        for (const id of existing.imageIds) {
          await ctx.storage.delete(id);
        }
      }
      if (existing.imageId) {
        await ctx.storage.delete(existing.imageId);
      }
      newImageIds = undefined;
      newImageId = undefined;
    } else if (args.imageIds !== undefined) {
      // 新しい複数画像が指定された場合
      // 古い画像で新しいリストにないものを削除
      const newIdSet = new Set(args.imageIds);
      if (existing.imageIds) {
        for (const id of existing.imageIds) {
          if (!newIdSet.has(id)) {
            await ctx.storage.delete(id);
          }
        }
      }
      if (existing.imageId && !newIdSet.has(existing.imageId)) {
        await ctx.storage.delete(existing.imageId);
      }
      newImageIds = args.imageIds.length > 0 ? args.imageIds : undefined;
      newImageId = undefined; // imageIds を使う場合は imageId は不要
    } else if (args.imageId && args.imageId !== existing.imageId) {
      // 後方互換: 単一画像の場合
      if (existing.imageId) {
        await ctx.storage.delete(existing.imageId);
      }
      newImageId = args.imageId;
    }

    await ctx.db.patch(args.id, {
      shopId: args.shopId,
      ramenName: args.ramenName,
      genres: args.genres,
      visitDate: args.visitDate,
      comment: args.comment,
      evaluation: args.evaluation,
      imageId: newImageId,
      imageIds: newImageIds,
    });

    return args.id;
  },
});

export const remove = mutation({
  args: {
    id: v.id("noodles"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Record not found");
    if (existing.userId !== args.userId) throw new Error("Unauthorized");

    // Delete images if exist
    if (existing.imageIds) {
      for (const id of existing.imageIds) {
        await ctx.storage.delete(id);
      }
    }
    if (existing.imageId) {
      await ctx.storage.delete(existing.imageId);
    }

    // Delete related likes
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_noodleId", (q) => q.eq("noodleId", args.id))
      .collect();

    for (const like of likes) {
      await ctx.db.delete(like._id);
    }

    // Delete related myBests
    const myBests = await ctx.db.query("myBests").collect();
    for (const myBest of myBests) {
      if (myBest.noodleId === args.id) {
        await ctx.db.delete(myBest._id);
      }
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});

// 画像アップロード用URL生成
export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

// 味覚プロファイル（ジャンル別統計）を取得
export const getTasteProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const noodles = await ctx.db
      .query("noodles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    if (noodles.length === 0) {
      return null;
    }

    // ジャンル別に集計
    const genreStats = new Map<string, { count: number; totalRating: number; ratedCount: number }>();

    for (const noodle of noodles) {
      for (const genre of noodle.genres) {
        const existing = genreStats.get(genre) || { count: 0, totalRating: 0, ratedCount: 0 };
        existing.count++;
        if (noodle.evaluation) {
          existing.totalRating += noodle.evaluation;
          existing.ratedCount++;
        }
        genreStats.set(genre, existing);
      }
    }

    // 配列に変換してソート（投稿数の多い順）
    const totalCount = noodles.length;
    const genres = Array.from(genreStats.entries())
      .map(([code, stats]) => ({
        code,
        count: stats.count,
        percentage: Math.round((stats.count / totalCount) * 100),
        avgRating: stats.ratedCount > 0 ? Math.round((stats.totalRating / stats.ratedCount) * 10) / 10 : null,
      }))
      .sort((a, b) => b.count - a.count);

    const topGenre = genres.length > 0 ? genres[0].code : null;

    return {
      genres,
      totalCount,
      topGenre,
    };
  },
});

// ラーメン名の履歴を取得（サジェスト用）
export const getRamenNameSuggestions = query({
  args: {
    searchText: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const noodles = await ctx.db.query("noodles").collect();

    // ユニークなラーメン名を取得
    const ramenNames = [...new Set(noodles.map((n) => n.ramenName))];

    // 検索テキストでフィルタ
    if (args.searchText && args.searchText.length > 0) {
      const searchLower = args.searchText.toLowerCase();
      return ramenNames
        .filter((name) => name.toLowerCase().includes(searchLower))
        .slice(0, 10);
    }

    // 最近使われたものを優先（出現回数でソート）
    const nameCounts = new Map<string, number>();
    for (const noodle of noodles) {
      nameCounts.set(noodle.ramenName, (nameCounts.get(noodle.ramenName) || 0) + 1);
    }

    return ramenNames
      .sort((a, b) => (nameCounts.get(b) || 0) - (nameCounts.get(a) || 0))
      .slice(0, 10);
  },
});
