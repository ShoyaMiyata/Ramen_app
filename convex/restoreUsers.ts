import { mutation } from "./_generated/server";
import { v } from "convex/values";

// 元のユーザーデータ（noodlesテーブルから取得したuserIdを使用）
const ORIGINAL_USER_DATA = [
  {
    _id: "js77sahcrddp8csfxnhrbwc7mx7wraaz", // あなた（Shoya Miyata）
    clerkId: "user_36T8JLbaX4WdfYZ7tGNIRTsLZg1",
    name: "Shoya Miyata",
    email: "miyasho20@icloud.com",
    imageUrl: "https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvdXBsb2FkZWQvaW1nXzM2VDl5eTZQYTViZDhFdjJLOW8zT0R1Q0ZrdSJ9",
    isAdmin: true,
    plan: "premium",
    isPrivate: true,
    onboardingComplete: true,
  },
];

export const deleteAllUsers = mutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();

    for (const user of users) {
      await ctx.db.delete(user._id);
    }

    return { deleted: users.length };
  },
});

export const restoreUsersWithOriginalIds = mutation({
  args: {},
  handler: async (ctx) => {
    const restored = [];

    for (const userData of ORIGINAL_USER_DATA) {
      const { _id, ...data } = userData;

      // 指定されたIDでユーザーを作成
      await ctx.db.insert("users", {
        ...data,
        createdAt: Date.now(),
      });

      restored.push(data.email);
    }

    return { restored };
  },
});
