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
    selectedThemeId: v.optional(v.string()), // 選択したテーマID（使用しないが後方互換性のため残す）
    themeTickets: v.optional(v.number()), // テーマチケット数（使用しないが後方互換性のため残す）
    isAdmin: v.optional(v.boolean()), // 管理者フラグ
    onboardingComplete: v.optional(v.boolean()), // 初回セットアップ完了フラグ
    isPrivate: v.optional(v.boolean()), // 鍵アカウントフラグ
    lastTimelineVisit: v.optional(v.number()), // 最後にタイムラインを訪問した日時
    postVisibility: v.optional(v.string()), // "public" | "followers_and_groups" 投稿の公開範囲
    // ログイン情報
    lastLoginAt: v.optional(v.number()), // 最終ログイン日時
    loginCount: v.optional(v.number()), // ログイン回数
    showDolphinsLink: v.optional(v.boolean()), // Dolphinsアプリリンク表示設定
    // Stripe決済情報
    plan: v.optional(v.string()), // "free" | "premium"
    stripeCustomerId: v.optional(v.string()), // Stripe Customer ID
    subscriptionId: v.optional(v.string()), // Stripe Subscription ID
    subscriptionStatus: v.optional(v.string()), // "active" | "canceled" | "past_due" など
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_stripeCustomerId", ["stripeCustomerId"]),

  shops: defineTable({
    name: v.string(),
    address: v.optional(v.string()),
    url: v.optional(v.string()),
    prefecture: v.optional(v.string()), // 都道府県コード ("tokyo", "osaka" など)
    station: v.optional(v.string()), // 最寄り駅名
  })
    .index("by_name", ["name"])
    .index("by_prefecture", ["prefecture"])
    .index("by_station", ["station"]),

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
    // Cloudflare R2画像情報
    r2ImageUrl: v.optional(v.string()), // R2に保存された画像のURL
    r2ImageKey: v.optional(v.string()), // R2のオブジェクトキー（削除時に使用）
    r2ImageUrls: v.optional(v.array(v.string())),
    r2ImageKeys: v.optional(v.array(v.string())),
    groupIds: v.optional(v.array(v.id("groups"))), // グループ共有
    isArchived: v.optional(v.boolean()), // アーカイブフラグ（タイムラインに非表示）
    isDraft: v.optional(v.boolean()), // 下書きフラグ（未公開）
    visibility: v.optional(v.string()), // 公開範囲: "public" | "followers" | "private"
    room: v.optional(v.string()),
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

  // 駅マスタデータ（ユーザー登録駅を蓄積）
  stations: defineTable({
    name: v.string(), // 駅名（例: "渋谷駅"）
    prefecture: v.optional(v.string()), // 都道府県コード
    line: v.optional(v.string()), // 路線名
    registeredBy: v.optional(v.id("users")), // 初回登録ユーザー
    usageCount: v.number(), // 使用回数
    createdAt: v.number(),
  })
    .index("by_name", ["name"])
    .index("by_prefecture", ["prefecture"]),

  // お問い合わせ
  contacts: defineTable({
    name: v.string(), // お問い合わせ者の名前
    email: v.string(), // メールアドレス
    category: v.string(), // "bug" | "feature" | "account" | "subscription" | "other"
    subject: v.string(), // 件名
    message: v.string(), // お問い合わせ内容
    status: v.optional(v.string()), // "new" | "in_progress" | "resolved"
    userId: v.optional(v.id("users")), // ログインユーザーの場合のみ
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_status", ["status"])
    .index("by_createdAt", ["createdAt"]),

  // グループ
  groups: defineTable({
    name: v.string(), // グループ名
    description: v.string(), // 説明
    coverImageId: v.optional(v.id("_storage")), // カバー画像
    creatorId: v.id("users"), // 作成者のユーザーID
    createdAt: v.number(),
    memberCount: v.number(), // メンバー数（キャッシュ）
    noodleCount: v.number(), // 投稿数（キャッシュ）
  })
    .index("by_creator", ["creatorId"])
    .index("by_createdAt", ["createdAt"])
    .searchIndex("search_name", {
      searchField: "name",
      filterFields: ["creatorId"],
    }),

  // グループメンバー
  groupMembers: defineTable({
    groupId: v.id("groups"),
    userId: v.id("users"),
    joinedAt: v.number(),
  })
    .index("by_group", ["groupId"])
    .index("by_user", ["userId"])
    .index("by_group_and_user", ["groupId", "userId"]),

  // ジャンルマスタ
  genres: defineTable({
    code: v.string(), // ジャンルコード（一意）
    label: v.string(), // 表示名
    sortOrder: v.number(), // 表示順
    isActive: v.boolean(), // 有効/無効
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_code", ["code"])
    .index("by_sortOrder", ["sortOrder"])
    .index("by_isActive", ["isActive"]),

  // ジャンル追加申請
  genreRequests: defineTable({
    userId: v.id("users"), // 申請ユーザー
    requestedGenre: v.string(), // 申請されたジャンル名
    reason: v.optional(v.string()), // 申請理由
    status: v.string(), // "pending" | "approved" | "rejected"
    reviewedBy: v.optional(v.id("users")), // 承認/却下した管理者
    reviewedAt: v.optional(v.number()), // 承認/却下日時
    reviewNote: v.optional(v.string()), // 管理者メモ
    finalGenreName: v.optional(v.string()), // 承認時の最終ジャンル名
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_status", ["status"])
    .index("by_createdAt", ["createdAt"]),
});
