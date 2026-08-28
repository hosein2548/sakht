import { apiClient } from "@/src/core/api/client";

import type { MainInfo } from "../types/dashboard.types";

export const dashboardApi = {
  async getMainInfo(
    ids: string,
    iduser: string
  ): Promise<MainInfo | null> {
    const response =
      await apiClient.post<string>(
        "/infomain.php",
        {
          ids,
          idu: iduser,
          statephp: "getinfo",
        }
      );

    const raw =
      String(response.data ?? "");

    console.log(
      "infomain response:",
      raw
    );

    if (raw === "no") {
      return null;
    }

    if (!raw.startsWith("ok")) {
      throw new Error(
        "دریافت اطلاعات صفحه اصلی ناموفق بود."
      );
    }

    const jsonStart =
      raw.indexOf("[");

    if (jsonStart === -1) {
      throw new Error(
        "فرمت پاسخ infomain نامعتبر است."
      );
    }

    try {
      const data = JSON.parse(
        raw.substring(jsonStart)
      );

      if (
        !Array.isArray(data) ||
        data.length === 0
      ) {
        return null;
      }

      const item = data[0];

      return {
        mojoodi: String(
          item?.mojoodi ?? ""
        ),

        bedehi: String(
          item?.bedehi ?? ""
        ),

        countvahed: String(
          item?.countvahed ?? ""
        ),

        countnafar: String(
          item?.countnafar ?? ""
        ),

        rezerv1: String(
          item?.rezerv1 ?? ""
        ),

        rezerv2: String(
          item?.rezerv2 ?? ""
        ),

        nameuser: String(
          item?.nameuser ?? ""
        ),

        phone: String(
          item?.phone ?? ""
        ),
      };
    } catch (error) {
      console.error(
        "Cannot parse infomain response:",
        error
      );

      throw new Error(
        "خواندن اطلاعات صفحه اصلی ناموفق بود."
      );
    }
  },
};