import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { RANKS } from "@/lib/constants/ranks";

interface LockedFeatureOverlayProps {
  /** 必要なランクレベル */
  requiredLevel: number;
  /** 必要な店舗数 */
  requiredShops: number;
  /** 現在の店舗数 */
  currentShops: number;
  /** 機能名 */
  featureName: string;
  /** 機能の説明 */
  description?: string;
  /** 子要素（ぼかしで表示される内容） */
  children: React.ReactNode;
}

export function LockedFeatureOverlay({
  requiredLevel,
  requiredShops,
  currentShops,
  featureName,
  description,
  children,
}: LockedFeatureOverlayProps) {
  const { themeColor } = useTheme();
  const requiredRank = RANKS.find((r) => r.level === requiredLevel);
  const remaining = Math.max(0, requiredShops - currentShops);
  const progress = Math.min(100, (currentShops / requiredShops) * 100);

  return (
    <div className="relative min-h-[60vh]">
      {/* ぼかしコンテンツ */}
      <div className="blur-md opacity-30 pointer-events-none select-none">
        {children}
      </div>

      {/* オーバーレイ */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm"
      >
        <div className="text-center px-6 py-12 max-w-md">
          {/* ロックアイコン */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
            style={{ backgroundColor: `${themeColor}15` }}
          >
            <Lock className="w-10 h-10" style={{ color: themeColor }} />
          </motion.div>

          {/* 機能名 */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-bold text-2xl text-gray-900 mb-3"
          >
            {featureName}
          </motion.h2>

          {/* 説明 */}
          {description && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600 mb-6 text-sm"
            >
              {description}
            </motion.p>
          )}

          {/* 解放条件 */}
          {requiredRank && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gray-50 rounded-xl p-6 mb-4"
            >
              <p className="text-gray-700 mb-4">
                <span className="font-bold" style={{ color: themeColor }}>
                  {requiredRank.name}
                </span>{" "}
                <span className="text-sm text-gray-500">(Lv{requiredLevel})</span>
                で解放
              </p>

              {remaining > 0 && (
                <p className="text-gray-600 mb-4">
                  あと<span className="font-bold text-xl mx-1">{remaining}</span>店舗
                </p>
              )}

              {/* プログレスバー */}
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ delay: 0.6, duration: 1, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: themeColor }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {currentShops} / {requiredShops}店舗
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
