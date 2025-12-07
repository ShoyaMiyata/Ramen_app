"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, MapPin, X } from "lucide-react";
import { getPrefecturesGroupedByRegion, getPrefectureByCode } from "@/lib/constants/prefectures";
import { cn } from "@/lib/utils/cn";
import { useTheme } from "@/contexts/ThemeContext";

interface PrefectureSelectProps {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function PrefectureSelect({
  value,
  onChange,
  placeholder = "都道府県を選択",
  className,
}: PrefectureSelectProps) {
  const { themeColor } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedRegion, setExpandedRegion] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const groupedPrefectures = getPrefecturesGroupedByRegion();
  const selectedPrefecture = value ? getPrefectureByCode(value) : null;

  // 外側クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleSelect = (code: string) => {
    onChange(code);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
  };

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      {/* トリガーボタン */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full px-3 py-2 border border-gray-300 rounded-lg",
          "flex items-center justify-between gap-2",
          "text-left text-sm bg-white",
          "hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0",
          isOpen && "ring-2"
        )}
        style={{ "--tw-ring-color": themeColor } as React.CSSProperties}
      >
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          {selectedPrefecture ? (
            <span className="text-gray-900">{selectedPrefecture.name}</span>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-0.5 hover:bg-gray-100 rounded"
            >
              <X className="w-3.5 h-3.5 text-gray-400" />
            </button>
          )}
          <ChevronDown
            className={cn(
              "w-4 h-4 text-gray-400 transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </div>
      </button>

      {/* ドロップダウン */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-auto">
          {groupedPrefectures.map((region) => (
            <div key={region.code}>
              {/* 地方ヘッダー */}
              <button
                type="button"
                onClick={() =>
                  setExpandedRegion(
                    expandedRegion === region.code ? null : region.code
                  )
                }
                className="w-full px-3 py-2 flex items-center justify-between text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 sticky top-0"
              >
                <span>{region.name}</span>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-gray-400 transition-transform",
                    expandedRegion === region.code && "rotate-180"
                  )}
                />
              </button>

              {/* 都道府県リスト */}
              {(expandedRegion === region.code || expandedRegion === null) && (
                <div className="grid grid-cols-2 gap-0.5 px-1 pb-1">
                  {region.prefectures.map((pref) => (
                    <button
                      key={pref.code}
                      type="button"
                      onClick={() => handleSelect(pref.code)}
                      className={cn(
                        "px-3 py-1.5 text-sm text-left rounded transition-colors",
                        value === pref.code
                          ? "text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      )}
                      style={
                        value === pref.code
                          ? { backgroundColor: themeColor }
                          : undefined
                      }
                    >
                      {pref.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
