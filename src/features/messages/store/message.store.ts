import { create } from "zustand";

import type {
  AnnouncementMessage,
  MessageUnit,
  PrivateMessage,
} from "../types/message.types";

interface MessageState {
  announcements: AnnouncementMessage[];

  units: MessageUnit[];

  privateMessages: PrivateMessage[];

  isLoadingAnnouncements: boolean;

  isLoadingUnits: boolean;

  isLoadingPrivate: boolean;

  error: string | null;

  setAnnouncements: (
    items: AnnouncementMessage[]
  ) => void;

  setUnits: (
    items: MessageUnit[]
  ) => void;

  setPrivateMessages: (
    items: PrivateMessage[]
  ) => void;

  setLoadingAnnouncements: (
    loading: boolean
  ) => void;

  setLoadingUnits: (
    loading: boolean
  ) => void;

  setLoadingPrivate: (
    loading: boolean
  ) => void;

  setError: (
    error: string | null
  ) => void;

  clear: () => void;
}

export const useMessageStore =
  create<MessageState>(
    (set) => ({
      announcements: [],

      units: [],

      privateMessages: [],

      isLoadingAnnouncements:
        false,

      isLoadingUnits: false,

      isLoadingPrivate:
        false,

      error: null,

      setAnnouncements: (
        items
      ) =>
        set({
          announcements: items,
        }),

      setUnits: (
        items
      ) =>
        set({
          units: items,
        }),

      setPrivateMessages: (
        items
      ) =>
        set({
          privateMessages:
            items,
        }),

      setLoadingAnnouncements:
        (loading) =>
          set({
            isLoadingAnnouncements:
              loading,
          }),

      setLoadingUnits:
        (loading) =>
          set({
            isLoadingUnits:
              loading,
          }),

      setLoadingPrivate:
        (loading) =>
          set({
            isLoadingPrivate:
              loading,
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

          units: [],

          privateMessages: [],

          isLoadingAnnouncements:
            false,

          isLoadingUnits:
            false,

          isLoadingPrivate:
            false,

          error: null,
        }),
    })
  );