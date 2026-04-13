"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { useAppStore } from "@/stores/app.store";
import { cn } from "@/lib/cn";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main
        className={cn(
          "min-h-screen transition-all duration-300",
          sidebarOpen ? "ml-64" : "ml-20"
        )}
      >
        {children}
      </main>
    </div>
  );
}
