export type GachaBadgeRarity = 1 | 2 | 3 | 4 | 5;

export interface GachaBadge {
  code: string;
  name: string;
  description: string;
  icon: string; // 絵文字
  rarity: GachaBadgeRarity;
  dropRate: number; // パーセント
  category: "food" | "chef" | "special";
}

export const GACHA_BADGES: Record<string, GachaBadge> = {
  // ★5 (SSR) - 3%
  ramen_god: {
    code: "ramen_god",
    name: "ラーメン神",
    description: "ラーメンの神に選ばれし者。全てのラーメンを極めた究極の称号",
    icon: "🍜",
    rarity: 5,
    dropRate: 1.0,
    category: "special",
  },
  legendary_king: {
    code: "legendary_king",
    name: "伝説のラーメン王",
    description: "歴史に名を刻む伝説のラーメン王。その名は全国に轟く",
    icon: "👑",
    rarity: 5,
    dropRate: 1.0,
    category: "special",
  },
  noodle_champion: {
    code: "noodle_champion",
    name: "麺の覇者",
    description: "麺の世界を制した絶対王者。完璧なる麺道を極めし者",
    icon: "⚡",
    rarity: 5,
    dropRate: 1.0,
    category: "special",
  },

  // ★4 (SR) - 12%
  ramen_critic: {
    code: "ramen_critic",
    name: "ラーメン評論家",
    description: "鋭い舌と深い知識を持つラーメン評論のプロフェッショナル",
    icon: "📚",
    rarity: 4,
    dropRate: 2.0,
    category: "chef",
  },
  noodle_meister: {
    code: "noodle_meister",
    name: "麺マイスター",
    description: "麺の製法を知り尽くした麺打ちの達人",
    icon: "🎓",
    rarity: 4,
    dropRate: 2.0,
    category: "chef",
  },
  soup_master: {
    code: "soup_master",
    name: "スープの達人",
    description: "完璧なスープを作り出す秘伝の技を持つ料理人",
    icon: "🔥",
    rarity: 4,
    dropRate: 2.0,
    category: "chef",
  },
  ramen_explorer: {
    code: "ramen_explorer",
    name: "ラーメン探求者",
    description: "全国のラーメン店を渡り歩く冒険者",
    icon: "🗺️",
    rarity: 4,
    dropRate: 2.0,
    category: "special",
  },
  golden_chopsticks: {
    code: "golden_chopsticks",
    name: "黄金の箸使い",
    description: "神業の箸さばきで麺をすくう伝説の技術者",
    icon: "🥢",
    rarity: 4,
    dropRate: 2.0,
    category: "special",
  },
  ultimate_taster: {
    code: "ultimate_taster",
    name: "究極の味覚",
    description: "一口で全ての素材を見抜く超人的な味覚の持ち主",
    icon: "👅",
    rarity: 4,
    dropRate: 2.0,
    category: "chef",
  },

  // ★3 (R) - 30%
  ramen_connoisseur: {
    code: "ramen_connoisseur",
    name: "ラーメン通",
    description: "豊富な知識と経験を持つラーメン愛好家",
    icon: "🎯",
    rarity: 3,
    dropRate: 3.0,
    category: "food",
  },
  soup_craftsman: {
    code: "soup_craftsman",
    name: "スープ職人",
    description: "こだわりのスープを作る技術を持つ職人",
    icon: "🍲",
    rarity: 3,
    dropRate: 3.0,
    category: "chef",
  },
  noodle_artist: {
    code: "noodle_artist",
    name: "麺芸術家",
    description: "美しい麺を生み出すアーティスト",
    icon: "🎨",
    rarity: 3,
    dropRate: 3.0,
    category: "chef",
  },
  topping_master: {
    code: "topping_master",
    name: "トッピングマスター",
    description: "完璧なトッピングバランスを追求する専門家",
    icon: "🥚",
    rarity: 3,
    dropRate: 3.0,
    category: "food",
  },
  broth_scholar: {
    code: "broth_scholar",
    name: "出汁研究家",
    description: "出汁の科学を研究する学者",
    icon: "🔬",
    rarity: 3,
    dropRate: 3.0,
    category: "chef",
  },
  spicy_specialist: {
    code: "spicy_specialist",
    name: "激辛スペシャリスト",
    description: "辛さの限界に挑む勇敢なチャレンジャー",
    icon: "🌶️",
    rarity: 3,
    dropRate: 3.0,
    category: "food",
  },
  rich_lover: {
    code: "rich_lover",
    name: "濃厚ラバー",
    description: "こってり濃厚スープを愛する情熱家",
    icon: "💪",
    rarity: 3,
    dropRate: 3.0,
    category: "food",
  },
  light_seeker: {
    code: "light_seeker",
    name: "あっさり求道者",
    description: "清らかなあっさりスープの真髄を追い求める者",
    icon: "🕊️",
    rarity: 3,
    dropRate: 3.0,
    category: "food",
  },
  night_ramener: {
    code: "night_ramener",
    name: "深夜のラーメナー",
    description: "夜な夜なラーメンを求めてさまよう夜行性の探求者",
    icon: "🌙",
    rarity: 3,
    dropRate: 3.0,
    category: "special",
  },
  weekend_warrior: {
    code: "weekend_warrior",
    name: "週末の戦士",
    description: "週末に全てをかけてラーメン巡りをする勇者",
    icon: "⚔️",
    rarity: 3,
    dropRate: 3.0,
    category: "special",
  },

  // ★2 (C) - 35%
  ramen_lover: {
    code: "ramen_lover",
    name: "ラーメン好き",
    description: "ラーメンを心から愛する人",
    icon: "❤️",
    rarity: 2,
    dropRate: 3.5,
    category: "food",
  },
  noodle_fan: {
    code: "noodle_fan",
    name: "麺好き",
    description: "麺の食感を楽しむファン",
    icon: "😋",
    rarity: 2,
    dropRate: 3.5,
    category: "food",
  },
  soup_enthusiast: {
    code: "soup_enthusiast",
    name: "スープ愛好家",
    description: "スープの深みを味わう愛好家",
    icon: "🥄",
    rarity: 2,
    dropRate: 3.5,
    category: "food",
  },
  topping_collector: {
    code: "topping_collector",
    name: "トッピングコレクター",
    description: "様々なトッピングを試すのが好きな人",
    icon: "🎁",
    rarity: 2,
    dropRate: 3.5,
    category: "food",
  },
  taste_hunter: {
    code: "taste_hunter",
    name: "味覚ハンター",
    description: "新しい味を探し求める冒険者",
    icon: "🎪",
    rarity: 2,
    dropRate: 3.5,
    category: "special",
  },
  lunch_regular: {
    code: "lunch_regular",
    name: "ランチ常連",
    description: "昼時にはいつもラーメンを選ぶ人",
    icon: "🕐",
    rarity: 2,
    dropRate: 3.5,
    category: "special",
  },
  slurp_champion: {
    code: "slurp_champion",
    name: "すすりチャンピオン",
    description: "豪快に麺をすする技術を持つ者",
    icon: "💨",
    rarity: 2,
    dropRate: 3.5,
    category: "special",
  },
  gyoza_partner: {
    code: "gyoza_partner",
    name: "餃子パートナー",
    description: "ラーメンには必ず餃子を頼む定番派",
    icon: "🥟",
    rarity: 2,
    dropRate: 3.5,
    category: "food",
  },
  rice_combo_lover: {
    code: "rice_combo_lover",
    name: "ライスセット愛好家",
    description: "ラーメンとライスの黄金コンボを愛する者",
    icon: "🍚",
    rarity: 2,
    dropRate: 3.5,
    category: "food",
  },
  local_explorer: {
    code: "local_explorer",
    name: "ご当地探索者",
    description: "各地の名物ラーメンを探す旅人",
    icon: "🚶",
    rarity: 2,
    dropRate: 3.5,
    category: "special",
  },

  // ★1 (N) - 20%
  ramen_beginner: {
    code: "ramen_beginner",
    name: "ラーメン初心者",
    description: "ラーメンの世界に足を踏み入れたばかりの新人",
    icon: "🐣",
    rarity: 1,
    dropRate: 3.33,
    category: "food",
  },
  noodle_newbie: {
    code: "noodle_newbie",
    name: "麺入門者",
    description: "麺の魅力を知り始めた初心者",
    icon: "🌱",
    rarity: 1,
    dropRate: 3.33,
    category: "food",
  },
  soup_student: {
    code: "soup_student",
    name: "スープ学生",
    description: "スープの奥深さを学び始めた生徒",
    icon: "📖",
    rarity: 1,
    dropRate: 3.33,
    category: "food",
  },
  casual_eater: {
    code: "casual_eater",
    name: "カジュアル食べ手",
    description: "気軽にラーメンを楽しむ人",
    icon: "🙂",
    rarity: 1,
    dropRate: 3.33,
    category: "food",
  },
  instant_fan: {
    code: "instant_fan",
    name: "インスタント愛好家",
    description: "カップ麺から始まったラーメンの旅",
    icon: "🥡",
    rarity: 1,
    dropRate: 3.34,
    category: "food",
  },
  first_timer: {
    code: "first_timer",
    name: "初めての一杯",
    description: "記念すべき最初のラーメン体験",
    icon: "✨",
    rarity: 1,
    dropRate: 3.34,
    category: "special",
  },
};

