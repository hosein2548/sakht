// src/features/units/api/unit-history.api.ts
import { apiClient } from "@/src/core/api/client";

import type {
  ResidentHistory,
  GetHistoryParams,
  DeleteHistoryParams,
  HistoryResponse,
} from "../types/unit-history.types";

// ============================================
// Helper: تبدیل پاسخ سرور به ResidentHistory
// ============================================
function mapHistoryItem(
  item: Record<string, unknown>,
  role: "malek" | "saken"
): ResidentHistory {
  const startDate = String(item.startdate ?? item.startDate ?? "");
  const endDate = String(item.enddate ?? item.endDate ?? "");

  const isActive =
    endDate === "1490/01/01" ||
    endDate === "" ||
    endDate === "0";

  return {
    idvahed: String(item.idvahed ?? item.idv ?? ""),
    idnaghsh: String(item.idnaghsh ?? item.id ?? ""),
    iduser: String(item.iduser ?? item.idu ?? ""),

    startDate: startDate,
    endDate: isActive ? "" : endDate,
    count: String(item.count ?? item.countnafar ?? "0"),
    status: isActive ? "active" : "ended",

    // ⚠️ اینا رو از سوابق نمی‌تونیم داشته باشیم
    nameuser: String(item.nameuser ?? ""),
    phone: String(item.phone ?? ""),

    naghsh: role === "malek" ? "مالک" : "ساکن",
  };
}

// ============================================
// Helper: پارس پاسخ
// ============================================
function parseHistoryResponse(
  raw: string,
  role: "malek" | "saken"
): ResidentHistory[] {
  console.log("📜 Raw history response:", raw);

  if (raw === "no" || raw === "" || raw === "null") {
    console.log("📭 No history data found");
    return [];
  }

  if (!raw.startsWith("ok")) {
    console.warn("⚠️ Unexpected response format:", raw);
    return [];
  }

  const jsonStart = raw.indexOf("[");
  if (jsonStart === -1) {
    console.warn("⚠️ No JSON array found in response:", raw);
    return [];
  }

  try {
    const jsonText = raw.substring(jsonStart);
    const data = JSON.parse(jsonText);

    if (!Array.isArray(data)) {
      console.warn("⚠️ Response is not an array:", data);
      return [];
    }

    console.log(`✅ Found ${data.length} history records`);

    const result = data.map((item) => mapHistoryItem(item, role));
    console.log("📋 Mapped history:", result);

    return result;
  } catch (error) {
    console.error("❌ Cannot parse history response:", error);
    return [];
  }
}

// ============================================
// API
// ============================================
export const unitHistoryApi = {
  /**
   * دریافت سوابق سکونت/مالکیت یک واحد
   * API همه سوابق رو یکجا برمی‌گردونه (نیازی به userId نیست)
   */
  async getHistory(params: GetHistoryParams): Promise<ResidentHistory[]> {
  console.log("🔍 Getting history with params:", params);

  const role = params.role ?? "saken";

  const statephp =
    role === "malek"
      ? "showsavabegh_malek"
      : "showsavabegh_saken";

  try {
    const response = await apiClient.post<string>("/vahed.php", {
      idv: params.unitId,
      idu: params.userId,  // ✅ userId برگشت
      naghsh: role,
      statephp,
    });

    const raw = String(response.data ?? "");
    console.log("📡 Server response for history:", raw);

    if (!raw || raw === "null") {
      console.log("📭 Empty response from server");
      return [];
    }

    return parseHistoryResponse(raw, role);
  } catch (error) {
    console.error("❌ Get history error:", error);
    return [];
  }
},

  /**
   * پایان دادن به یک دوره
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
          message: "دوره با موفقیت پایان یافت.",
        };
      }

      if (raw === "no" || raw.startsWith("no")) {
        const message = raw === "no" ? "خطا در پایان دوره." : raw.substring(2);
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