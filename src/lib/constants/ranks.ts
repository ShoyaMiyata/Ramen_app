export interface Rank {
  level: number;
  name: string;
  requiredShops: number;
  color: string;
  gradient?: string;
}

export const RANKS: Rank[] = [
  { level: 1, name: "麺見習い", requiredShops: 0, color: "#9E9E9E" },
  { level: 2, name: "麺徒", requiredShops: 3, color: "#8D6E63" },
  { level: 3, name: "麺士", requiredShops: 10, color: "#66BB6A" },
  { level: 4, name: "麺師", requiredShops: 25, color: "#42A5F5" },
  { level: 5, name: "麺匠", requiredShops: 50, color: "#AB47BC" },
  { level: 6, name: "麺豪", requiredShops: 75, color: "#FFA726" },
  { level: 7, name: "麺聖", requiredShops: 100, color: "#EF5350" },
  { level: 8, name: "麺仙", requiredShops: 150, color: "#B0BEC5" },
  { level: 9, name: "麺王", requiredShops: 200, color: "#FFD54F" },
  { level: 10, name: "麺帝", requiredShops: 300, color: "#E0E0E0" },
  { level: 11, name: "麺神", requiredShops: 500, color: "#81D4FA" },
  {
    level: 12,
    name: "麺極",
    requiredShops: 1000,
    color: "#FF6B6B",
    gradient: "linear-gradient(90deg, #FF6B6B, #FFA726, #FFD54F, #66BB6A, #42A5F5, #AB47BC)",
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