// レアリティ別の色定義
export const RARITY_COLORS: Record<GachaBadgeRarity, string> = {
  1: "text-gray-500",
  2: "text-green-500",
  3: "text-blue-500",
  4: "text-purple-500",
  5: "text-yellow-500",
};

// レアリティ別のグロー効果
export const RARITY_GLOW: Record<GachaBadgeRarity, string> = {
  1: "",
  2: "shadow-green-500/50",
  3: "shadow-blue-500/50",
  4: "shadow-purple-500/50",
  5: "shadow-yellow-500/50 animate-pulse",
};

// レアリティ別の背景グラデーション
export const RARITY_GRADIENT: Record<GachaBadgeRarity, string> = {
  1: "bg-gradient-to-br from-gray-100 to-gray-200",
  2: "bg-gradient-to-br from-green-100 to-green-200",
  3: "bg-gradient-to-br from-blue-100 to-blue-200",
  4: "bg-gradient-to-br from-purple-100 to-purple-200",
  5: "bg-gradient-to-br from-yellow-100 to-yellow-200",
};

// レアリティ名称
export const RARITY_NAMES: Record<GachaBadgeRarity, string> = {
  1: "ノーマル",
  2: "コモン",
  3: "レア",
  4: "スーパーレア",
  5: "ウルトラレア",
};

// レアリティ別のバッジリスト取得
export function getBadgesByRarity(rarity: GachaBadgeRarity): GachaBadge[] {
  return Object.values(GACHA_BADGES).filter((badge) => badge.rarity === rarity);
}

// 全バッジ取得
export function getAllBadges(): GachaBadge[] {
  return Object.values(GACHA_BADGES);
}

// バッジコードから取得
export function getBadgeByCode(code: string): GachaBadge | undefined {
  return GACHA_BADGES[code];
}

// ドロップ率の合計を検証（開発用）
export function validateDropRates(): {
  valid: boolean;
  total: number;
  byRarity: Record<GachaBadgeRarity, number>;
} {
  const byRarity: Record<GachaBadgeRarity, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  Object.values(GACHA_BADGES).forEach((badge) => {
    byRarity[badge.rarity] += badge.dropRate;
  });

  const total = Object.values(byRarity).reduce((sum, rate) => sum + rate, 0);
  const valid = Math.abs(total - 100) < 0.01; // 誤差0.01%まで許容

  return { valid, total, byRarity };
}
