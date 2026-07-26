"use client";

import { useTheme } from "@/hooks/use-theme";
import { SunIcon, MoonIcon } from "@/components/icons";

export function ThemeToggle() {
  const { isDark, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "تم روشن" : "تم تاریک"}
      className="flex size-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-bg-surface hover:text-text-primary"
    >
      {isDark ? <SunIcon className="size-5" /> : <MoonIcon className="size-5" />}
    </button>
  );
}
