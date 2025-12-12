"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Input } from "./input";
import { searchStations, type Station, STATIONS } from "@/lib/constants/stations";
import { cn } from "@/lib/utils/cn";

interface StationSelectProps {
  value?: string;
  onChange: (value: string) => void;
  prefecture?: string; // 都道府県で絞り込み（任意）
  placeholder?: string;
  className?: string;
}

export function StationSelect({
  value = "",
  onChange,
  prefecture,
  placeholder = "駅名を入力",
  className,
}: StationSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<Station[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // DBから登録済み駅を取得
  const dbStations = useQuery(api.stations.list, {
    searchText: inputValue || undefined,
    prefecture: prefecture || undefined,
  });

  // 検索処理（静的マスタ + DB登録駅）
  useEffect(() => {
    // 静的マスタから検索
    const staticResults = inputValue ? searchStations(inputValue) : STATIONS.slice(0, 20);

    // 都道府県で絞り込み
    const filteredStatic = prefecture
      ? staticResults.filter((s) => s.prefecture === prefecture)
      : staticResults;

    // DBの駅を追加（重複を除外）
    if (dbStations) {
      const staticNames = new Set(STATIONS.map((s) => s.name));
      const additionalStations: Station[] = dbStations
        .filter((s) => !staticNames.has(s.name))
        .map((s) => ({
          code: s._id,
          name: s.name,
          prefecture: s.prefecture || "",
          line: s.line,
        }));

      setSuggestions([...filteredStatic, ...additionalStations]);
    } else {
      setSuggestions(filteredStatic);
    }
  }, [inputValue, prefecture, dbStations]);

  // 外側クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    setIsOpen(true);
  };

  const handleSelectStation = (station: Station) => {
    setInputValue(station.name);
    onChange(station.name);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Input
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
      />

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-auto">
          {suggestions.map((station) => (
            <button
              key={station.code}
              type="button"
              onClick={() => handleSelectStation(station)}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
            >
              <div className="text-sm font-medium text-gray-900">
                {station.name}
              </div>
              {station.line && (
                <div className="text-xs text-gray-500 mt-0.5">
                  {station.line}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
