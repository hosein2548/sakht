import { create } from "zustand";

import type {
  NotificationItem,
} from "../types/notification.types";

interface NotificationState {
  notifications: NotificationItem[];

  isLoading: boolean;

  error: string | null;

  setNotifications: (
    notifications: NotificationItem[]
  ) => void;

  setLoading: (
    loading: boolean
  ) => void;

  setError: (
    error: string | null
  ) => void;

  removeNotification: (
    id: string
  ) => void;

  clear: () => void;
}

export const useNotificationStore =
  create<NotificationState>(
    (set) => ({
      notifications: [],

      isLoading: false,

      error: null,

      setNotifications: (
        notifications
      ) =>
        set({
          notifications,
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

      removeNotification: (
        id
      ) =>
        set((state) => ({
          notifications:
            state.notifications.filter(
              (item) =>
                item.id !== id
            ),
        })),

      clear: () =>
        set({
          notifications: [],

          isLoading: false,

          error: null,
        }),
    })
  );