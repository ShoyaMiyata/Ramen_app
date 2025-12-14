import { v } from "convex/values";
import { query } from "./_generated/server";

// 都道府県コードを日本語名に変換
const PREFECTURE_NAMES: Record<string, string> = {
  hokkaido: "北海道",
  aomori: "青森県",
  iwate: "岩手県",
  miyagi: "宮城県",
  akita: "秋田県",
  yamagata: "山形県",
  fukushima: "福島県",
  ibaraki: "茨城県",
  tochigi: "栃木県",
  gunma: "群馬県",
  saitama: "埼玉県",
  chiba: "千葉県",
  tokyo: "東京都",
  kanagawa: "神奈川県",
  niigata: "新潟県",
  toyama: "富山県",
  ishikawa: "石川県",
  fukui: "福井県",
  yamanashi: "山梨県",
  nagano: "長野県",
  gifu: "岐阜県",
  shizuoka: "静岡県",
  aichi: "愛知県",
  mie: "三重県",
  shiga: "滋賀県",
  kyoto: "京都府",
  osaka: "大阪府",
  hyogo: "兵庫県",
  nara: "奈良県",
  wakayama: "和歌山県",
  tottori: "鳥取県",
  shimane: "島根県",
  okayama: "岡山県",
  hiroshima: "広島県",
  yamaguchi: "山口県",
  tokushima: "徳島県",
  kagawa: "香川県",
  ehime: "愛媛県",
  kochi: "高知県",
  fukuoka: "福岡県",
  saga: "佐賀県",
  nagasaki: "長崎県",
  kumamoto: "熊本県",
  oita: "大分県",
  miyazaki: "宮崎県",
  kagoshima: "鹿児島県",
  okinawa: "沖縄県",
};

// 型定義
export type SummaryStats = {
  totalPosts: number;
  totalUsers: number;
  totalShops: number;
  totalPrefectures: number;
  weeklyPosts: number;
  monthlyNewUsers: number;
};

export type GenreStats = {
  genres: Array<{
    genre: string;
    postCount: number;
    avgRating: number | null;
  }>;
};

export type PrefectureStats = {
  prefectures: Array<{
    prefecture: string;
    prefectureName: string;
    postCount: number;
  }>;
};

export type StationStats = {
  stations: Array<{
    station: string;
    postCount: number;
  }>;
};

export type MonthlyTrends = {
  months: Array<{
    month: string;
    postCount: number;
    activeUserCount: number;
  }>;
};

export type RatingDistribution = {
  distribution: Array<{
    rating: number;
    count: number;
  }>;
};

export type TopShops = {
  shops: Array<{
    shop: {
      _id: string;
      name: string;
      address?: string;
      url?: string;
      prefecture?: string;
      station?: string;
    };
    postCount: number;
    rank: number;
  }>;
};

// 1. サマリー統計
export const getSummaryStats = query({
  args: {},
  handler: async (ctx): Promise<SummaryStats> => {
    try {
      // 全データを取得
      const noodles = await ctx.db.query("noodles").collect();
      const users = await ctx.db.query("users").collect();
      const shops = await ctx.db.query("shops").collect();

      // 削除されていないユーザーのみカウント
      const activeUsers = users.filter((u) => !u.deletedAt);

      // 総投稿数
      const totalPosts = noodles.length;

      // 総ユーザー数
      const totalUsers = activeUsers.length;

      // 総店舗数（投稿がある店舗のみカウント）
      const visitedShopIds = new Set(noodles.map((n) => n.shopId));
      const totalShops = visitedShopIds.size;

      // 総都道府県数（投稿がある店舗の都道府県のみカウント）
      const visitedShops = shops.filter((s) => visitedShopIds.has(s._id));
      const prefectures = new Set(
        visitedShops.map((s) => s.prefecture).filter((p): p is string => !!p)
      );
      const totalPrefectures = prefectures.size;

      // 今週の投稿数（過去7日間）
      const now = Date.now();
      const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
      const weeklyPosts = noodles.filter((n) => (n.createdAt || n._creationTime) >= weekAgo).length;

      // 今月の新規ユーザー数（過去30日間）
      const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
      const monthlyNewUsers = activeUsers.filter(
        (u) => (u.createdAt || u._creationTime) >= monthAgo
      ).length;

      return {
        totalPosts,
        totalUsers,
        totalShops,
        totalPrefectures,
        weeklyPosts,
        monthlyNewUsers,
      };
    } catch (error) {
      console.error("Error in getSummaryStats:", error);
      throw new Error("サマリー統計の取得に失敗しました");
    }
  },
});

