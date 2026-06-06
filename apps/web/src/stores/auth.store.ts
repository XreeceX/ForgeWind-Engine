import { create } from 'zustand';

/** UI-facing identity — populated from the NextAuth session, not stored with tokens. */
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  headline?: string;
  linkedinConnected: boolean;
}

export interface AuthStore {
  user: User | null;
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
}

/**
 * Lightweight UI store for user identity.
 * Tokens are NOT stored here — they live exclusively in the NextAuth session cookie.
 * This store is populated by SyncSessionToStore mounted in the protected layout.
 */
export const useAuthStore = create<AuthStore>()((set) => ({
  user: null,

  setUser: (user) => set({ user }),

  updateUser: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),
}));
