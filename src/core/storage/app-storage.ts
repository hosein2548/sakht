const STORAGE_KEY = "sakhteman_app";

export interface StoredAppContext {
  iduser: string;

  ids?: string;
  idv?: string;

  malek?: string;
  saken?: string;
  modir?: string;

  namesakhteman?: string;
  namevahed?: string;

  namecity?: string;
  nameostan?: string;
  codeostan?: string;

  idcity?: string;
}

export const appStorage = {
  get(): StoredAppContext | null {
    if (typeof window === "undefined") {
      return null;
    }

    try {
      const value =
        localStorage.getItem(STORAGE_KEY);

      if (!value) {
        return null;
      }

      return JSON.parse(
        value
      ) as StoredAppContext;
    } catch {
      return null;
    }
  },

  set(data: StoredAppContext) {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(data)
    );
  },

  clear() {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.removeItem(STORAGE_KEY);
  },
};