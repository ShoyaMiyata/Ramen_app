import { query } from "./_generated/server";

/**
 * ランディングページ用の統計情報を取得
 */
export const getLandingStats = query({
  args: {},
  handler: async (ctx) => {
    // ユーザー数を取得
    const users = await ctx.db.query("users").collect();
    const activeUsers = users.filter((u) => !u.deletedAt);
    const userCount = activeUsers.length;

    // 総記録数を取得
    const noodles = await ctx.db.query("noodles").collect();
    const noodleCount = noodles.length;

    // ランクシステムの階位数（固定値）
    const rankLevels = 12;

    return {
      userCount,
      noodleCount,
      rankLevels,
    };
  },
});
