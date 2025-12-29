"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

interface SliderProps {
  value: number[];
  onValueChange: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export function Slider({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  className,
}: SliderProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onValueChange([parseFloat(e.target.value)]);
  };

  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value[0]}
      onChange={handleChange}
      className={cn(
        "w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer",
        "slider-thumb:appearance-none slider-thumb:w-4 slider-thumb:h-4",
        "slider-thumb:rounded-full slider-thumb:bg-orange-500",
        "slider-thumb:cursor-pointer slider-thumb:shadow-md",
        "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4",
        "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-500",
        "[&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md",
        "[&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4",
        "[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-orange-500",
        "[&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:border-0",
        className
      )}
    />
  );
}
