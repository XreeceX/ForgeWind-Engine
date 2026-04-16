"use client";

import { cn } from "@/lib/cn";
import { useMemo } from "react";

export interface TabItem {
  label: string;
  value: string;
  count?: number;
  disabled?: boolean;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (value: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  const activeIndex = useMemo(
    () => tabs.findIndex((tab) => tab.value === activeTab),
    [tabs, activeTab]
  );

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!tabs.length) return;
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

    const direction = event.key === "ArrowRight" ? 1 : -1;
    let nextIndex = activeIndex >= 0 ? activeIndex : 0;
    const maxAttempts = tabs.length;
    let attempts = 0;

    do {
      nextIndex = (nextIndex + direction + tabs.length) % tabs.length;
      attempts += 1;
    } while (tabs[nextIndex]?.disabled && attempts < maxAttempts);

    const nextTab = tabs[nextIndex];
    if (nextTab && !nextTab.disabled) {
      onChange(nextTab.value);
    }
  }

  return (
    <div
      className={cn(
        "flex gap-1 rounded-xl border border-border bg-white/80 p-1.5 shadow-xs backdrop-blur-sm",
        className
      )}
      role="tablist"
      aria-orientation="horizontal"
      onKeyDown={onKeyDown}
    >
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          disabled={tab.disabled}
          role="tab"
          aria-selected={activeTab === tab.value}
          aria-controls={`tab-panel-${tab.value}`}
          className={cn(
            "relative rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-300",
            tab.disabled && "cursor-not-allowed opacity-40",
            activeTab === tab.value
              ? "premium-border bg-white text-violet-600 shadow-xs"
              : "text-slate-500 hover:text-slate-900",
            !tab.disabled && activeTab !== tab.value && "hover:bg-slate-50"
          )}
        >
          <span className="flex items-center gap-2">
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                  activeTab === tab.value
                    ? "bg-violet-100 text-violet-700"
                    : "bg-slate-100 text-slate-500"
                )}
              >
                {tab.count}
              </span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
}