// 2. ジャンル統計
export const getGenreStats = query({
  args: {},
  handler: async (ctx): Promise<GenreStats> => {
    try {
      const noodles = await ctx.db.query("noodles").collect();

      // ジャンル別に集計
      const genreMap = new Map<
        string,
        { count: number; totalRating: number; ratedCount: number }
      >();

      for (const noodle of noodles) {
        for (const genre of noodle.genres) {
          const existing = genreMap.get(genre) || {
            count: 0,
            totalRating: 0,
            ratedCount: 0,
          };
          existing.count++;
          if (noodle.evaluation) {
            existing.totalRating += noodle.evaluation;
            existing.ratedCount++;
          }
          genreMap.set(genre, existing);
        }
      }

      // 配列に変換してソート（投稿数の多い順）
      const genres = Array.from(genreMap.entries())
        .map(([genre, stats]) => ({
          genre,
          postCount: stats.count,
          avgRating:
            stats.ratedCount > 0
              ? Math.round((stats.totalRating / stats.ratedCount) * 10) / 10
              : null,
        }))
        .sort((a, b) => b.postCount - a.postCount);

      return { genres };
    } catch (error) {
      console.error("Error in getGenreStats:", error);
      throw new Error("ジャンル統計の取得に失敗しました");
    }
  },
});

// 3. 都道府県統計（TOP10）
export const getPrefectureStats = query({
  args: {},
  handler: async (ctx): Promise<PrefectureStats> => {
    try {
      const noodles = await ctx.db.query("noodles").collect();
      const shops = await ctx.db.query("shops").collect();

      // shopIdから都道府県を取得するマップ
      const shopPrefectureMap = new Map(
        shops.map((s) => [s._id, s.prefecture])
      );

      // 都道府県別に投稿数を集計
      const prefectureMap = new Map<string, number>();

      for (const noodle of noodles) {
        const prefecture = shopPrefectureMap.get(noodle.shopId);
        if (prefecture) {
          prefectureMap.set(
            prefecture,
            (prefectureMap.get(prefecture) || 0) + 1
          );
        }
      }

      // 配列に変換してソート（投稿数の多い順）、TOP10を取得
      const prefectures = Array.from(prefectureMap.entries())
        .map(([prefecture, count]) => ({
          prefecture,
          prefectureName: PREFECTURE_NAMES[prefecture] || prefecture,
          postCount: count,
        }))
        .sort((a, b) => b.postCount - a.postCount)
        .slice(0, 10);

      return { prefectures };
    } catch (error) {
      console.error("Error in getPrefectureStats:", error);
      throw new Error("都道府県統計の取得に失敗しました");
    }
  },
});

// 4. 駅統計（TOP10）
export const getStationStats = query({
  args: {},
  handler: async (ctx): Promise<StationStats> => {
    try {
      const noodles = await ctx.db.query("noodles").collect();
      const shops = await ctx.db.query("shops").collect();

      // shopIdから駅名を取得するマップ
      const shopStationMap = new Map(shops.map((s) => [s._id, s.station]));

      // 駅別に投稿数を集計
      const stationMap = new Map<string, number>();

      for (const noodle of noodles) {
        const station = shopStationMap.get(noodle.shopId);
        if (station) {
          stationMap.set(station, (stationMap.get(station) || 0) + 1);
        }
      }

      // 配列に変換してソート（投稿数の多い順）、TOP10を取得
      const stations = Array.from(stationMap.entries())
        .map(([station, count]) => ({
          station,
          postCount: count,
        }))
        .sort((a, b) => b.postCount - a.postCount)
        .slice(0, 10);

      return { stations };
    } catch (error) {
      console.error("Error in getStationStats:", error);
      throw new Error("駅統計の取得に失敗しました");
    }
  },
});

