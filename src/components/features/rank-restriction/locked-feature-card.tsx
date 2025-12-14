import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { RANKS } from "@/lib/constants/ranks";

interface LockedFeatureCardProps {
  /** 必要なランクレベル */
  requiredLevel: number;
  /** 必要な店舗数 */
  requiredShops: number;
  /** 現在の店舗数 */
  currentShops: number;
  /** 機能名 */
  featureName: string;
  /** 子要素（ぼかしで表示される内容） */
  children?: React.ReactNode;
  /** カスタムクラス */
  className?: string;
}

export function LockedFeatureCard({
  requiredLevel,
  requiredShops,
  currentShops,
  featureName,
  children,
  className = "",
}: LockedFeatureCardProps) {
  const { themeColor } = useTheme();
  const requiredRank = RANKS.find((r) => r.level === requiredLevel);
  const remaining = Math.max(0, requiredShops - currentShops);
  const progress = Math.min(100, (currentShops / requiredShops) * 100);

  return (
    <div className={`relative ${className}`}>
      {/* ぼかしコンテンツ */}
      {children && (
        <div className="blur-sm opacity-40 pointer-events-none select-none">
          {children}
        </div>
      )}

      {/* オーバーレイ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center"
      >
        <div className="text-center px-6 py-8 max-w-sm">
          {/* ロックアイコン */}
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: `${themeColor}20` }}
          >
            <Lock className="w-6 h-6" style={{ color: themeColor }} />
          </div>

          {/* 機能名 */}
          <h3 className="font-bold text-lg text-gray-900 mb-2">
            {featureName}
          </h3>

          {/* 解放条件 */}
          {requiredRank && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-1">
                {requiredRank.name} (Lv{requiredLevel})で解放
              </p>
              {remaining > 0 && (
                <p className="text-xs text-gray-500">
                  あと{remaining}店舗
                </p>
              )}
            </div>
          )}

          {/* プログレスバー */}
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ backgroundColor: themeColor }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {currentShops} / {requiredShops}店舗
          </p>
        </div>
      </motion.div>
    </div>
  );
}
