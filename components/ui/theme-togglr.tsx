"use client";

import * as React from "react";
import { RxSun } from "react-icons/rx";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { BsFillMoonStarsFill } from "react-icons/bs";

export function Themetoggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full border border-neutral-400/50 bg-white text-black hover:bg-neutral-100 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800 dark:border-neutral-700/50",
      )}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      <BsFillMoonStarsFill className="hidden h-4 w-4 dark:block" />
      <RxSun className="block h-4 w-4 dark:hidden" />
    </button>
  );
}
