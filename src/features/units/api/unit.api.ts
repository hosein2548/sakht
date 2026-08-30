// src/features/units/api/unit.api.ts
import { apiClient } from "@/src/core/api/client";
import type { UnitSummary } from "../types/unit.types";

export interface CreateUnitInput {
  ids: string; // شناسه ساختمان
  namevahed: string;
  metter: string;
  aab: string;
  gaz: string;
  bargh: string;
  parking: string;
  anbari: string;
  tozihat: string;
  datefrom: string;
}

export const unitApi = {
  async getAll(buildingId: string): Promise<UnitSummary[]> {
    const response = await apiClient.post<string>("/vahed.php", {
      ids: buildingId,
      statephp: "getAllvahed",
    });

    const raw = String(response.data ?? "");
    console.log("🔍 getAllvahed RAW response:", raw); // برای دیباگ

    if (raw === "no" || raw === "") {
      return [];
    }

    if (!raw.startsWith("ok")) {
      throw new Error("دریافت اطلاعات واحدها ناموفق بود.");
    }

    const jsonStart = raw.indexOf("[");
    if (jsonStart === -1) {
      throw new Error("فرمت پاسخ واحدها نامعتبر است.");
    }

    try {
      const data = JSON.parse(raw.substring(jsonStart));

      if (!Array.isArray(data)) {
        return [];
      }

      return data.map((item): UnitSummary => ({
        ids: String(item?.ids ?? ""),
        names: String(item?.names ?? ""),
        idmodir: String(item?.idmodir ?? ""),
        namemodir: String(item?.namemodir ?? ""),
        idv: String(item?.idv ?? ""),
        namev: String(item?.namev ?? ""),
        // ✅ اصلاح: استفاده از `metraj` به جای `metter`
        metter: String(item?.metraj ?? item?.metter ?? ""),
        // ✅ اصلاح: استفاده از `tedad` به جای `countnafar`
        countnafar: String(item?.tedad ?? item?.countnafar ?? ""),
      }));
    } catch (error) {
      console.error("Cannot parse getAllvahed response:", error);
      throw new Error("خواندن اطلاعات واحدها ناموفق بود.");
    }
  },

  async create(input: CreateUnitInput): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiClient.post<string>("/vahed.php", {
        ids: input.ids,
        namevahed: input.namevahed,
        metter: input.metter,
        aab: input.aab || "0",
        gaz: input.gaz || "0",
        bargh: input.bargh || "0",
        parking: input.parking || "0",
        anbari: input.anbari || "0",
        tozihat: input.tozihat || "0",
        datefrom: input.datefrom,
        statephp: "SaveNewvahed",
      });

      const raw = String(response.data ?? "");
      console.log("📤 SaveNewvahed response:", raw);

      if (raw.startsWith("ok")) {
        return {
          success: true,
          message: "واحد با موفقیت ایجاد شد.",
        };
      }

      if (raw === "no") {
        return {
          success: false,
          message: "خطا در ایجاد واحد.",
        };
      }

      return {
        success: false,
        message: "ایجاد واحد انجام نشد.",
      };
    } catch (error) {
      console.error("❌ Create unit error:", error);
      return {
        success: false,
        message: "ارتباط با سرور برقرار نشد.",
      };
    }
  },
};