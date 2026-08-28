import { create } from "zustand";

import type {
  Announcement,
} from "../types/announcement.types";

interface AnnouncementState {
  announcements: Announcement[];

  isLoading: boolean;

  error: string | null;

  setAnnouncements: (
    announcements: Announcement[]
  ) => void;

  setLoading: (
    loading: boolean
  ) => void;

  setError: (
    error: string | null
  ) => void;

  clear: () => void;
}

export const useAnnouncementStore =
  create<AnnouncementState>(
    (set) => ({
      announcements: [],

      isLoading: false,

      error: null,

      setAnnouncements: (
        announcements
      ) =>
        set({
          announcements,
        }),

      setLoading: (
        loading
      ) =>
        set({
          isLoading: loading,
        }),

      setError: (
        error
      ) =>
        set({
          error,
        }),

      clear: () =>
        set({
          announcements: [],
          isLoading: false,
          error: null,
        }),
    })
  );