/**
 * インサイトページ用の型定義
 *
 * Note: これらの型定義はconvex/insights.tsのバックエンド実装が完了するまでの
 * 一時的なモック型です。バックエンド実装完了後、convexの型定義に置き換えてください。
 */

export interface GenreStats {
  genre: string;
  count: number;
  averageRating: number;
}

export interface PrefectureStats {
  prefecture: string;
  count: number;
}

export interface MonthlyTrend {
  month: string; // "YYYY-MM" format
  postCount: number;
  activeUserCount: number;
}

export interface RatingDistribution {
  rating: number; // 1-5
  count: number;
}

export interface TopShop {
  _id: string;
  name: string;
  station?: string;
  prefecture?: string;
  postCount: number;
  averageRating: number;
}