// 5. 月別推移（過去12ヶ月）
export const getMonthlyTrends = query({
  args: {},
  handler: async (ctx): Promise<MonthlyTrends> => {
    try {
      const noodles = await ctx.db.query("noodles").collect();
      const users = await ctx.db.query("users").collect();

      const now = Date.now();
      const twelveMonthsAgo = now - 365 * 24 * 60 * 60 * 1000;

      // 過去12ヶ月分の月別データを初期化
      const monthlyData = new Map<
        string,
        { postCount: number; activeUserIds: Set<string> }
      >();

      // 過去12ヶ月の年月を生成
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now - i * 30 * 24 * 60 * 60 * 1000);
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        monthlyData.set(month, { postCount: 0, activeUserIds: new Set() });
      }

      // 投稿を月別に集計
      for (const noodle of noodles) {
        const createdAt = noodle.createdAt || noodle._creationTime;
        if (createdAt >= twelveMonthsAgo) {
          const date = new Date(createdAt);
          const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

          const data = monthlyData.get(month);
          if (data) {
            data.postCount++;
            data.activeUserIds.add(noodle.userId);
          }
        }
      }

      // 配列に変換
      const months = Array.from(monthlyData.entries())
        .map(([month, data]) => ({
          month,
          postCount: data.postCount,
          activeUserCount: data.activeUserIds.size,
        }))
        .sort((a, b) => a.month.localeCompare(b.month));

      return { months };
    } catch (error) {
      console.error("Error in getMonthlyTrends:", error);
      throw new Error("月別推移の取得に失敗しました");
    }
  },
});

// 6. 評価分布
export const getRatingDistribution = query({
  args: {},
  handler: async (ctx): Promise<RatingDistribution> => {
    try {
      const noodles = await ctx.db.query("noodles").collect();

      // 評価別に集計
      const ratingMap = new Map<number, number>();
      for (let i = 1; i <= 5; i++) {
        ratingMap.set(i, 0);
      }

      for (const noodle of noodles) {
        if (noodle.evaluation) {
          const rating = Math.round(noodle.evaluation);
          if (rating >= 1 && rating <= 5) {
            ratingMap.set(rating, (ratingMap.get(rating) || 0) + 1);
          }
        }
      }

      // 配列に変換
      const distribution = Array.from(ratingMap.entries())
        .map(([rating, count]) => ({
          rating,
          count,
        }))
        .sort((a, b) => a.rating - b.rating);

      return { distribution };
    } catch (error) {
      console.error("Error in getRatingDistribution:", error);
      throw new Error("評価分布の取得に失敗しました");
    }
  },
});

