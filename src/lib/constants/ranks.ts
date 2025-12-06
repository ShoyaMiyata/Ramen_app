export interface Rank {
  level: number;
  name: string;
  requiredShops: number;
  color: string;
  gradient?: string;
  bowlCount: 1 | 2 | 3 | 4 | 5;
  hasSteam: boolean;
  hasChopsticks: boolean;
  hasSpoon: boolean;
  hasGoldBorder: boolean;
  hasCrown: boolean;
  specialEffect?: "gold" | "rainbow";
}

export const RANKS: Rank[] = [
  {
    level: 1,
    name: "麺見習い",
    requiredShops: 0,
    color: "#9E9E9E",
    bowlCount: 1,
    hasSteam: false,
    hasChopsticks: false,
    hasSpoon: false,
    hasGoldBorder: false,
    hasCrown: false,
  },
  {
    level: 2,
    name: "麺歩き",
    requiredShops: 5,
    color: "#8D6E63",
    bowlCount: 1,
    hasSteam: true,
    hasChopsticks: false,
    hasSpoon: false,
    hasGoldBorder: false,
    hasCrown: false,
  },
  {
    level: 3,
    name: "麺探",
    requiredShops: 20,
    color: "#66BB6A",
    bowlCount: 2,
    hasSteam: false,
    hasChopsticks: false,
    hasSpoon: false,
    hasGoldBorder: false,
    hasCrown: false,
  },
  {
    level: 4,
    name: "麺匠見習い",
    requiredShops: 50,
    color: "#42A5F5",
    bowlCount: 2,
    hasSteam: false,
    hasChopsticks: true,
    hasSpoon: false,
    hasGoldBorder: false,
    hasCrown: false,
  },
  {
    level: 5,
    name: "麺匠",
    requiredShops: 100,
    color: "#AB47BC",
    bowlCount: 3,
    hasSteam: false,
    hasChopsticks: false,
    hasSpoon: false,
    hasGoldBorder: false,
    hasCrown: false,
  },
  {
    level: 6,
    name: "麺宗",
    requiredShops: 200,
    color: "#FFA726",
    bowlCount: 3,
    hasSteam: false,
    hasChopsticks: false,
    hasSpoon: true,
    hasGoldBorder: false,
    hasCrown: false,
  },
  {
    level: 7,
    name: "麺導",
    requiredShops: 300,
    color: "#EF5350",
    bowlCount: 4,
    hasSteam: false,
    hasChopsticks: false,
    hasSpoon: false,
    hasGoldBorder: false,
    hasCrown: false,
  },
  {
    level: 8,
    name: "麺仙",
    requiredShops: 500,
    color: "#B0BEC5",
    bowlCount: 4,
    hasSteam: false,
    hasChopsticks: false,
    hasSpoon: false,
    hasGoldBorder: true,
    hasCrown: false,
  },
  {
    level: 9,
    name: "麺王",
    requiredShops: 700,
    color: "#FFD54F",
    bowlCount: 5,
    hasSteam: false,
    hasChopsticks: false,
    hasSpoon: false,
    hasGoldBorder: false,
    hasCrown: false,
  },
  {
    level: 10,
    name: "麺皇",
    requiredShops: 1000,
    color: "#E0E0E0",
    gradient: "linear-gradient(135deg, #E0E0E0 0%, #BDBDBD 50%, #E0E0E0 100%)",
    bowlCount: 5,
    hasSteam: false,
    hasChopsticks: false,
    hasSpoon: false,
    hasGoldBorder: false,
    hasCrown: true,
  },
  {
    level: 11,
    name: "麺尊",
    requiredShops: 1500,
    color: "#FFD700",
    gradient: "linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)",
    bowlCount: 5,
    hasSteam: true,
    hasChopsticks: true,
    hasSpoon: true,
    hasGoldBorder: true,
    hasCrown: true,
    specialEffect: "gold",
  },
  {
    level: 12,
    name: "麺極",
    requiredShops: 2500,
    color: "#FF6B6B",
    gradient: "linear-gradient(90deg, #FF6B6B, #FFA726, #FFD54F, #66BB6A, #42A5F5, #AB47BC)",
    bowlCount: 5,
    hasSteam: true,
    hasChopsticks: true,
    hasSpoon: true,
    hasGoldBorder: true,
    hasCrown: true,
    specialEffect: "rainbow",
  },
];

export function getRankByShopCount(shopCount: number): Rank {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (shopCount >= RANKS[i].requiredShops) {
      return RANKS[i];
    }
  }
  return RANKS[0];
}

export function getNextRank(currentRank: Rank): Rank | null {
  const nextIndex = RANKS.findIndex((r) => r.level === currentRank.level) + 1;
  return nextIndex < RANKS.length ? RANKS[nextIndex] : null;
}
