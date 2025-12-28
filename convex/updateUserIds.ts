import { mutation } from "./_generated/server";

/**
 * noodlesテーブルの古いuserIdを新しいuserIdに更新
 */
export const updateNoodleUserIds = mutation({
  args: {},
  handler: async (ctx) => {
    // 古いuserIdから新しいuserIdへのマッピング
    const USER_ID_MAPPING: Record<string, string> = {
      // yuko
      "js73sce5peh0xc1hth3hxwk5bd7wvrcg": "js7ak19fpw4a4fzzdmdjbsfwt57xpt8d",
      // yoshida
      "js7dzek64mnwn8cmndgfmm7nn17wtg6g": "js751bxqxr17wjwyan8zbtg2ex7xp696",
      // Shoya Miyata (miyasho)
      "js77sahcrddp8csfxnhrbwc7mx7wraaz": "js74p31qa5vxwdhgn34gjq3ezh7xqt0d",
    };

    const noodles = await ctx.db.query("noodles").collect();
    let updated = 0;

    for (const noodle of noodles) {
      const oldUserId = noodle.userId;
      const newUserId = USER_ID_MAPPING[oldUserId];

      if (newUserId) {
        await ctx.db.patch(noodle._id, { userId: newUserId });
        updated++;
      }
    }

    return {
      total: noodles.length,
      updated,
      message: `Updated ${updated} noodles`
    };
  },
});
