"use client";

// hooks/use-theme.ts
//
// NOTE: pairs with the blocking script in app/layout.tsx (same localStorage key
// "theme"). The script sets the .dark class before React hydrates, so the
// initial state matches the stored preference without a flash.

import { useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "theme";

export function useTheme() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    queueMicrotask(() =>
      setIsDark(document.documentElement.classList.contains("dark")),
    );
  }, []);

  const toggle = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
      return next;
    });
  }, []);

  return { isDark, toggle } as const;
}
