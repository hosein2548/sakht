import { apiClient } from "@/src/core/api/client";

import type {
  NotificationItem,
} from "../types/notification.types";

function getDescription(
  type: string
): string {
  if (type === "cost") {
    return "هزینه جدید";
  }

  if (type === "message") {
    return "پیام جدید";
  }

  if (type === "elanat") {
    return "اعلان جدید";
  }

  if (
    type === "endmidir" ||
    type === "newmidir" ||
    type === "pishnahad"
  ) {
    return "مورد جدید در مدیریت ثبت شده است";
  }

  return "مورد جدید";
}

export const notificationApi = {
  async getNotifications(
    userId: string
  ): Promise<NotificationItem[]> {
    const response =
      await apiClient.post<string>(
        "/notif.php",
        {
          idu: userId,
          statephp: "getnotif",
        }
      );

    const raw =
      String(response.data ?? "");

    console.log(
      "notification response:",
      raw
    );

    if (
      raw === "no" ||
      raw.startsWith("no")
    ) {
      return [];
    }

    if (!raw.startsWith("ok")) {
      throw new Error(
        "دریافت اعلان‌ها ناموفق بود."
      );
    }

    const jsonStart =
      raw.indexOf("[");

    if (jsonStart === -1) {
      throw new Error(
        "فرمت پاسخ اعلان‌ها نامعتبر است."
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
        (item): NotificationItem => ({
          id: String(
            item?.id ?? ""
          ),

          ids: String(
            item?.ids ?? ""
          ),

          idv: String(
            item?.idv ?? ""
          ),

          naghsh: String(
            item?.naghsh ?? ""
          ),

          noepayam: String(
            item?.noepayam ?? ""
          ),

          count: String(
            item?.count ?? ""
          ),

          subject: String(
            item?.subject ?? ""
          ),

          description:
            getDescription(
              String(
                item?.noepayam ?? ""
              )
            ),

          countall: "0",

          naghshsend: String(
            item?.naghshsend ?? ""
          ),
        })
      );
    } catch (error) {
      console.error(
        "Cannot parse notification response:",
        error
      );

      throw new Error(
        "خواندن اعلان‌ها ناموفق بود."
      );
    }
  },
};