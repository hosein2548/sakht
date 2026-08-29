// src/core/store/app.store.ts
import { create } from "zustand";

export interface AppUser {
  iduser: string;
  nameuser: string;
  phone: string;
}

interface AppState {
  user: AppUser | null;

  setUser: (user: AppUser | null) => void;
  clearUser: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,

  setUser: (user) => set({ user }),

  clearUser: () => set({ user: null }),
}));