"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useTheme } from "@/contexts/ThemeContext";
import { Users, X, Check, ChevronDown, Radar } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";

// 比較用カラーパレット
const COMPARE_COLORS = [
  "#6366f1", // インディゴ
  "#10b981", // エメラルド
  "#f59e0b", // アンバー
  "#ec4899", // ピンク
  "#8b5cf6", // バイオレット
];

interface TasteProfileProps {
  userId: Id<"users">;
  showCompare?: boolean;
}

export function TasteProfile({ userId, showCompare = true }: TasteProfileProps) {
  const { themeColor } = useTheme();
  const tasteProfile = useQuery(api.noodles.getTasteProfile, { userId });
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [compareUserIds, setCompareUserIds] = useState<Id<"users">[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // フォロー中のユーザー一覧を取得（比較用）
  const following = useQuery(api.follows.getFollowing, { userId });

  // ジャンル一覧を取得
  const genres = useQuery(api.genres.list);
  const RADAR_GENRES = genres?.map(g => g.code) || [];

  if (tasteProfile === undefined || genres === undefined) {
    return (
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Radar className="w-5 h-5" style={{ color: themeColor }} />
          <h2 className="font-bold text-gray-900">味覚プロファイル</h2>
        </div>
        <div className="h-52 flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-gray-200 border-t-orange-400 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // データ不足の場合は折りたたみ表示
  if (!tasteProfile || tasteProfile.totalCount < 3) {
    return (
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
        <div
          className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-5"
          style={{ backgroundColor: themeColor }}
        />
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-4 flex items-center justify-between relative"
        >
          <div className="flex items-center gap-3">
            <Radar className="w-5 h-5" style={{ color: themeColor }} />
            <h2 className="font-bold text-gray-900">味覚プロファイル</h2>
            {!isExpanded && (
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                未解析
              </span>
            )}
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </motion.div>
        </button>
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5">
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <span className="text-2xl">🍜</span>
                  </div>
                  <p className="text-sm text-gray-400">
                    3杯以上記録すると分析されます
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  const genreMap = new Map(tasteProfile.genres.map(g => [g.code, g.count]));
  const radarData = RADAR_GENRES.map(genre => ({
    label: genre,
    value: genreMap.get(genre) || 0,
  }));
  const maxValue = Math.max(...radarData.map(d => d.value), 1);

  const toggleCompareUser = (uid: Id<"users">) => {
    setCompareUserIds(prev => {
      if (prev.includes(uid)) {
        return prev.filter(id => id !== uid);
      }
      if (prev.length >= 5) return prev; // 最大5人まで
      return [...prev, uid];
    });
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
      {/* 背景装飾 */}
      <div
        className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-5"
        style={{ backgroundColor: themeColor }}
      />

      {/* ヘッダー（常に表示・クリックで開閉） */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between relative"
      >
        <div className="flex items-center gap-3">
          <Radar className="w-5 h-5" style={{ color: themeColor }} />
          <h2 className="font-bold text-gray-900">味覚プロファイル</h2>
          {tasteProfile.topGenre && !isExpanded && (
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: themeColor }}
            >
              {tasteProfile.topGenre}派
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {tasteProfile.totalCount}杯分析
          </span>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </motion.div>
        </div>
      </button>

      {/* 折りたたみコンテンツ */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5">
              {/* 比較ボタン */}
              {showCompare && following && following.length > 0 && (
                <div className="flex justify-end mb-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsCompareOpen(true);
                    }}
                    className="text-[10px] text-gray-500 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-full flex items-center gap-1 transition-colors"
                  >
                    <Users className="w-3 h-3" />
                    比較{compareUserIds.length > 0 && ` (${compareUserIds.length})`}
                  </button>
                </div>
              )}

              <div className="flex justify-center py-3 relative">
                {compareUserIds.length > 0 ? (
                  <CompareRadarChart
                    userId={userId}
                    compareUserIds={compareUserIds}
                    themeColor={themeColor}
                  />
                ) : (
                  <RadarChart data={radarData} maxValue={maxValue} themeColor={themeColor} />
                )}
              </div>

              {/* 凡例（比較モード時） */}
              {compareUserIds.length > 0 && (
                <CompareLegend
                  userId={userId}
                  compareUserIds={compareUserIds}
                  themeColor={themeColor}
                  onClear={() => setCompareUserIds([])}
                />
              )}

              {tasteProfile.topGenre && compareUserIds.length === 0 && (
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-full px-4 py-2">
                    <span className="text-xs text-gray-500">あなたは</span>
                    <span
                      className="font-bold text-sm px-3 py-1 rounded-full text-white shadow-sm"
                      style={{
                        backgroundColor: themeColor,
                        boxShadow: `0 2px 8px ${themeColor}40`
                      }}
                    >
                      {tasteProfile.topGenre}派
                    </span>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 比較ユーザー選択モーダル */}
      <Dialog.Root open={isCompareOpen} onOpenChange={setIsCompareOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-sm mx-auto bg-white rounded-2xl max-h-[70vh] overflow-hidden flex flex-col z-50">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <Dialog.Title className="font-bold text-lg">
                比較するユーザー
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="text-gray-400 hover:text-gray-600 p-1">
                  <X className="w-5 h-5" />
                </button>
              </Dialog.Close>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <p className="text-xs text-gray-500 mb-3">
                フォロー中のユーザーと味覚を比較できます（最大5人）
              </p>
              <div className="space-y-2">
                {following?.map((user, index) => {
                  const isSelected = compareUserIds.includes(user._id);
                  const colorIndex = compareUserIds.indexOf(user._id);
                  return (
                    <button
                      key={user._id}
                      onClick={() => toggleCompareUser(user._id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${
                        isSelected ? "bg-gray-100" : "hover:bg-gray-50"
                      }`}
                    >
                      {user.imageUrl ? (
                        <img
                          src={user.imageUrl}
                          alt={user.name || ""}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                          {user.name?.charAt(0) || "?"}
                        </div>
                      )}
                      <span className="flex-1 font-medium text-gray-900">{user.name || "ユーザー"}</span>
                      {isSelected && (
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: COMPARE_COLORS[colorIndex] }}
                        >
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="p-4 border-t border-gray-100">
              <button
                onClick={() => setIsCompareOpen(false)}
                className="w-full py-2 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
              >
                決定
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

interface RadarChartProps {
  data: { label: string; value: number }[];
  maxValue: number;
  themeColor: string;
  compareDatas?: { data: { label: string; value: number }[]; color: string }[];
}

function RadarChart({ data, maxValue, themeColor, compareDatas }: RadarChartProps) {
  const size = 280;
  const center = size / 2;
  const radius = 85;
  const levels = 4;

  const angleStep = (2 * Math.PI) / data.length;
  const startAngle = -Math.PI / 2;

  const getPoint = (index: number, value: number, max: number) => {
    const angle = startAngle + index * angleStep;
    const r = (value / max) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // 全データの最大値を計算
  let actualMax = maxValue;
  if (compareDatas) {
    for (const cd of compareDatas) {
      const cdMax = Math.max(...cd.data.map(d => d.value));
      if (cdMax > actualMax) actualMax = cdMax;
    }
  }
  actualMax = Math.max(actualMax, 1);

  // 背景グラデーション円
  const bgCircles = [];
  for (let level = levels; level >= 1; level--) {
    const r = (radius * level) / levels;
    const opacity = 0.03 + (levels - level) * 0.02;
    bgCircles.push(
      <circle
        key={`bg-${level}`}
        cx={center}
        cy={center}
        r={r}
        fill={themeColor}
        opacity={opacity}
      />
    );
  }

  // グリッドポリゴン
  const gridLines = [];
  for (let level = 1; level <= levels; level++) {
    const points = data.map((_, i) => {
      const point = getPoint(i, (actualMax * level) / levels, actualMax);
      return `${point.x},${point.y}`;
    }).join(" ");
    gridLines.push(
      <polygon
        key={`grid-${level}`}
        points={points}
        fill="none"
        stroke={level === levels ? "#d1d5db" : "#e5e7eb"}
        strokeWidth={level === levels ? "1.5" : "1"}
        strokeDasharray={level === levels ? "0" : "4,4"}
      />
    );
  }

  // 軸線
  const axisLines = data.map((_, i) => {
    const point = getPoint(i, actualMax, actualMax);
    return (
      <line
        key={`axis-${i}`}
        x1={center}
        y1={center}
        x2={point.x}
        y2={point.y}
        stroke="#e5e7eb"
        strokeWidth="1"
      />
    );
  });

  // メインデータポリゴン
  const dataPoints = data.map((d, i) => {
    const point = getPoint(i, d.value, actualMax);
    return `${point.x},${point.y}`;
  }).join(" ");

  // 頂点ラベル（ジャンル名）
  const labels = data.map((d, i) => {
    const labelRadius = radius + 28;
    const angle = startAngle + i * angleStep;
    const x = center + labelRadius * Math.cos(angle);
    const y = center + labelRadius * Math.sin(angle);
    const hasValue = d.value > 0;

    return (
      <g key={`label-${i}`}>
        <text
          x={x}
          y={y - 4}
          textAnchor="middle"
          dominantBaseline="middle"
          className={`text-[9px] font-bold ${hasValue ? "fill-gray-700" : "fill-gray-400"}`}
        >
          {d.label}
        </text>
        {hasValue && !compareDatas && (
          <text
            x={x}
            y={y + 8}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-[8px] fill-gray-400"
          >
            {d.value}杯
          </text>
        )}
      </g>
    );
  });

  // メインデータのドット
  const dots = data.map((d, i) => {
    if (d.value === 0) return null;
    const point = getPoint(i, d.value, actualMax);
    return (
      <motion.g key={`dot-${i}`}>
        <motion.circle
          cx={point.x}
          cy={point.y}
          r="6"
          fill={themeColor}
          opacity="0.2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5 + i * 0.03 }}
        />
        <motion.circle
          cx={point.x}
          cy={point.y}
          r="3"
          fill="white"
          stroke={themeColor}
          strokeWidth="2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5 + i * 0.03, type: "spring" }}
        />
      </motion.g>
    );
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {bgCircles}
      {gridLines}
      {axisLines}
      <circle cx={center} cy={center} r="3" fill="#d1d5db" />

      <defs>
        <linearGradient id="polygonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={themeColor} stopOpacity="0.4" />
          <stop offset="100%" stopColor={themeColor} stopOpacity="0.15" />
        </linearGradient>
        {compareDatas?.map((cd, idx) => (
          <linearGradient key={`compareGradient-${idx}`} id={`compareGradient-${idx}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={cd.color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={cd.color} stopOpacity="0.08" />
          </linearGradient>
        ))}
      </defs>

      {/* 比較データポリゴン（後ろに描画） */}
      {compareDatas?.map((cd, idx) => {
        const comparePoints = cd.data.map((d, i) => {
          const point = getPoint(i, d.value, actualMax);
          return `${point.x},${point.y}`;
        }).join(" ");

        return (
          <motion.polygon
            key={`compare-polygon-${idx}`}
            points={comparePoints}
            fill={`url(#compareGradient-${idx})`}
            stroke={cd.color}
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeDasharray="4,2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
          />
        );
      })}

      {/* メインポリゴン */}
      <motion.polygon
        points={dataPoints}
        fill="url(#polygonGradient)"
        stroke={themeColor}
        strokeWidth="2.5"
        strokeLinejoin="round"
        initial={{ opacity: 0, scale: 0.3 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{ transformOrigin: `${center}px ${center}px` }}
      />

      {/* 比較データのドット */}
      {compareDatas?.map((cd, idx) =>
        cd.data.map((d, i) => {
          if (d.value === 0) return null;
          const point = getPoint(i, d.value, actualMax);
          return (
            <motion.circle
              key={`compare-dot-${idx}-${i}`}
              cx={point.x}
              cy={point.y}
              r="2.5"
              fill={cd.color}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6 + idx * 0.1 + i * 0.02 }}
            />
          );
        })
      )}

      {dots}
      {labels}
    </svg>
  );
}

interface CompareRadarChartProps {
  userId: Id<"users">;
  compareUserIds: Id<"users">[];
  themeColor: string;
}

function CompareRadarChart({ userId, compareUserIds, themeColor }: CompareRadarChartProps) {
  const profile = useQuery(api.noodles.getTasteProfile, { userId });
  const genres = useQuery(api.genres.list);

  // 比較ユーザーのプロファイルを取得
  const compareProfile1 = useQuery(
    api.noodles.getTasteProfile,
    compareUserIds[0] ? { userId: compareUserIds[0] } : "skip"
  );
  const compareProfile2 = useQuery(
    api.noodles.getTasteProfile,
    compareUserIds[1] ? { userId: compareUserIds[1] } : "skip"
  );
  const compareProfile3 = useQuery(
    api.noodles.getTasteProfile,
    compareUserIds[2] ? { userId: compareUserIds[2] } : "skip"
  );
  const compareProfile4 = useQuery(
    api.noodles.getTasteProfile,
    compareUserIds[3] ? { userId: compareUserIds[3] } : "skip"
  );
  const compareProfile5 = useQuery(
    api.noodles.getTasteProfile,
    compareUserIds[4] ? { userId: compareUserIds[4] } : "skip"
  );

  const compareProfiles = [
    compareProfile1,
    compareProfile2,
    compareProfile3,
    compareProfile4,
    compareProfile5,
  ].slice(0, compareUserIds.length);

  const isLoading = profile === undefined || genres === undefined || compareProfiles.some(p => p === undefined);

  if (isLoading) {
    return (
      <div className="h-72 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-orange-400 rounded-full animate-spin" />
      </div>
    );
  }

  const RADAR_GENRES = genres?.map(g => g.code) || [];
  const genreMap = new Map(profile?.genres.map(g => [g.code, g.count]) || []);
  const radarData = RADAR_GENRES.map(genre => ({
    label: genre,
    value: genreMap.get(genre) || 0,
  }));

  const compareDatas = compareProfiles.map((cp, idx) => {
    const map = new Map(cp?.genres.map(g => [g.code, g.count]) || []);
    return {
      data: RADAR_GENRES.map(genre => ({
        label: genre,
        value: map.get(genre) || 0,
      })),
      color: COMPARE_COLORS[idx],
    };
  });

  const maxValue = Math.max(
    ...radarData.map(d => d.value),
    ...compareDatas.flatMap(cd => cd.data.map(d => d.value)),
    1
  );

  return (
    <RadarChart
      data={radarData}
      maxValue={maxValue}
      themeColor={themeColor}
      compareDatas={compareDatas}
    />
  );
}

interface CompareLegendProps {
  userId: Id<"users">;
  compareUserIds: Id<"users">[];
  themeColor: string;
  onClear: () => void;
}

// マッチ率計算（コサイン類似度）
function calculateMatchRate(profile1: any, profile2: any, genres: any[]): number {
  if (!profile1 || !profile2 || !genres || genres.length === 0) return 0;

  const genreCodes = genres.map(g => g.code);
  const map1 = new Map<string, number>(profile1.genres.map((g: any) => [g.code, g.count as number]));
  const map2 = new Map<string, number>(profile2.genres.map((g: any) => [g.code, g.count as number]));

  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  genreCodes.forEach(code => {
    const count1 = map1.get(code) || 0;
    const count2 = map2.get(code) || 0;
    dotProduct += count1 * count2;
    magnitude1 += count1 * count1;
    magnitude2 += count2 * count2;
  });

  if (magnitude1 === 0 || magnitude2 === 0) return 0;

  const cosineSimilarity = dotProduct / (Math.sqrt(magnitude1) * Math.sqrt(magnitude2));
  return Math.round(cosineSimilarity * 100);
}

function CompareLegend({ userId, compareUserIds, themeColor, onClear }: CompareLegendProps) {
  // 自分のプロファイル
  const myProfile = useQuery(api.noodles.getTasteProfile, { userId });
  const genres = useQuery(api.genres.list);

  // 比較ユーザーの情報を取得
  const user1 = useQuery(api.users.getById, compareUserIds[0] ? { id: compareUserIds[0] } : "skip");
  const user2 = useQuery(api.users.getById, compareUserIds[1] ? { id: compareUserIds[1] } : "skip");
  const user3 = useQuery(api.users.getById, compareUserIds[2] ? { id: compareUserIds[2] } : "skip");
  const user4 = useQuery(api.users.getById, compareUserIds[3] ? { id: compareUserIds[3] } : "skip");
  const user5 = useQuery(api.users.getById, compareUserIds[4] ? { id: compareUserIds[4] } : "skip");

  // 比較ユーザーのプロファイルを取得
  const profile1 = useQuery(api.noodles.getTasteProfile, compareUserIds[0] ? { userId: compareUserIds[0] } : "skip");
  const profile2 = useQuery(api.noodles.getTasteProfile, compareUserIds[1] ? { userId: compareUserIds[1] } : "skip");
  const profile3 = useQuery(api.noodles.getTasteProfile, compareUserIds[2] ? { userId: compareUserIds[2] } : "skip");
  const profile4 = useQuery(api.noodles.getTasteProfile, compareUserIds[3] ? { userId: compareUserIds[3] } : "skip");
  const profile5 = useQuery(api.noodles.getTasteProfile, compareUserIds[4] ? { userId: compareUserIds[4] } : "skip");

  const users = [user1, user2, user3, user4, user5].slice(0, compareUserIds.length);
  const profiles = [profile1, profile2, profile3, profile4, profile5].slice(0, compareUserIds.length);

  return (
    <div className="space-y-3 mt-3">
      {/* 凡例 */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <div className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: themeColor }}
          />
          <span className="text-[10px] text-gray-600">自分</span>
        </div>
        {users.map((user, idx) => (
          <div key={compareUserIds[idx]} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: COMPARE_COLORS[idx] }}
            />
            <span className="text-[10px] text-gray-600">{user?.name || "..."}</span>
          </div>
        ))}
        <button
          onClick={onClear}
          className="text-[10px] text-gray-400 hover:text-gray-600 underline ml-2"
        >
          解除
        </button>
      </div>

      {/* マッチ率 */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {users.map((user, idx) => {
          const matchRate = calculateMatchRate(myProfile, profiles[idx], genres || []);
          return (
            <div
              key={compareUserIds[idx]}
              className="flex items-center gap-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-full px-3 py-1.5"
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: COMPARE_COLORS[idx] }}
              />
              <span className="text-[10px] text-gray-500">{user?.name || "..."}:</span>
              <span className="text-xs font-bold" style={{ color: COMPARE_COLORS[idx] }}>
                {matchRate}%
              </span>
              <span className="text-[10px] text-gray-400">一致</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
