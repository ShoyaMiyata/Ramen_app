import { mutation, query } from "./_generated/server";

/**
 * ClerkIdから新しいuserIdへのマッピングを作成
 */
export const getUserIdMapping = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();

    const mapping: Record<string, { oldId: string; newId: string; clerkId: string; email: string }> = {};

    // ClerkIdごとにマッピング
    for (const user of users) {
      mapping[user.clerkId] = {
        oldId: "", // 手動で設定
        newId: user._id,
        clerkId: user.clerkId,
        email: user.email,
      };
    }

    return mapping;
  },
});

/**
 * noodlesテーブルのuserIdを更新
 */
export const migrateNoodleUserIds = mutation({
  args: {},
  handler: async (ctx) => {
    // マッピング（手動で設定）
    const USER_ID_MAPPING: Record<string, string> = {
      "user_36T8JLbaX4WdfYZ7tGNIRTsLZg1": "js77sahcrddp8csfxnhrbwc7mx7wraaz", // Shoya Miyata
      // 他のユーザーも追加
    };

    // 現在のユーザーを取得して、新しいIDを取得
    const users = await ctx.db.query("users").collect();
    const clerkIdToNewId: Record<string, string> = {};

    for (const user of users) {
      clerkIdToNewId[user.clerkId] = user._id;
    }

    // noodlesを更新
    const noodles = await ctx.db.query("noodles").collect();
    let updated = 0;

    for (const noodle of noodles) {
      // 古いuserIdからclerkIdを見つける
      const oldUserId = noodle.userId;

      // ClerkIdから新しいuserIdを見つける
      for (const [clerkId, expectedOldId] of Object.entries(USER_ID_MAPPING)) {
        if (oldUserId === expectedOldId) {
          const newUserId = clerkIdToNewId[clerkId];

          if (newUserId) {
            await ctx.db.patch(noodle._id, { userId: newUserId });
            updated++;
            break;
          }
        }
      }
    }

    return { updated };
  },
});
