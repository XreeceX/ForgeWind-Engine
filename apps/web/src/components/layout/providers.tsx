"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { AntiCopyProvider } from "@/components/layout/anti-copy-provider";
import { Toaster } from "react-hot-toast";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <AntiCopyProvider>{children}</AntiCopyProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            className: "fw-toast",
            style: {
              background: "#FFFFFF",
              color: "#1C1917",
              border: "1px solid #E7E5E4",
              borderRadius: "12px",
              boxShadow: "0 8px 24px rgba(28, 25, 23, 0.08)",
              padding: "12px 16px",
              fontSize: "14px",
            },
            success: {
              iconTheme: {
                primary: "#F97316",
                secondary: "#FFFFFF",
              },
            },
            error: {
              iconTheme: {
                primary: "#EF4444",
                secondary: "#FFFFFF",
              },
            },
          }}
        />
      </QueryClientProvider>
    </SessionProvider>
  );
}
