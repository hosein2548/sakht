// src/features/units/api/unit-detail.api.ts
import { apiClient } from "@/src/core/api/client";

interface UnitDetail {
  idvahed: string;
  namevahed: string;
  metter: string;
  bargh: string;
  aab: string;
  gaz: string;
  parking: string;
  anbari: string;
  tozihat: string;
  stateFullEmpty: "full" | "empty";
  dateFrom: string;
}

function parseUnitDetail(raw: string): UnitDetail | null {
  console.log("🔍 Raw unit detail response:", raw);

  if (!raw.startsWith("ok")) {
    console.warn("Unit detail response not ok:", raw);
    return null;
  }

  const jsonStart = raw.indexOf("[");
  if (jsonStart === -1) {
    console.warn("No JSON array in unit detail response");
    return null;
  }

  try {
    const data = JSON.parse(raw.substring(jsonStart));
    if (!Array.isArray(data) || data.length === 0) {
      return null;
    }

    const item = data[0];
    
    // ✅ تشخیص وضعیت واحد از فیلدهای مختلف
    let stateFullEmpty: "full" | "empty" = "empty";
    if (item.fullempty === "full" || item.state === "full" || item.status === "full") {
      stateFullEmpty = "full";
    } else if (item.fullempty === "empty" || item.state === "empty" || item.status === "empty") {
      stateFullEmpty = "empty";
    }

    return {
      idvahed: String(item.idv ?? item.idvahed ?? ""),
      namevahed: String(item.namev ?? item.namevahed ?? ""),
      // ✅ اصلاح: استفاده از `metraj` به جای `metter`
      metter: String(item.metraj ?? item.metter ?? ""),
      bargh: String(item.bargh ?? ""),
      aab: String(item.aab ?? ""),
      gaz: String(item.gaz ?? ""),
      parking: String(item.parking ?? ""),
      anbari: String(item.anbari ?? ""),
      tozihat: String(item.tozihat ?? ""),
      stateFullEmpty,
      dateFrom: String(item.date ?? item.dateFrom ?? ""),
    };
  } catch (error) {
    console.error("Cannot parse unit detail:", error);
    return null;
  }
}

export const unitDetailApi = {
  async getOne(unitId: string): Promise<UnitDetail> {
    const response = await apiClient.post<string>("/vahed.php", {
      idv: unitId,
      statephp: "getOnevahed",
    });

    const raw = String(response.data ?? "");
    const detail = parseUnitDetail(raw);

    if (!detail) {
      throw new Error("اطلاعات واحد یافت نشد.");
    }

    return detail;
  },

  // ... باقی کد update بدون تغییر
};