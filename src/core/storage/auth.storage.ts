import type { AppUser } from "@/src/core/store/app.store";

const USER_KEY = "sakhteman_user";

export const authStorage = {
  save(user: AppUser) {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.setItem(
      USER_KEY,
      JSON.stringify(user)
    );
  },

  load(): AppUser | null {
    if (typeof window === "undefined") {
      return null;
    }

    const raw =
      localStorage.getItem(USER_KEY);

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(
        raw
      ) as AppUser;
    } catch {
      localStorage.removeItem(
        USER_KEY
      );

      return null;
    }
  },

  clear() {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.removeItem(
      USER_KEY
    );
  },
};