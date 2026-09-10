// src/features/units/api/unit-history.api.ts
import { apiClient } from "@/src/core/api/client";

import type {
  ResidentHistory,
  GetHistoryParams,
  DeleteHistoryParams,
  HistoryResponse,
} from "../types/unit-history.types";

/**
 * تبدیل پاسخ سرور به آبجکت سابقه
 */
function mapHistoryItem(item: Record<string, unknown>): ResidentHistory {
  const startDate = String(item.startdate ?? item.startDate ?? "");
  const endDate = String(item.enddate ?? item.endDate ?? "");

  // در فلاتر: اگر enddate === "1450/01/01" باشه، یعنی تا کنون
  const isActive = endDate === "1490/01/01" || endDate === "" || endDate === "0";

  return {
    idvahed: String(item.idvahed ?? item.idv ?? ""),
    idnaghsh: String(item.idnaghsh ?? item.id ?? ""),
    startDate: startDate,
    endDate: isActive ? "" : endDate,
    count: String(item.count ?? item.countnafar ?? "0"),
    status: isActive ? "active" : "ended",
  };
}

/**
 * پارس کردن پاسخ سرور
 */
function parseHistoryResponse(raw: string): ResidentHistory[] {
  console.log("📜 Raw history response:", raw);

  // اگر پاسخ "no" باشه، یعنی هیچ داده‌ای وجود نداره
  if (raw === "no" || raw === "" || raw === "null") {
    console.log("📭 No history data found");
    return [];
  }

  // اگر پاسخ با "ok" شروع نشده باشه، خطا
  if (!raw.startsWith("ok")) {
    console.warn("⚠️ Unexpected response format:", raw);
    return [];
  }

  // استخراج JSON از پاسخ
  const jsonStart = raw.indexOf("[");
  if (jsonStart === -1) {
    console.warn("⚠️ No JSON array found in response:", raw);
    if (raw === "ok") {
      return [];
    }
    return [];
  }

  try {
    const jsonText = raw.substring(jsonStart);
    console.log("📄 Extracted JSON:", jsonText);

    const data = JSON.parse(jsonText);

    if (!Array.isArray(data)) {
      console.warn("⚠️ Response is not an array:", data);
      return [];
    }

    console.log(`✅ Found ${data.length} history records`);

    const result = data.map(mapHistoryItem);
    console.log("📋 Mapped history:", result);

    return result;
  } catch (error) {
    console.error("❌ Cannot parse history response:", error);
    return [];
  }
}

export const unitHistoryApi = {
  /**
   * دریافت سوابق سکونت یک فرد در یک واحد
   */
  async getHistory(params: GetHistoryParams): Promise<ResidentHistory[]> {
    console.log("🔍 Getting history with params:", params);

    try {
      const response = await apiClient.post<string>("/vahed.php", {
        idv: params.unitId, // شناسه واحد
        idu: params.userId, // شناسه کاربر (ساکن یا مالک)
        // ✅ اصلاح: همیشه "saken" برای دریافت سوابق ساکن
        naghsh: "saken",
        // ✅ اصلاح: statephp درست
        statephp: "showsavabegh_saken",
      });

      const raw = String(response.data ?? "");
      console.log("📡 Server response for history:", raw);

      if (!raw || raw === "null") {
        console.log("📭 Empty response from server");
        return [];
      }

      return parseHistoryResponse(raw);
    } catch (error) {
      console.error("❌ Get history error:", error);
      return [];
    }
  },

  /**
   * پایان دادن به یک دوره سکونت
   */
  async endHistory(params: DeleteHistoryParams): Promise<HistoryResponse> {
    console.log("🗑️ Ending history with params:", params);

    try {
      const response = await apiClient.post<string>("/vahed.php", {
        idnaghsh: params.idnaghsh,
        date: params.endDate,
        statephp: "DeleteMalekSaken",
      });

      const raw = String(response.data ?? "");
      console.log("📡 Delete response:", raw);

      if (raw.startsWith("ok")) {
        return {
          success: true,
          message: "دوره سکونت با موفقیت پایان یافت.",
        };
      }

      if (raw === "no" || raw.startsWith("no")) {
        const message = raw === "no" ? "خطا در پایان سکونت." : raw.substring(2);
        return {
          success: false,
          message,
        };
      }

      return {
        success: false,
        message: "خطا در ارتباط با سرور.",
      };
    } catch (error) {
      console.error("❌ End history error:", error);
      return {
        success: false,
        message: "ارتباط با سرور برقرار نشد.",
      };
    }
  },
};