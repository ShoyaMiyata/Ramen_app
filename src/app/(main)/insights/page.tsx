"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Users,
  Store,
  MapPin,
  Activity,
  Calendar,
  Soup,
  Star,
  BarChart3,
  PieChart,
  Lock,
  Info
} from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { useTheme } from "@/contexts/ThemeContext";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { Loading } from "@/components/ui/loading";
import { cn } from "@/lib/utils/cn";
import {
  GenreBarChart,
  GenreRatingChart,
  PrefectureBarChart,
  MonthlyTrendChart,
  RatingPieChart,
} from "@/components/features/insights";
import { LockedFeatureCard } from "@/components/features/rank-restriction";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";

export default function InsightsPage() {
  useScrollRestoration();
  const { themeColor } = useTheme();

  // アクセス制御
  const { displayLevel, currentRank, shopCount } = useFeatureAccess();

  // 統合クエリで全データを一度に取得（パフォーマンス最適化）
  const allInsights = useQuery(api.insights.getAllInsights);

  const isLoading = allInsights === undefined;

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Soup className="w-6 h-6" style={{ color: themeColor }} />
        <h1 className="font-bold text-2xl text-gray-900">Nooodleインサイト</h1>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
        <SummaryCard
          icon={<Soup className="w-5 h-5" />}
          label="総杯数"
          value={allInsights.summary.totalPosts}
          delay={0}
          themeColor={themeColor}
        />
        <SummaryCard
          icon={<Users className="w-5 h-5" />}
          label="メンバー"
          value={allInsights.summary.totalUsers}
          delay={0.1}
          themeColor={themeColor}
        />
        <SummaryCard
          icon={<Store className="w-5 h-5" />}
          label="総店舗数"
          value={allInsights.summary.totalShops}
          delay={0.2}
          themeColor={themeColor}
        />
        <SummaryCard
          icon={<MapPin className="w-5 h-5" />}
          label="制覇都道府県"
          value={allInsights.summary.totalPrefectures}
          unit="都道府県"
          delay={0.3}
          themeColor={themeColor}
        />
        <SummaryCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="今週の一杯"
          value={allInsights.summary.weeklyPosts}
          unit="杯"
          delay={0.4}
          themeColor={themeColor}
        />
        <SummaryCard
          icon={<Activity className="w-5 h-5" />}
          label="今月の新メンバー"
          value={allInsights.summary.monthlyNewUsers}
          unit="人"
          delay={0.5}
          themeColor={themeColor}
        />
      </div>

      {/* Genre Analysis & Regional Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <SectionCard
          title="ジャンル分析"
          icon={<BarChart3 className="w-5 h-5" />}
          delay={0.6}
        >
          {allInsights.genres.genres.length > 0 ? (
            <GenreBarChart
              data={allInsights.genres.genres.map((g) => ({
                genre: g.genre,
                count: g.postCount,
                averageRating: g.avgRating || 0,
              }))}
            />
          ) : (
            <div className="text-center py-12 text-gray-500">
              まだデータがありません
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="地域分析 TOP10"
          icon={<MapPin className="w-5 h-5" />}
          delay={0.7}
        >
          {displayLevel.regionalAnalysis === false ? (
            // 麺見習い：完全ロック
            <LockedFeatureCard
              requiredLevel={2}
              requiredShops={5}
              currentShops={shopCount}
              featureName="地域分析"
              className="min-h-[200px]"
            >
              <div className="space-y-2">
                <div className="h-8 bg-gray-200 rounded" />
                <div className="h-8 bg-gray-200 rounded" />
                <div className="h-8 bg-gray-200 rounded" />
              </div>
            </LockedFeatureCard>
          ) : allInsights.prefectures.prefectures.length > 0 ? (
            // 麺歩き以降：表示
            <PrefectureBarChart
              data={allInsights.prefectures.prefectures.map((p) => ({
                prefecture: p.prefectureName,
                count: p.postCount,
              }))}
            />
          ) : (
            <div className="text-center py-12 text-gray-500">
              まだデータがありません
            </div>
          )}
        </SectionCard>
      </div>

      {/* Time Series Analysis - Full Width */}
      <SectionCard
        title="月別推移（過去12ヶ月）"
        icon={<Calendar className="w-5 h-5" />}
        delay={0.8}
      >
        {displayLevel.monthlyTrend === false ? (
          // 麺見習い：完全ロック
          <LockedFeatureCard
            requiredLevel={2}
            requiredShops={5}
            currentShops={shopCount}
            featureName="月別推移"
            className="min-h-[240px]"
          >
            <div className="space-y-2">
              <div className="h-48 bg-gray-200 rounded" />
            </div>
          </LockedFeatureCard>
        ) : allInsights.monthlyTrends.months.length > 0 ? (
          // 麺歩き以降：表示
          <MonthlyTrendChart
            data={allInsights.monthlyTrends.months.map((m) => ({
              month: m.month,
              postCount: m.postCount,
              activeUserCount: m.activeUserCount,
            }))}
          />
        ) : (
          <div className="text-center py-8 text-gray-500">
            まだデータがありません
          </div>
        )}
      </SectionCard>

      {/* Rating Distribution & Top Shops */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <SectionCard
          title="評価分布"
          icon={<PieChart className="w-5 h-5" />}
          delay={0.9}
        >
          {displayLevel.ratingDistribution === false ? (
            // 麺見習い：完全ロック
            <LockedFeatureCard
              requiredLevel={2}
              requiredShops={5}
              currentShops={shopCount}
              featureName="評価分布"
              className="min-h-[200px]"
            >
              <div className="flex items-center justify-center h-48">
                <div className="w-32 h-32 bg-gray-200 rounded-full" />
              </div>
            </LockedFeatureCard>
          ) : allInsights.ratingDistribution.distribution.length > 0 ? (
            // 麺歩き以降：表示
            <RatingPieChart
              data={allInsights.ratingDistribution.distribution.map((r) => ({
                rating: r.rating,
                count: r.count,
              }))}
            />
          ) : (
            <div className="text-center py-12 text-gray-500">
              まだデータがありません
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="人気店舗 TOP10"
          icon={<Store className="w-5 h-5" />}
          delay={1.0}
          infoTooltip="投稿数順"
        >
          {displayLevel.topShops === false ? (
            // 麺見習い：完全ロック
            <LockedFeatureCard
              requiredLevel={2}
              requiredShops={5}
              currentShops={shopCount}
              featureName="人気店舗"
              className="min-h-[200px]"
            >
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded-lg" />
                ))}
              </div>
            </LockedFeatureCard>
          ) : allInsights.topShops.shops.length > 0 ? (
            // 麺歩き以降：表示
            <div className="space-y-1.5">
              {allInsights.topShops.shops.map((item) => (
                <div
                  key={item.shop._id}
                  className={cn(
                    "p-2.5 rounded-lg hover:bg-gray-50 transition-all hover:scale-[1.02]",
                    item.rank === 1 && "bg-yellow-50/50",
                    item.rank === 2 && "bg-gray-50/50",
                    item.rank === 3 && "bg-amber-50/50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                          item.rank === 1 && "bg-yellow-400 text-white",
                          item.rank === 2 && "bg-gray-300 text-gray-700",
                          item.rank === 3 && "bg-amber-600 text-white",
                          item.rank >= 4 && "bg-gray-100 text-gray-600"
                        )}
                      >
                        {item.rank}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {item.shop.name}
                        </p>
                        {item.shop.station && (
                          <p className="text-xs text-gray-500 truncate">
                            {item.shop.station}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-700 ml-2 flex-shrink-0">
                      {item.postCount}杯
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              まだデータがありません
            </div>
          )}
        </SectionCard>
      </div>

      {/* Footer Note */}
      <div className="bg-gray-50 rounded-xl p-4 text-center">
        <p className="text-sm text-gray-500">
          全メンバーの記録から算出された統計データです
        </p>
      </div>
    </div>
  );
}

interface SummaryCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  unit?: string;
  delay: number;
  themeColor: string;
}

function SummaryCard({ icon, label, value, unit, delay, themeColor }: SummaryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-white rounded-xl p-3 shadow-sm"
    >
      <div className="flex items-center gap-1.5 mb-1.5" style={{ color: themeColor }}>
        {icon}
        <span className="text-xs font-medium text-gray-500">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-gray-900">
          {value.toLocaleString()}
        </span>
        {unit && <span className="text-sm text-gray-500">{unit}</span>}
      </div>
    </motion.div>
  );
}

interface SectionCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  delay: number;
  infoTooltip?: string;
}

function SectionCard({ title, icon, children, delay, infoTooltip }: SectionCardProps) {
  const { themeColor } = useTheme();
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-white rounded-xl p-4 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-3">
        <div style={{ color: themeColor }}>
          {icon}
        </div>
        <h2 className="font-bold text-lg text-gray-900">{title}</h2>
        {infoTooltip && (
          <div className="relative ml-1">
            <button
              onClick={() => setShowTooltip(!showTooltip)}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="focus:outline-none"
              aria-label="詳細情報"
            >
              <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors" />
            </button>
            {showTooltip && (
              <div className="absolute left-0 top-6 w-28 bg-gray-900 text-white text-xs rounded-lg p-2 shadow-xl z-50 animate-in fade-in duration-200">
                <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45" />
                {infoTooltip}
              </div>
            )}
          </div>
        )}
      </div>
      {children}
    </motion.div>
  );
}
