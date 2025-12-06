import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.optional(v.string()),
    email: v.string(),
    imageUrl: v.optional(v.string()), // Clerkからの画像URL
    customImageId: v.optional(v.id("_storage")), // ユーザーがアップロードしたカスタム画像
    deletedAt: v.optional(v.number()),
    createdAt: v.optional(v.number()),
    selectedThemeLevel: v.optional(v.number()), // 選択したテーマカラーのランクレベル
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_email", ["email"]),

  shops: defineTable({
    name: v.string(),
    address: v.optional(v.string()),
    url: v.optional(v.string()),
  }).index("by_name", ["name"]),

  noodles: defineTable({
    userId: v.id("users"),
    shopId: v.id("shops"),
    ramenName: v.string(),
    genres: v.array(v.string()),
    visitDate: v.optional(v.number()),
    comment: v.optional(v.string()),
    evaluation: v.optional(v.number()),
    imageId: v.optional(v.id("_storage")),
  })
    .index("by_userId", ["userId"])
    .index("by_shopId", ["shopId"]),

  likes: defineTable({
    userId: v.id("users"),
    noodleId: v.id("noodles"),
  })
    .index("by_userId", ["userId"])
    .index("by_noodleId", ["noodleId"])
    .index("by_userId_noodleId", ["userId", "noodleId"]),

  userBadges: defineTable({
    userId: v.id("users"),
    badgeCode: v.string(),
    acquiredAt: v.number(),
  }).index("by_userId", ["userId"]),

  // マイベストラーメン
  myBests: defineTable({
    userId: v.id("users"),
    category: v.string(), // "overall", "shoyu", "shio", "miso", etc.
    noodleId: v.id("noodles"),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_category", ["userId", "category"]),

  // フォロー関係
  follows: defineTable({
    followerId: v.id("users"), // フォローする人
    followingId: v.id("users"), // フォローされる人
    createdAt: v.number(),
  })
    .index("by_followerId", ["followerId"])
    .index("by_followingId", ["followingId"])
    .index("by_follower_following", ["followerId", "followingId"]),

  // 麺テナンス（改善要望）
  feedbacks: defineTable({
    userId: v.id("users"),
    category: v.string(), // "feature", "bug", "improvement", "other"
    message: v.string(),
    heatLevel: v.number(), // 1-3 熱々度
    steamCount: v.optional(v.number()), // 湯気ボタンの共感数
    createdAt: v.number(),
  }).index("by_createdAt", ["createdAt"]),

  // 湯気（フィードバックへの共感）
  feedbackSteams: defineTable({
    feedbackId: v.id("feedbacks"),
    userId: v.id("users"),
    heatLevel: v.number(), // 1-3 熱々度
    createdAt: v.number(),
  })
    .index("by_feedbackId", ["feedbackId"])
    .index("by_userId_feedbackId", ["userId", "feedbackId"]),
});
