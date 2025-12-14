"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { RatingDistribution } from "./types";

interface RatingPieChartProps {
  data: RatingDistribution[];
}

// ラーメンテーマカラー（暖色系）- 評価が高いほど濃い色
const COLORS = [
  "#FCA5A5", // ★1 - ライトレッド
  "#FB923C", // ★2 - ライトオレンジ
  "#F59E0B", // ★3 - アンバー
  "#EA580C", // ★4 - ダークオレンジ
  "#F97316", // ★5 - オレンジ
];

// カスタムツールチップ
interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: { total: number };
  }>;
}

const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const total = payload[0].payload.total || 0;
    const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="font-bold text-gray-900">★{data.name}</p>
        <p className="text-sm text-gray-600">
          投稿数: {data.value}杯
        </p>
        <p className="text-sm text-gray-500">
          割合: {percentage}%
        </p>
      </div>
    );
  }
  return null;
};

// カスタムラベル（パーセンテージ表示）
interface LabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
}

const renderCustomLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: LabelProps) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // 5%未満の場合はラベル非表示
  if (percent < 0.05) return null;

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      className="font-bold text-sm"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// カスタムレジェンド
interface CustomLegendProps {
  payload?: Array<{
    value: string;
    color: string;
    payload: { count: number };
  }>;
}

const CustomLegend = ({ payload }: CustomLegendProps) => {
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {payload?.map((entry, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-gray-700">
            ★{entry.value} ({entry.payload.count}杯)
          </span>
        </div>
      ))}
    </div>
  );
};

export function RatingPieChart({ data }: RatingPieChartProps) {
  // データを評価でソート（昇順）
  const sortedData = [...data].sort((a, b) => a.rating - b.rating);

  // 合計投稿数を計算
  const total = sortedData.reduce((sum, item) => sum + item.count, 0);

  // データに合計を追加
  const dataWithTotal = sortedData.map((item) => ({
    ...item,
    name: item.rating.toString(),
    total,
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <PieChart>
        <Pie
          data={dataWithTotal}
          cx="50%"
          cy="42%"
          labelLine={false}
          label={renderCustomLabel}
          outerRadius={85}
          innerRadius={0}
          fill="#8884d8"
          dataKey="count"
          animationDuration={800}
          animationBegin={0}
        >
          {dataWithTotal.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[entry.rating - 1] || COLORS[0]}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend content={<CustomLegend />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
