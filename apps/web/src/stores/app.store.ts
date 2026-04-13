import { create } from "zustand";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: string;
}

interface AppState {
  sidebarOpen: boolean;
  activeSection: string;
  notifications: Notification[];
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveSection: (section: string) => void;
  addNotification: (notification: Omit<Notification, "id" | "createdAt">) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  activeSection: "dashboard",
  notifications: [
    {
      id: "1",
      title: "Profile Optimized",
      message: "Your LinkedIn headline has been updated with AI suggestions.",
      type: "success",
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: "2",
      title: "New Job Matches",
      message: "12 new jobs match your profile. Review them now.",
      type: "info",
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    },
    {
      id: "3",
      title: "Content Published",
      message: "Your LinkedIn post was scheduled for tomorrow at 9 AM.",
      type: "success",
      read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    },
  ],

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setActiveSection: (section) => set({ activeSection: section }),

  addNotification: (notification) =>
    set((s) => ({
      notifications: [
        {
          ...notification,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        },
        ...s.notifications,
      ],
    })),

  markNotificationRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),

  clearNotifications: () => set({ notifications: [] }),
}));
