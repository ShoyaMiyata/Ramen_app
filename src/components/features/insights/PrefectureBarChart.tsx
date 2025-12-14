"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { PrefectureStats } from "./types";

interface PrefectureBarChartProps {
  data: PrefectureStats[];
}

// ラーメンテーマカラー（暖色系のグラデーション）
const COLORS = [
  "#F97316", // オレンジ - 1位
  "#EA580C", // ダークオレンジ - 2位
  "#FB923C", // ライトオレンジ - 3位
  "#EF4444", // レッド - 4位
  "#F59E0B", // アンバー - 5位
  "#FBBF24", // イエロー - 6位
  "#FCA5A5", // ライトレッド - 7位
  "#FDE047", // ライトイエロー - 8位
  "#FDBA74", // ピーチ - 9位
  "#FCD34D", // ゴールド - 10位
];

// カスタムツールチップ
interface TooltipProps {
  active?: boolean;
  payload?: Array<{ payload: PrefectureStats }>;
}

const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="font-bold text-gray-900">{data.prefecture}</p>
        <p className="text-sm text-gray-600">投稿数: {data.count}杯</p>
      </div>
    );
  }
  return null;
};

export function PrefectureBarChart({ data }: PrefectureBarChartProps) {
  // データを投稿数でソート（降順）してTOP10を取得
  const sortedData = [...data].sort((a, b) => b.count - a.count).slice(0, 10);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={sortedData}
        margin={{ top: 20, right: 10, left: 5, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis
          dataKey="prefecture"
          stroke="#6B7280"
          tick={{ fontSize: 11, angle: -35, textAnchor: "end" } as any}
          height={50}
          interval={0}
        />
        <YAxis
          stroke="#6B7280"
          tick={{ fontSize: 11 }}
          width={35}
          hide
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(249, 115, 22, 0.1)" }} />
        <Bar
          dataKey="count"
          radius={[8, 8, 0, 0]}
          animationDuration={800}
          animationBegin={0}
          label={{
            position: "top",
            fontSize: 11,
            fill: "#374151",
            formatter: (value: any) => `${value}杯`,
          }}
        >
          {sortedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
