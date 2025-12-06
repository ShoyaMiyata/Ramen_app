export type BadgeRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export type BadgeConditionType =
  | "post_count"
  | "shop_count"
  | "genre_count"
  | "all_genres"
  | "received_likes"
  | "streak_days";

export interface Badge {
  code: string;
  name: string;
  description: string;
  icon: string;
  rarity: BadgeRarity;
  conditionType: BadgeConditionType;
  conditionValue: number;
  conditionGenre?: string;
}

export const BADGES = {
  // Post badges
  FIRST_POST: {
    code: "FIRST_POST",
    name: "はじめの一杯",
    description: "初めての投稿",
    icon: "Soup",
    rarity: "common" as const,
    conditionType: "post_count" as const,
    conditionValue: 1,
  },
  REGULAR: {
    code: "REGULAR",
    name: "常連さん",
    description: "10投稿達成",
    icon: "Home",
    rarity: "common" as const,
    conditionType: "post_count" as const,
    conditionValue: 10,
  },
  CONNOISSEUR: {
    code: "CONNOISSEUR",
    name: "ラーメン通",
    description: "50投稿達成",
    icon: "FileText",
    rarity: "uncommon" as const,
    conditionType: "post_count" as const,
    conditionValue: 50,
  },
  RECORD_KEEPER: {
    code: "RECORD_KEEPER",
    name: "記録魔",
    description: "100投稿達成",
    icon: "Library",
    rarity: "rare" as const,
    conditionType: "post_count" as const,
    conditionValue: 100,
  },
  LEGEND: {
    code: "LEGEND",
    name: "レジェンド",
    description: "500投稿達成",
    icon: "Crown",
    rarity: "legendary" as const,
    conditionType: "post_count" as const,
    conditionValue: 500,
  },

  // Exploration badges
  ADVENTURER: {
    code: "ADVENTURER",
    name: "冒険家",
    description: "10店舗訪問",
    icon: "Map",
    rarity: "uncommon" as const,
    conditionType: "shop_count" as const,
    conditionValue: 10,
  },
  PIONEER: {
    code: "PIONEER",
    name: "開拓者",
    description: "50店舗訪問",
    icon: "Compass",
    rarity: "rare" as const,
    conditionType: "shop_count" as const,
    conditionValue: 50,
  },
  NATIONAL_CONQUEST: {
    code: "NATIONAL_CONQUEST",
    name: "全国制覇",
    description: "100店舗訪問",
    icon: "Trophy",
    rarity: "epic" as const,
    conditionType: "shop_count" as const,
    conditionValue: 100,
  },

  // Genre badges
  SHOYU_MASTER: {
    code: "SHOYU_MASTER",
    name: "醤油マスター",
    description: "醤油ラーメン20杯",
    icon: "Droplet",
    rarity: "epic" as const,
    conditionType: "genre_count" as const,
    conditionValue: 20,
    conditionGenre: "醤油",
  },
  SHIO_MASTER: {
    code: "SHIO_MASTER",
    name: "塩の達人",
    description: "塩ラーメン20杯",
    icon: "Sparkles",
    rarity: "epic" as const,
    conditionType: "genre_count" as const,
    conditionValue: 20,
    conditionGenre: "塩",
  },
  MISO_MASTER: {
    code: "MISO_MASTER",
    name: "味噌職人",
    description: "味噌ラーメン20杯",
    icon: "Flame",
    rarity: "epic" as const,
    conditionType: "genre_count" as const,
    conditionValue: 20,
    conditionGenre: "味噌",
  },
  TONKOTSU_MASTER: {
    code: "TONKOTSU_MASTER",
    name: "とんこつ狂",
    description: "とんこつ20杯",
    icon: "Bone",
    rarity: "epic" as const,
    conditionType: "genre_count" as const,
    conditionValue: 20,
    conditionGenre: "とんこつ",
  },
  IEKEI_MASTER: {
    code: "IEKEI_MASTER",
    name: "家系信者",
    description: "家系20杯",
    icon: "Store",
    rarity: "epic" as const,
    conditionType: "genre_count" as const,
    conditionValue: 20,
    conditionGenre: "家系",
  },
  JIRO_MASTER: {
    code: "JIRO_MASTER",
    name: "二郎戦士",
    description: "二郎系20杯",
    icon: "Dumbbell",
    rarity: "epic" as const,
    conditionType: "genre_count" as const,
    conditionValue: 20,
    conditionGenre: "二郎系",
  },
  ALL_ROUNDER: {
    code: "ALL_ROUNDER",
    name: "オールラウンダー",
    description: "全ジャンル制覇",
    icon: "Rainbow",
    rarity: "legendary" as const,
    conditionType: "all_genres" as const,
    conditionValue: 1,
  },

  // Special badges
  CONNOISSEUR_EYE: {
    code: "CONNOISSEUR_EYE",
    name: "目利き",
    description: "お気に入りされた数10回",
    icon: "Eye",
    rarity: "rare" as const,
    conditionType: "received_likes" as const,
    conditionValue: 10,
  },
  INFLUENCER: {
    code: "INFLUENCER",
    name: "インフルエンサー",
    description: "お気に入りされた数50回",
    icon: "Star",
    rarity: "epic" as const,
    conditionType: "received_likes" as const,
    conditionValue: 50,
  },
} as const;

export type BadgeCode = keyof typeof BADGES;
