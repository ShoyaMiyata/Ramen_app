"use client";

import { useState, useEffect, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { MonthlyTrend } from "./types";

interface MonthlyTrendChartProps {
  data: MonthlyTrend[];
}

// カスタムツールチップ
interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="font-bold text-gray-900 mb-2">{label}</p>
        {payload.map((entry, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
            {entry.name === "投稿数" ? "杯" : "人"}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// カスタムレジェンド
interface LegendProps {
  payload?: Array<{
    value: string;
    color: string;
  }>;
}

const CustomLegend = ({ payload }: LegendProps) => {
  return (
    <div className="flex justify-center gap-6 mb-4">
      {payload?.map((entry, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-gray-700">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

// 月表示を短縮フォーマット（YYYY-MM → MM月）
const formatMonth = (month: string) => {
  const [, mm] = month.split("-");
  return `${parseInt(mm, 10)}月`;
};

export function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  const [isVisible, setIsVisible] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (chartRef.current) {
      observer.observe(chartRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // データを月でソート（昇順）
  const sortedData = [...data].sort((a, b) => a.month.localeCompare(b.month));

  // 表示用にフォーマット
  const formattedData = sortedData.map((item) => ({
    ...item,
    monthLabel: formatMonth(item.month),
  }));

  return (
    <div ref={chartRef}>
      <ResponsiveContainer width="100%" height={280}>
      <LineChart
        data={formattedData}
        margin={{ top: 10, right: 35, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis
          dataKey="monthLabel"
          stroke="#6B7280"
          tick={{ fontSize: 11 }}
        />
        <YAxis
          yAxisId="left"
          stroke="#F97316"
          tick={{ fontSize: 11 }}
          width={35}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          stroke="#EF4444"
          tick={{ fontSize: 11 }}
          width={35}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend content={<CustomLegend />} />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="postCount"
          name="投稿数"
          stroke="#F97316"
          strokeWidth={2}
          dot={{ fill: "#F97316", r: 4 }}
          activeDot={{ r: 6 }}
          animationDuration={1500}
          isAnimationActive={isVisible}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="activeUserCount"
          name="アクティブユーザー数"
          stroke="#EF4444"
          strokeWidth={2}
          dot={{ fill: "#EF4444", r: 4 }}
          activeDot={{ r: 6 }}
          animationDuration={1500}
          isAnimationActive={isVisible}
        />
      </LineChart>
    </ResponsiveContainer>
    </div>
  );
}
