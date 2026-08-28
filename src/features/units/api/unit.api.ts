import { apiClient } from "@/src/core/api/client";

import type {
  UnitSummary,
} from "../types/unit.types";

export const unitApi = {
  async getAll(
    buildingId: string
  ): Promise<UnitSummary[]> {
    const response =
      await apiClient.post<string>(
        "/vahed.php",
        {
          ids: buildingId,
          statephp: "getAllvahed",
        }
      );

    const raw =
      String(response.data ?? "");

    console.log(
      "getAllvahed response:",
      raw
    );

    if (
      raw === "no" ||
      raw === ""
    ) {
      return [];
    }

    if (!raw.startsWith("ok")) {
      throw new Error(
        "دریافت اطلاعات واحدها ناموفق بود."
      );
    }

    const jsonStart =
      raw.indexOf("[");

    if (jsonStart === -1) {
      throw new Error(
        "فرمت پاسخ واحدها نامعتبر است."
      );
    }

    try {
      const data = JSON.parse(
        raw.substring(jsonStart)
      );

      if (!Array.isArray(data)) {
        return [];
      }

      return data.map(
        (item): UnitSummary => ({
          ids: String(
            item?.ids ?? ""
          ),

          names: String(
            item?.names ?? ""
          ),

          idmodir: String(
            item?.idmodir ?? ""
          ),

          namemodir: String(
            item?.namemodir ?? ""
          ),

          idv: String(
            item?.idv ?? ""
          ),

          namev: String(
            item?.namev ?? ""
          ),

          metter: String(
            item?.metter ?? ""
          ),

          countnafar: String(
            item?.countnafar ?? ""
          ),
        })
      );
    } catch (error) {
      console.error(
        "Cannot parse getAllvahed response:",
        error
      );

      throw new Error(
        "خواندن اطلاعات واحدها ناموفق بود."
      );
    }
  },
};