"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "./api";

export interface AuthUser {
  id:             string;
  email:          string;
  username:       string;
  role:           "user" | "publisher" | "admin";
  level:          number;
  exp_total:      number;
  wallet_balance: number;
  avatar_url:     string | null;
  is_verified:    boolean;
}

interface AuthState {
  user:         AuthUser | null;
  accessToken:  string | null;
  refreshToken: string | null;
  isLoading:    boolean;

  setAuth:      (user: AuthUser, accessToken: string, refreshToken: string) => void;
  setUser:      (user: AuthUser) => void;
  logout:       () => Promise<void>;
  refreshAccess: () => Promise<boolean>;
  fetchMe:      () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user:         null,
      accessToken:  null,
      refreshToken: null,
      isLoading:    false,

      setAuth(user, accessToken, refreshToken) {
        set({ user, accessToken, refreshToken });
      },

      setUser(user) {
        set({ user });
      },

      async logout() {
        const { refreshToken } = get();
        try {
          if (refreshToken) await api.post("/auth/logout", { refresh_token: refreshToken });
        } catch { /* ignore */ }
        set({ user: null, accessToken: null, refreshToken: null });
      },

      async refreshAccess() {
        const { refreshToken } = get();
        if (!refreshToken) return false;
        try {
          const { data } = await api.post("/auth/refresh", { refresh_token: refreshToken });
          set({ accessToken: data.access_token });
          return true;
        } catch {
          set({ user: null, accessToken: null, refreshToken: null });
          return false;
        }
      },

      async fetchMe() {
        set({ isLoading: true });
        try {
          const { data } = await api.get("/auth/me");
          set({ user: data.data });
        } catch {
          // token invalid — let interceptor handle
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "booksteam-auth",
      partialize: (s) => ({
        user:         s.user,
        accessToken:  s.accessToken,
        refreshToken: s.refreshToken,
      }),
    }
  )
);
