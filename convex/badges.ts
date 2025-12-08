import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { BADGES, HIDDEN_BADGES, ALL_BADGES, type AllBadgeCode } from "../src/lib/constants/badges";

export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const userBadges = await ctx.db
      .query("userBadges")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    return userBadges.map((ub) => ({
      ...ub,
      badge: ALL_BADGES[ub.badgeCode as AllBadgeCode],
    }));
  },
});

export const checkAndAward = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const existingBadges = await ctx.db
      .query("userBadges")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const existingCodes = new Set(existingBadges.map((b) => b.badgeCode));

    // Get user stats
    const noodles = await ctx.db
      .query("noodles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const postCount = noodles.length;
    const uniqueShopIds = [...new Set(noodles.map((n) => n.shopId))];
    const uniqueShops = uniqueShopIds.length;

    // Get shops for prefecture counting
    const shops = await Promise.all(uniqueShopIds.map((id) => ctx.db.get(id)));
    const uniquePrefectures = new Set(
      shops.filter((s) => s?.prefecture).map((s) => s!.prefecture)
    );
    const prefectureCount = uniquePrefectures.size;

    // Count genres
    const genreCounts: Record<string, number> = {};
    for (const noodle of noodles) {
      for (const genre of noodle.genres) {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      }
    }

    // Count high ratings (★5)
    const highRatingCount = noodles.filter((n) => n.evaluation === 5).length;

    // Count received likes
    const allLikes = await ctx.db.query("likes").collect();
    const noodleIds = new Set(noodles.map((n) => n._id));
    const receivedLikes = allLikes.filter((l) => noodleIds.has(l.noodleId)).length;

    // Count comments made by user
    const userComments = await ctx.db
      .query("comments")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    const commentCount = userComments.length;

    // Count following/followers
    const following = await ctx.db
      .query("follows")
      .withIndex("by_followerId", (q) => q.eq("followerId", args.userId))
      .collect();
    const followingCount = following.length;

    const followers = await ctx.db
      .query("follows")
      .withIndex("by_followingId", (q) => q.eq("followingId", args.userId))
      .collect();
    const followerCount = followers.length;

    const newBadges: string[] = [];

    // 全ての麺名を取得（隠しバッジ判定用）
    const allRamenNames = noodles.map((n) => n.ramenName.toLowerCase());

    // Check each badge condition (通常バッジ)
    for (const [code, badge] of Object.entries(BADGES)) {
      if (existingCodes.has(code)) continue;

      let shouldAward = false;

      switch (badge.conditionType) {
        case "post_count":
          shouldAward = postCount >= badge.conditionValue;
          break;
        case "shop_count":
          shouldAward = uniqueShops >= badge.conditionValue;
          break;
        case "genre_count":
          if (badge.conditionGenre) {
            shouldAward =
              (genreCounts[badge.conditionGenre] || 0) >= badge.conditionValue;
          }
          break;
        case "all_genres":
          const allGenres = [
            "醤油",
            "塩",
            "味噌",
            "とんこつ",
            "家系",
            "二郎系",
            "魚介",
            "煮干し",
            "つけ麺",
            "担々麺",
            "鶏白湯",
            "その他",
          ];
          shouldAward = allGenres.every((g) => (genreCounts[g] || 0) >= 1);
          break;
        case "received_likes":
          shouldAward = receivedLikes >= badge.conditionValue;
          break;
        case "prefecture_count":
          shouldAward = prefectureCount >= badge.conditionValue;
          break;
        case "prefecture_complete":
          // 47都道府県すべてで食べた
          shouldAward = prefectureCount >= 47;
          break;
        case "high_rating_count":
          shouldAward = highRatingCount >= badge.conditionValue;
          break;
        case "comment_count":
          shouldAward = commentCount >= badge.conditionValue;
          break;
        case "following_count":
          shouldAward = followingCount >= badge.conditionValue;
          break;
        case "follower_count":
          shouldAward = followerCount >= badge.conditionValue;
          break;
      }

      if (shouldAward) {
        await ctx.db.insert("userBadges", {
          userId: args.userId,
          badgeCode: code,
          acquiredAt: Date.now(),
        });
        newBadges.push(code);
      }
    }

    // 隠しバッジのチェック
    // 獲得済み隠しバッジ数をカウント（ramen_name_containsタイプのみ）
    const existingHiddenBadgeCount = existingBadges.filter((b) => {
      const badge = HIDDEN_BADGES[b.badgeCode as keyof typeof HIDDEN_BADGES];
      return badge && badge.conditionType === "ramen_name_contains";
    }).length;

    let newHiddenBadgeCount = 0;
    const newHiddenBadgeCodes: string[] = [];

    for (const [code, badge] of Object.entries(HIDDEN_BADGES)) {
      if (existingCodes.has(code)) continue;

      let shouldAward = false;

      if (badge.conditionType === "ramen_name_contains" && badge.keywords) {
        // キーワードが麺名に含まれているかチェック
        shouldAward = allRamenNames.some((name) =>
          badge.keywords!.some((keyword) => name.includes(keyword.toLowerCase()))
        );
        if (shouldAward) {
          newHiddenBadgeCount++;
        }
      } else if (badge.conditionType === "hidden_badge_count") {
        // 隠しバッジ獲得数をチェック
        const totalHiddenBadges = existingHiddenBadgeCount + newHiddenBadgeCount;
        shouldAward = totalHiddenBadges >= badge.conditionValue;
      }

      if (shouldAward) {
        await ctx.db.insert("userBadges", {
          userId: args.userId,
          badgeCode: code,
          acquiredAt: Date.now(),
        });
        newBadges.push(code);
        if (badge.conditionType === "ramen_name_contains") {
          newHiddenBadgeCodes.push(code);
        }
        existingCodes.add(code); // 重複防止
      }
    }

    // ramen_name_containsタイプの隠しバッジの総数
    const totalBaseHiddenBadges = Object.values(HIDDEN_BADGES).filter(
      (b) => b.conditionType === "ramen_name_contains"
    ).length;

    // 獲得済み隠しバッジの総数（新規獲得を含む）
    const totalEarnedHiddenBadges = existingHiddenBadgeCount + newHiddenBadgeCount;

    return {
      newBadges,
      hiddenBadgeInfo: {
        newHiddenBadges: newHiddenBadgeCodes,
        totalEarned: totalEarnedHiddenBadges,
        totalAvailable: totalBaseHiddenBadges,
      },
    };
  },
});
