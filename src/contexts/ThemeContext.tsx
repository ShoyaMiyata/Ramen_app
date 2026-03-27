"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { Rank, RANKS } from "@/lib/constants/ranks";

type ColorMode = "dark" | "light";

interface ThemeContextType {
  rank: Rank;
  themeColor: string;
  themeBgColor: string;
  themeAccentColor: string;
  selectedThemeRank: Rank;
  colorMode: ColorMode;
  toggleColorMode: () => void;
  isDark: boolean;
}

const defaultRank = RANKS[0];

const ThemeContext = createContext<ThemeContextType>({
  rank: defaultRank,
  themeColor: defaultRank.themeColor,
  themeBgColor: defaultRank.themeBgColor,
  themeAccentColor: defaultRank.themeAccentColor,
  selectedThemeRank: defaultRank,
  colorMode: "dark",
  toggleColorMode: () => {},
  isDark: true,
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
  const [colorMode, setColorMode] = useState<ColorMode>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("nooodle-color-mode") as ColorMode) || "dark";
    }
    return "dark";
  });

  const selectedThemeRank = selectedThemeLevel
    ? RANKS.find((r) => r.level === selectedThemeLevel && r.level <= rank.level) || rank
    : rank;

  const toggleColorMode = useCallback(() => {
    setColorMode((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("nooodle-color-mode", next);
      return next;
    });
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--theme-color", selectedThemeRank.themeColor);
    document.documentElement.style.setProperty("--theme-bg-color", selectedThemeRank.themeBgColor);
    document.documentElement.style.setProperty("--theme-accent-color", selectedThemeRank.themeAccentColor);
  }, [selectedThemeRank]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(colorMode);

    if (colorMode === "dark") {
      document.body.style.background = "#000000";
      document.body.style.color = "#e5e5e5";
    } else {
      document.body.style.background = "#f9fafb";
      document.body.style.color = "#111827";
    }
  }, [colorMode]);

  return (
    <ThemeContext.Provider
      value={{
        rank,
        themeColor: selectedThemeRank.themeColor,
        themeBgColor: selectedThemeRank.themeBgColor,
        themeAccentColor: selectedThemeRank.themeAccentColor,
        selectedThemeRank,
        colorMode,
        toggleColorMode,
        isDark: colorMode === "dark",
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
