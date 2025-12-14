"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { GenreStats } from "./types";

interface GenreRatingChartProps {
  data: GenreStats[];
}

// ラーメンテーマカラー（暖色系のグラデーション）
const COLORS = [
  "#F97316", // オレンジ
  "#EA580C", // ダークオレンジ
  "#FB923C", // ライトオレンジ
  "#EF4444", // レッド
  "#F59E0B", // アンバー
  "#FBBF24", // イエロー
  "#FCA5A5", // ライトレッド
  "#FDE047", // ライトイエロー
];

// カスタムツールチップ
interface TooltipProps {
  active?: boolean;
  payload?: Array<{ payload: GenreStats }>;
}

const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="font-bold text-gray-900">{data.genre}</p>
        <p className="text-sm text-gray-600">平均評価: ★{data.averageRating.toFixed(2)}</p>
        <p className="text-xs text-gray-500 mt-1">投稿数: {data.count}杯</p>
      </div>
    );
  }
  return null;
};

export function GenreRatingChart({ data }: GenreRatingChartProps) {
  // データを平均評価でソート（降順）
  const sortedData = [...data].sort((a, b) => b.averageRating - a.averageRating);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={sortedData}
        margin={{ top: 5, right: 10, left: 0, bottom: 35 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis
          dataKey="genre"
          stroke="#6B7280"
          tick={{ fontSize: 11, angle: -35, textAnchor: "end" } as any}
          height={60}
          interval={0}
        />
        <YAxis
          stroke="#6B7280"
          tick={{ fontSize: 11 }}
          domain={[0, 5]}
          ticks={[0, 1, 2, 3, 4, 5]}
          width={30}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(249, 115, 22, 0.1)" }} />
        <Bar
          dataKey="averageRating"
          radius={[8, 8, 0, 0]}
          animationDuration={800}
          animationBegin={0}
        >
          {sortedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
