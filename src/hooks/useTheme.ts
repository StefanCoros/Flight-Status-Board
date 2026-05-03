import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "fsb:theme";
const DEFAULT_THEME: Theme = "dark";

const isTheme = (value: unknown): value is Theme =>
  value === "light" || value === "dark";

const readStoredTheme = (): Theme => {
  if (typeof window === "undefined") return DEFAULT_THEME;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isTheme(stored) ? stored : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
};

export const useTheme = (): readonly [Theme, (next: Theme) => void] => {
  const [theme, setTheme] = useState<Theme>(() => readStoredTheme());

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore storage errors (private mode, disabled storage, etc.)
    }
  }, [theme]);

  const updateTheme = useCallback((next: Theme) => {
    setTheme(next);
  }, []);

  return [theme, updateTheme];
};
