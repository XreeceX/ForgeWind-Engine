"use client";

import { cn } from "@/lib/cn";

interface TabItem {
  label: string;
  value: string;
  count?: number;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (value: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div
      className={cn(
        "flex gap-1 border-b border-border",
        className
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            "relative px-4 py-2.5 text-sm font-medium transition-colors",
            activeTab === tab.value
              ? "text-primary-400"
              : "text-slate-400 hover:text-slate-200"
          )}
        >
          <span className="flex items-center gap-2">
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                  activeTab === tab.value
                    ? "bg-primary-500/20 text-primary-400"
                    : "bg-surface-lighter text-slate-500"
                )}
              >
                {tab.count}
              </span>
            )}
          </span>
          {activeTab === tab.value && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}