// 7. 人気店舗TOP10
export const getTopShops = query({
  args: {},
  handler: async (ctx): Promise<TopShops> => {
    try {
      const noodles = await ctx.db.query("noodles").collect();
      const allShops = await ctx.db.query("shops").collect();

      // 店舗IDをキーにしたマップ
      const shopMap = new Map(allShops.map((s) => [s._id, s]));

      // 店舗別に投稿数を集計
      const shopPostCount = new Map<string, number>();

      for (const noodle of noodles) {
        shopPostCount.set(
          noodle.shopId,
          (shopPostCount.get(noodle.shopId) || 0) + 1
        );
      }

      // 配列に変換してソート（投稿数の多い順）
      const sortedShops = Array.from(shopPostCount.entries())
        .map(([shopId, count]) => {
          const shop = shopMap.get(shopId as any);
          if (!shop) return null;

          return {
            shop: {
              _id: shop._id,
              name: shop.name,
              address: shop.address,
              url: shop.url,
              prefecture: shop.prefecture,
              station: shop.station,
            },
            postCount: count,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null)
        .sort((a, b) => b.postCount - a.postCount);

      // 同率順位を計算してTOP10に制限
      const shopsWithRank: Array<{
        shop: {
          _id: string;
          name: string;
          address?: string;
          url?: string;
          prefecture?: string;
          station?: string;
        };
        postCount: number;
        rank: number;
      }> = [];

      let currentRank = 1;
      let prevCount: number | null = null;

      for (let i = 0; i < sortedShops.length; i++) {
        const item = sortedShops[i];

        // 投稿数が変わったら順位を更新
        if (prevCount !== null && item.postCount < prevCount) {
          currentRank = i + 1;
        }

        shopsWithRank.push({
          ...item,
          rank: currentRank,
        });

        prevCount = item.postCount;

        // 10位以降の店舗は除外（ただし10位と同率の店舗は含める）
        if (currentRank > 10) break;
      }

      return { shops: shopsWithRank };
    } catch (error) {
      console.error("Error in getTopShops:", error);
      throw new Error("人気店舗の取得に失敗しました");
    }
  },
});

// 統合クエリ: 全インサイトデータを一度に取得（パフォーマンス最適化）
export type AllInsights = {
  summary: SummaryStats;
  genres: GenreStats;
  prefectures: PrefectureStats;
  monthlyTrends: MonthlyTrends;
  ratingDistribution: RatingDistribution;
  topShops: TopShops;
};

export const getAllInsights = query({
  args: {},
  handler: async (ctx): Promise<AllInsights> => {
    try {
      // データを一度だけ取得
      const noodles = await ctx.db.query("noodles").collect();
      const users = await ctx.db.query("users").collect();
      const shops = await ctx.db.query("shops").collect();

      const activeUsers = users.filter((u) => !u.deletedAt);
      const now = Date.now();
      const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
      const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
      const twelveMonthsAgo = now - 365 * 24 * 60 * 60 * 1000;

      // 1. サマリー統計
      const visitedShopIds = new Set(noodles.map((n) => n.shopId));
      const visitedShops = shops.filter((s) => visitedShopIds.has(s._id));
      const prefecturesSet = new Set(
        visitedShops.map((s) => s.prefecture).filter((p): p is string => !!p)
      );

      const summary: SummaryStats = {
        totalPosts: noodles.length,
        totalUsers: activeUsers.length,
        totalShops: visitedShopIds.size,
        totalPrefectures: prefecturesSet.size,
        weeklyPosts: noodles.filter((n) => (n.createdAt || n._creationTime) >= weekAgo).length,
        monthlyNewUsers: activeUsers.filter((u) => (u.createdAt || u._creationTime) >= monthAgo).length,
      };

      // 2. ジャンル統計
      const genreMap = new Map<string, { count: number; totalRating: number; ratedCount: number }>();
      for (const noodle of noodles) {
        for (const genre of noodle.genres) {
          const existing = genreMap.get(genre) || { count: 0, totalRating: 0, ratedCount: 0 };
          existing.count++;
          if (noodle.evaluation) {
            existing.totalRating += noodle.evaluation;
            existing.ratedCount++;
          }
          genreMap.set(genre, existing);
        }
      }
      const genres: GenreStats = {
        genres: Array.from(genreMap.entries())
          .map(([genre, stats]) => ({
            genre,
            postCount: stats.count,
            avgRating: stats.ratedCount > 0 ? Math.round((stats.totalRating / stats.ratedCount) * 10) / 10 : null,
          }))
          .sort((a, b) => b.postCount - a.postCount),
      };

      // 3. 都道府県統計
      const shopPrefectureMap = new Map(shops.map((s) => [s._id, s.prefecture]));
      const prefectureMap = new Map<string, number>();
      for (const noodle of noodles) {
        const prefecture = shopPrefectureMap.get(noodle.shopId);
        if (prefecture) {
          prefectureMap.set(prefecture, (prefectureMap.get(prefecture) || 0) + 1);
        }
      }
      const prefectures: PrefectureStats = {
        prefectures: Array.from(prefectureMap.entries())
          .map(([prefecture, count]) => ({
            prefecture,
            prefectureName: PREFECTURE_NAMES[prefecture] || prefecture,
            postCount: count,
          }))
          .sort((a, b) => b.postCount - a.postCount)
          .slice(0, 10),
      };

      // 4. 月別推移
      const monthlyData = new Map<string, { postCount: number; activeUserIds: Set<string> }>();
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now - i * 30 * 24 * 60 * 60 * 1000);
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        monthlyData.set(month, { postCount: 0, activeUserIds: new Set() });
      }
      for (const noodle of noodles) {
        const createdAt = noodle.createdAt || noodle._creationTime;
        if (createdAt >= twelveMonthsAgo) {
          const date = new Date(createdAt);
          const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          const data = monthlyData.get(month);
          if (data) {
            data.postCount++;
            data.activeUserIds.add(noodle.userId);
          }
        }
      }
      const monthlyTrends: MonthlyTrends = {
        months: Array.from(monthlyData.entries())
          .map(([month, data]) => ({
            month,
            postCount: data.postCount,
            activeUserCount: data.activeUserIds.size,
          }))
          .sort((a, b) => a.month.localeCompare(b.month)),
      };

      // 5. 評価分布
      const ratingMap = new Map<number, number>();
      for (let i = 1; i <= 5; i++) {
        ratingMap.set(i, 0);
      }
      for (const noodle of noodles) {
        if (noodle.evaluation) {
          const rating = Math.round(noodle.evaluation);
          if (rating >= 1 && rating <= 5) {
            ratingMap.set(rating, (ratingMap.get(rating) || 0) + 1);
          }
        }
      }
      const ratingDistribution: RatingDistribution = {
        distribution: Array.from(ratingMap.entries())
          .map(([rating, count]) => ({ rating, count }))
          .sort((a, b) => a.rating - b.rating),
      };

      // 6. 人気店舗TOP10
      const shopMap = new Map(shops.map((s) => [s._id, s]));
      const shopPostCount = new Map<string, number>();
      for (const noodle of noodles) {
        shopPostCount.set(noodle.shopId, (shopPostCount.get(noodle.shopId) || 0) + 1);
      }
      const sortedShops = Array.from(shopPostCount.entries())
        .map(([shopId, count]) => {
          const shop = shopMap.get(shopId as any);
          if (!shop) return null;
          return {
            shop: {
              _id: shop._id,
              name: shop.name,
              address: shop.address,
              url: shop.url,
              prefecture: shop.prefecture,
              station: shop.station,
            },
            postCount: count,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null)
        .sort((a, b) => b.postCount - a.postCount);

      const shopsWithRank: Array<{
        shop: {
          _id: string;
          name: string;
          address?: string;
          url?: string;
          prefecture?: string;
          station?: string;
        };
        postCount: number;
        rank: number;
      }> = [];
      let currentRank = 1;
      let prevCount: number | null = null;
      for (let i = 0; i < sortedShops.length; i++) {
        const item = sortedShops[i];
        if (prevCount !== null && item.postCount < prevCount) {
          currentRank = i + 1;
        }
        shopsWithRank.push({ ...item, rank: currentRank });
        prevCount = item.postCount;
        if (currentRank > 10) break;
      }
      const topShops: TopShops = { shops: shopsWithRank };

      return {
        summary,
        genres,
        prefectures,
        monthlyTrends,
        ratingDistribution,
        topShops,
      };
    } catch (error) {
      console.error("Error in getAllInsights:", error);
      throw new Error("インサイトデータの取得に失敗しました");
    }
  },
});
