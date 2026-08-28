import { apiClient } from "@/src/core/api/client";

import type {
  BuildingInfoItem,
} from "../types/building-info.types";

function parseArray(
  raw: string
): unknown[] {
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

  return Array.isArray(data)
    ? data
    : [];
}

export const buildingInfoApi = {
  async getAll(
    buildingId: string
  ): Promise<BuildingInfoItem[]> {
    const response =
      await apiClient.post<string>(
        "/sakhtemaninfo.php",
        {
          ids: buildingId,
          statephp:
            "searchsakhtemaninfo",
        }
      );

    const raw =
      String(response.data ?? "");

    console.log(
      "searchsakhtemaninfo response:",
      raw
    );

    if (
      raw === "no" ||
      raw === ""
    ) {
      return [];
    }

    return parseArray(raw).map(
      (item) => {
        const value =
          item as Record<
            string,
            unknown
          >;

        return {
          id: String(
            value.id ?? ""
          ),
          name: String(
            value.name ?? ""
          ),
          description: String(
            value.tozihat ?? ""
          ),
        };
      }
    );
  },

  async add(
    buildingId: string,
    name: string,
    description: string
  ) {
    const response =
      await apiClient.post<string>(
        "/sakhtemaninfo.php",
        {
          ids: buildingId,
          name,
          tozihat: description,
          statephp:
            "savenewsakhtemaninfo",
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
        "ثبت اطلاعات ساختمان انجام نشد.",
    };
  },

  async rename(
    buildingId: string,
    name: string
  ) {
    const response =
      await apiClient.post<string>(
        "/sakhtemaninfo.php",
        {
          ids: buildingId,
          name,
          statephp:
            "savenamesakhteman",
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
        "تغییر نام ساختمان انجام نشد.",
    };
  },

  async remove(
    infoId: string
  ) {
    const response =
      await apiClient.post<string>(
        "/sakhtemaninfo.php",
        {
          id: infoId,
          statephp:
            "deletesakhtemaninfo",
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
        "حذف اطلاعات انجام نشد.",
    };
  },
};