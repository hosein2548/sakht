import { apiClient } from "@/src/core/api/client";

import type {
  Manager,
  ManagerRole,
} from "../types/manager.types";

function parseManagers(
  raw: string
): Manager[] {
  if (!raw.startsWith("ok")) {
    return [];
  }

  const jsonStart =
    raw.indexOf("[");

  if (jsonStart === -1) {
    return [];
  }

  const data = JSON.parse(
    raw.substring(jsonStart)
  );

  if (!Array.isArray(data)) {
    return [];
  }

  return data.map(
    (item): Manager => {
      const role =
        String(
          item?.naghsh ?? ""
        );

      let statemodir:
        ManagerRole =
        "مدیر";

      if (
        role === "modir_pish"
      ) {
        statemodir =
          "مدیر پیشنهادی";
      } else if (
        role === "modir_end"
      ) {
        statemodir =
          "مدیریت قبلی";
      }

      return {
        mobile: String(
          item?.phone ?? ""
        ),

        name: String(
          item?.name ?? ""
        ),

        datestart: String(
          item?.startdate ?? ""
        ),

        dateend:
          role ===
          "modir_end"
            ? String(
                item?.enddate ?? ""
              )
            : "",

        statemodir,
      };
    }
  );
}

export const managerApi = {
  async getAll(
    buildingId: string
  ): Promise<Manager[]> {
    const response =
      await apiClient.post<string>(
        "/modir.php",
        {
          ids: buildingId,
          statephp:
            "getAllmodir",
        }
      );

    const raw =
      String(response.data ?? "");

    console.log(
      "getAllmodir response:",
      raw
    );

    if (
      raw === "no" ||
      raw === ""
    ) {
      return [];
    }

    return parseManagers(raw);
  },

  async checkPhone(
    buildingId: string,
    userId: string,
    phone: string
  ): Promise<
    "ok" |
    "notekrari" |
    "nouser"
  > {
    const response =
      await apiClient.post<string>(
        "/modir.php",
        {
          ids: buildingId,
          phone,
          idu: userId,
          statephp:
            "checknumber",
        }
      );

    const raw =
      String(response.data ?? "");

    if (
      raw === "ok"
    ) {
      return "ok";
    }

    if (
      raw === "notekrari"
    ) {
      return "notekrari";
    }

    if (
      raw === "nouser"
    ) {
      return "nouser";
    }

    throw new Error(
      "بررسی شماره مدیر ناموفق بود."
    );
  },

  async addManager(
    buildingId: string,
    userId: string,
    phone: string
  ) {
    const response =
      await apiClient.post<string>(
        "/modir.php",
        {
          ids: buildingId,
          phone,
          idu: userId,
          statephp:
            "savenewmodir",
        }
      );

    const raw =
      String(response.data ?? "");

    if (
      raw.startsWith("ok")
    ) {
      return {
        success: true,
      };
    }

    return {
      success: false,
      message:
        "ثبت مدیر انجام نشد.",
    };
  },

  async deleteManager(
    buildingId: string,
    userId: string,
    manager: Manager
  ) {
    let role =
      "modir";

    if (
      manager.statemodir ===
      "مدیر پیشنهادی"
    ) {
      role =
        "modir_pish";
    }

    if (
      manager.statemodir ===
      "مدیریت قبلی"
    ) {
      role =
        "modir_end";
    }

    const response =
      await apiClient.post<string>(
        "/modir.php",
        {
          ids: buildingId,

          phone:
            manager.mobile,

          naghsh:
            role,

          idu: userId,

          statephp:
            "deletemodir",
        }
      );

    const raw =
      String(response.data ?? "");

    if (
      raw.startsWith("ok")
    ) {
      return {
        success: true,
      };
    }

    if (
      raw === "nodelete"
    ) {
      return {
        success: false,

        message:
          "به دلیل اینکه فقط یک مدیر وجود دارد، امکان حذف وجود ندارد.",
      };
    }

    return {
      success: false,

      message:
        "حذف مدیر انجام نشد.",
    };
  },
};