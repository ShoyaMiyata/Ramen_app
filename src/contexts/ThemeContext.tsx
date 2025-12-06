"use client";

import { createContext, useContext, useEffect, ReactNode } from "react";
import { Rank, RANKS } from "@/lib/constants/ranks";

interface ThemeContextType {
  rank: Rank;
  themeColor: string;
  themeBgColor: string;
  themeAccentColor: string;
  selectedThemeRank: Rank;
}

const defaultRank = RANKS[0];

const ThemeContext = createContext<ThemeContextType>({
  rank: defaultRank,
  themeColor: defaultRank.themeColor,
  themeBgColor: defaultRank.themeBgColor,
  themeAccentColor: defaultRank.themeAccentColor,
  selectedThemeRank: defaultRank,
});

export function useTheme() {
  return useContext(ThemeContext);
}

interface ThemeProviderProps {
  children: ReactNode;
  rank: Rank;
  selectedThemeLevel?: number;
}

export function ThemeProvider({ children, rank, selectedThemeLevel }: ThemeProviderProps) {
  // 選択されたテーマレベルに基づくランクを取得
  // selectedThemeLevelが未設定または現在のランクより高い場合は現在のランクを使用
  const selectedThemeRank = selectedThemeLevel
    ? RANKS.find((r) => r.level === selectedThemeLevel && r.level <= rank.level) || rank
    : rank;

  // CSSカスタムプロパティを設定
  useEffect(() => {
    document.documentElement.style.setProperty("--theme-color", selectedThemeRank.themeColor);
    document.documentElement.style.setProperty("--theme-bg-color", selectedThemeRank.themeBgColor);
    document.documentElement.style.setProperty("--theme-accent-color", selectedThemeRank.themeAccentColor);
  }, [selectedThemeRank]);

  return (
    <ThemeContext.Provider
      value={{
        rank,
        themeColor: selectedThemeRank.themeColor,
        themeBgColor: selectedThemeRank.themeBgColor,
        themeAccentColor: selectedThemeRank.themeAccentColor,
        selectedThemeRank,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
