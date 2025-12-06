"use client";

import { createContext, useContext, useEffect, ReactNode } from "react";
import { Rank, RANKS } from "@/lib/constants/ranks";

interface ThemeContextType {
  rank: Rank;
  themeColor: string;
  themeBgColor: string;
  themeAccentColor: string;
}

const defaultRank = RANKS[0];

const ThemeContext = createContext<ThemeContextType>({
  rank: defaultRank,
  themeColor: defaultRank.themeColor,
  themeBgColor: defaultRank.themeBgColor,
  themeAccentColor: defaultRank.themeAccentColor,
});

export function useTheme() {
  return useContext(ThemeContext);
}

interface ThemeProviderProps {
  children: ReactNode;
  rank: Rank;
}

export function ThemeProvider({ children, rank }: ThemeProviderProps) {
  // CSSカスタムプロパティを設定
  useEffect(() => {
    document.documentElement.style.setProperty("--theme-color", rank.themeColor);
    document.documentElement.style.setProperty("--theme-bg-color", rank.themeBgColor);
    document.documentElement.style.setProperty("--theme-accent-color", rank.themeAccentColor);
  }, [rank]);

  return (
    <ThemeContext.Provider
      value={{
        rank,
        themeColor: rank.themeColor,
        themeBgColor: rank.themeBgColor,
        themeAccentColor: rank.themeAccentColor,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
