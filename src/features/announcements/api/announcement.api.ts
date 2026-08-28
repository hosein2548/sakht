import { apiClient } from "@/src/core/api/client";

import type {
  Announcement,
} from "../types/announcement.types";

export const announcementApi = {
  async getRecent(
    buildingId: string
  ): Promise<Announcement[]> {
    const response =
      await apiClient.post<string>(
        "/message.php",
        {
          ids: buildingId,
          count: "3",
          statephp:
            "getpayam_elanat",
        }
      );

    const raw =
      String(response.data ?? "");

    console.log(
      "announcement response:",
      raw
    );

    if (
      raw === "no" ||
      raw === "no elaanaat"
    ) {
      return [];
    }

    if (!raw.startsWith("ok")) {
      throw new Error(
        "دریافت اطلاعیه‌های ساختمان ناموفق بود."
      );
    }

    const jsonStart =
      raw.indexOf("[");

    if (jsonStart === -1) {
      throw new Error(
        "فرمت پاسخ اطلاعیه‌ها نامعتبر است."
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
        (item): Announcement => ({
          subject: String(
            item?.subject ?? ""
          ),

          message: String(
            item?.mymessage ?? ""
          ),

          date: String(
            item?.date ?? ""
          ),
        })
      );
    } catch (error) {
      console.error(
        "Cannot parse announcement response:",
        error
      );

      throw new Error(
        "خواندن اطلاعیه‌های ساختمان ناموفق بود."
      );
    }
  },
};