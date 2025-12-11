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
    isAdmin: v.optional(v.boolean()), // 管理者フラグ
    onboardingComplete: v.optional(v.boolean()), // 初回セットアップ完了フラグ
    isPrivate: v.optional(v.boolean()), // 鍵アカウントフラグ
    lastTimelineVisit: v.optional(v.number()), // 最後にタイムラインを訪問した日時
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_email", ["email"]),

  shops: defineTable({
    name: v.string(),
    address: v.optional(v.string()),
    url: v.optional(v.string()),
    prefecture: v.optional(v.string()), // 都道府県コード ("tokyo", "osaka" など)
  })
    .index("by_name", ["name"])
    .index("by_prefecture", ["prefecture"]),

  noodles: defineTable({
    userId: v.id("users"),
    shopId: v.id("shops"),
    ramenName: v.string(),
    genres: v.array(v.string()),
    visitDate: v.optional(v.number()),
    comment: v.optional(v.string()),
    evaluation: v.optional(v.number()),
    imageId: v.optional(v.id("_storage")), // 単一画像（後方互換）
    imageIds: v.optional(v.array(v.id("_storage"))), // 複数画像（最大5枚）
    createdAt: v.optional(v.number()), // 作成日時（ソート用）
  })
    .index("by_userId", ["userId"])
    .index("by_shopId", ["shopId"])
    .index("by_evaluation", ["evaluation"])
    .index("by_visitDate", ["visitDate"]),

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

  // フォローリクエスト（鍵アカウント用）
  followRequests: defineTable({
    requesterId: v.id("users"), // リクエストする人
    targetId: v.id("users"), // リクエストされる人
    status: v.string(), // "pending" | "approved" | "rejected"
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_requesterId", ["requesterId"])
    .index("by_targetId", ["targetId"])
    .index("by_requester_target", ["requesterId", "targetId"])
    .index("by_targetId_status", ["targetId", "status"]),

  // 麺テナンス（改善要望）
  feedbacks: defineTable({
    userId: v.id("users"),
    category: v.string(), // "feature", "bug", "improvement", "other"
    message: v.string(),
    heatLevel: v.number(), // 1-3 熱々度
    steamCount: v.optional(v.number()), // 湯気ボタンの共感数
    status: v.optional(v.string()), // "new" | "in_progress" | "resolved" | "rejected"
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

  // 通知
  notifications: defineTable({
    userId: v.id("users"), // 通知を受け取るユーザー
    type: v.string(), // "follow", "like", "comment", "message", "admin_announcement" など
    fromUserId: v.optional(v.id("users")), // 通知を発生させたユーザー（管理者通知はなし）
    targetId: v.optional(v.string()), // 対象のID（noodleIdなど）
    title: v.optional(v.string()), // 管理者通知用タイトル
    message: v.optional(v.string()), // 管理者通知用メッセージ
    isRead: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_isRead", ["userId", "isRead"]),

  // アプリ設定（グローバル設定）
  appSettings: defineTable({
    key: v.string(), // 設定キー（"followEnabled" など）
    value: v.string(), // 設定値（JSON文字列）
    updatedAt: v.number(),
    updatedBy: v.optional(v.id("users")), // 更新した管理者
  }).index("by_key", ["key"]),

  // 投稿へのコメント
  comments: defineTable({
    noodleId: v.id("noodles"), // 投稿ID
    userId: v.id("users"), // コメントしたユーザー
    content: v.string(), // コメント内容
    createdAt: v.number(),
  })
    .index("by_noodleId", ["noodleId"])
    .index("by_userId", ["userId"]),

  // コメントへのいいね
  commentLikes: defineTable({
    userId: v.id("users"),
    commentId: v.id("comments"),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_commentId", ["commentId"])
    .index("by_userId_commentId", ["userId", "commentId"]),

  // チャットルーム（1対1）
  chatRooms: defineTable({
    participants: v.array(v.id("users")), // 参加者2名
    lastMessageAt: v.optional(v.number()), // 最終メッセージ日時
    createdAt: v.number(),
  })
    .index("by_lastMessageAt", ["lastMessageAt"]),

  // チャットメッセージ
  chatMessages: defineTable({
    roomId: v.id("chatRooms"), // チャットルームID
    senderId: v.id("users"), // 送信者
    content: v.string(), // メッセージ内容
    isRead: v.boolean(), // 既読フラグ
    createdAt: v.number(),
  })
    .index("by_roomId", ["roomId"])
    .index("by_roomId_createdAt", ["roomId", "createdAt"])
    .index("by_roomId_isRead", ["roomId", "isRead"]),

  // 都道府県バッジ
  prefectureBadges: defineTable({
    userId: v.id("users"),
    prefecture: v.string(), // "tokyo", "osaka" など
    tier: v.string(), // "bronze" | "silver" | "gold"
    visitCount: v.number(), // 訪問店舗数
    earnedAt: v.number(), // 初回獲得日時
    updatedAt: v.number(), // 更新日時
  })
    .index("by_userId", ["userId"])
    .index("by_userId_prefecture", ["userId", "prefecture"]),

  // ガチャで入手可能なバッジ定義
  gachaBadges: defineTable({
    code: v.string(), // バッジコード（"gacha_ramen_master"など）
    name: v.string(), // バッジ名
    description: v.string(), // 説明
    icon: v.string(), // アイコン絵文字
    rarity: v.number(), // 1-5のレアリティ
    dropRate: v.number(), // 排出確率（％）
    category: v.string(), // "food" | "chef" | "special"
  })
    .index("by_rarity", ["rarity"])
    .index("by_code", ["code"]),

  // ガチャチケット残高
  gachaTickets: defineTable({
    userId: v.id("users"),
    ticketCount: v.number(), // 所持チケット数
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  // ガチャ履歴
  gachaHistory: defineTable({
    userId: v.id("users"),
    badgeCode: v.string(), // 排出されたバッジコード
    rarity: v.number(), // レアリティ
    gachaType: v.string(), // "daily" | "ticket" | "special"
    pity_count: v.optional(v.number()), // 天井カウント
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_createdAt", ["userId", "createdAt"]),

  // デイリーガチャ記録
  dailyGacha: defineTable({
    userId: v.id("users"),
    lastDrawDate: v.string(), // "2025-12-11" 形式
    drawCount: v.number(), // その日の引いた回数
  })
    .index("by_userId", ["userId"])
    .index("by_userId_date", ["userId", "lastDrawDate"]),

  // 天井カウンター
  pityCounter: defineTable({
    userId: v.id("users"),
    counter50: v.number(), // 50連カウント（★4確定）
    counter100: v.number(), // 100連カウント（★5確定）
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),
});
