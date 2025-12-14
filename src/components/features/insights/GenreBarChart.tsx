"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { GenreStats } from "./types";

interface GenreBarChartProps {
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
        <p className="text-sm text-gray-600">投稿数: {data.count}杯</p>
      </div>
    );
  }
  return null;
};

// カスタムラベル（ジャンル名 + 投稿数）
interface CustomLabelProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  value?: number;
  index?: number;
}

const renderCustomLabel = (props: CustomLabelProps, data: GenreStats[]) => {
  const { x = 0, y = 0, width = 0, height = 0, value = 0, index = 0 } = props;
  const genre = data[index]?.genre || "";

  return (
    <g>
      <text
        x={x + width + 8}
        y={y + (height / 2) - 2}
        fill="#374151"
        fontSize={11}
        fontWeight="600"
        textAnchor="start"
        dominantBaseline="middle"
      >
        {genre}
      </text>
      <text
        x={x + width + 8}
        y={y + (height / 2) + 11}
        fill="#6B7280"
        fontSize={10}
        textAnchor="start"
        dominantBaseline="middle"
      >
        {value}杯
      </text>
    </g>
  );
};

export function GenreBarChart({ data }: GenreBarChartProps) {
  // データを投稿数でソート（降順）
  const sortedData = [...data].sort((a, b) => b.count - a.count);

  // データ量に応じて高さを動的に調整（最小250、1項目あたり30px）
  const dynamicHeight = Math.max(250, Math.min(sortedData.length * 30, 400));

  return (
    <ResponsiveContainer width="100%" height={dynamicHeight}>
      <BarChart
        data={sortedData}
        layout="vertical"
        margin={{ top: 5, right: 90, left: 5, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis
          type="number"
          stroke="#6B7280"
          tick={false}
          axisLine={false}
        />
        <YAxis
          type="category"
          dataKey="genre"
          stroke="#6B7280"
          tick={false}
          axisLine={false}
          width={1}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(249, 115, 22, 0.1)" }} />
        <Bar
          dataKey="count"
          radius={[0, 8, 8, 0]}
          animationDuration={1500}
          animationBegin={0}
          label={(props: any) => renderCustomLabel(props, sortedData)}
        >
          {sortedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
