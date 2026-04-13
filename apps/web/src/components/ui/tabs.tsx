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
        "flex gap-1 rounded-lg border border-border bg-surface/50 p-1",
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
            "relative rounded-md px-4 py-2.5 text-sm font-medium transition-all duration-200",
            tab.disabled && "cursor-not-allowed opacity-40",
            activeTab === tab.value
              ? "bg-surface-light text-primary-300 shadow-xs"
              : "text-slate-400 hover:text-slate-200",
            !tab.disabled && activeTab !== tab.value && "hover:bg-surface/70"
          )}
        >
          <span className="flex items-center gap-2">
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                  activeTab === tab.value
                    ? "bg-primary-500/20 text-primary-200"
                    : "bg-surface-lighter text-slate-500"
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
