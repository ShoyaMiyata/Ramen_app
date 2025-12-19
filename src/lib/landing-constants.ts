import { Utensils, Heart, Trophy, Users } from 'lucide-react';

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: typeof Utensils;
}

export interface Rank {
  level: number;
  name: string;
  color: string;
  description: string;
  requiredShops: number;
}

export interface PricingPlan {
  name: string;
  price: string;
  features: string[];
  recommended?: boolean;
  ctaText: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconName: string;
}

export const APP_NAME = "Nooodle";
export const TAGLINE = "その一杯を、伝説にせよ。";

export const HERO_DESCRIPTION = "食べた数だけ強くなる。ラーメン好きのための究極の記録・共有アプリ。あなたの「麺生」を可視化し、目指せ『麺極』！";

export const FEATURES: Feature[] = [
  {
    id: 'record',
    title: '詳細なラーメン記録',
    description: '店舗、商品名、ジャンル、訪問日、評価を記録。自分だけのラーメンデータベースを構築しよう。',
    icon: Utensils,
  },
  {
    id: 'favorite',
    title: 'お気に入り機能',
    description: '他ユーザーの気になる記録をお気に入り登録。行きたいお店リストを作成できます。',
    icon: Heart,
  },
  {
    id: 'rank',
    title: '麺位十二階システム',
    description: '訪問店舗数に応じてランクアップ。初級の「麺見習い」から、最高位の「麺極」まで、頂点を目指せ。',
    icon: Trophy,
  },
  {
    id: 'community',
    title: 'ラーメンコミュニティ',
    description: 'ラーメン愛好家とつながろう。記録を共有し、新たな美味しさを発見できます。',
    icon: Users,
  },
];

export const RANKS: Rank[] = [
  { level: 1, name: '麺見習い', color: 'bg-gray-400', description: 'まずはここから。記念すべき一杯目を記録せよ。', requiredShops: 0 },
  { level: 2, name: '麺徒', color: 'bg-amber-700', description: '旅の始まり。地元の味を探索中。', requiredShops: 3 },
  { level: 3, name: '麺士', color: 'bg-green-500', description: '地元の名店は押さえた。', requiredShops: 10 },
  { level: 4, name: '麺師', color: 'bg-blue-500', description: '遠征も始めた実力者。', requiredShops: 25 },
  { level: 5, name: '麺匠', color: 'bg-purple-500', description: 'ラーメンの真髄を知る者。', requiredShops: 50 },
  { level: 6, name: '麺豪', color: 'bg-orange-500', description: '全国各地を食べ歩く強者。', requiredShops: 75 },
  { level: 7, name: '麺聖', color: 'bg-red-500', description: '伝説となりつつある存在。', requiredShops: 100 },
  { level: 8, name: '麺仙', color: 'bg-slate-400', description: '超越者の領域。', requiredShops: 150 },
  { level: 9, name: '麺王', color: 'bg-yellow-400', description: 'ラーメン界の王者。', requiredShops: 200 },
  { level: 10, name: '麺帝', color: 'bg-gray-300', description: '頂点に立つ者。', requiredShops: 300 },
  { level: 11, name: '麺神', color: 'bg-cyan-300', description: '神の領域へ到達。', requiredShops: 500 },
  { level: 12, name: '麺極', color: 'bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500', description: '全てを啜り尽くした伝説の存在。', requiredShops: 1000 },
];

// ランディングページ用に一部のランクのみ表示
export const FEATURED_RANKS: Rank[] = [
  RANKS[0],  // 麺見習い
  RANKS[3],  // 麺師
  RANKS[6],  // 麺聖
  RANKS[11], // 麺極
];

export const BADGES: Badge[] = [
  { id: 'first_post', name: 'はじめの一杯', description: '初めての投稿', iconName: '🍜' },
  { id: 'regular', name: '常連さん', description: '10投稿達成', iconName: '🏠' },
  { id: 'explorer', name: '冒険家', description: '10店舗訪問', iconName: '🗺️' },
  { id: 'jiro', name: '二郎戦士', description: '二郎系を20杯記録', iconName: '⛰️' },
  { id: 'tonkotsu', name: 'とんこつ狂', description: 'とんこつを20杯記録', iconName: '🍖' },
  { id: 'expert', name: '目利き', description: 'お気に入りされた数10回', iconName: '👁️' },
];

export const PLANS: PricingPlan[] = [
  {
    name: 'フリープラン',
    price: '¥0',
    features: [
      '投稿30件/月',
      'お気に入り50件',
      '基本バッジ機能',
      'ランキング参加',
    ],
    ctaText: '無料で始める',
  },
  {
    name: 'プレミアム',
    price: '月額 ¥500',
    features: [
      '無制限投稿',
      '無制限お気に入り',
      'Premium限定バッジ',
      'データエクスポート',
      '優先サポート',
    ],
    recommended: true,
    ctaText: 'プレミアムを試す',
  },
];
