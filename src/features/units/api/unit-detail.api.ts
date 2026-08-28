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
  stateFullEmpty: 'full' | 'empty';
  dateFrom: string;
}

function parseUnitDetail(raw: string): UnitDetail | null {
  console.log("Raw unit detail response:", raw);

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
    return {
      idvahed: String(item.idv ?? item.idvahed ?? ""),
      namevahed: String(item.namev ?? item.namevahed ?? ""),
      metter: String(item.metter ?? ""),
      bargh: String(item.bargh ?? ""),
      aab: String(item.aab ?? ""),
      gaz: String(item.gaz ?? ""),
      parking: String(item.parking ?? ""),
      anbari: String(item.anbari ?? ""),
      tozihat: String(item.tozihat ?? ""),
      stateFullEmpty: (item.fullempty === "full" || item.stateFullEmpty === "full") 
        ? 'full' 
        : 'empty',
      dateFrom: String(item.date ?? item.dateFrom ?? ""),
    };
  } catch (error) {
    console.error("Cannot parse unit detail:", error);
    return null;
  }
}

export const unitDetailApi = {
  async getOne(unitId: string): Promise<UnitDetail> {
    const response = await apiClient.post<string>(
      "/vahed.php",
      {
        idv: unitId,
        statephp: "getOnevahed",
      }
    );

    const raw = String(response.data ?? "");
    const detail = parseUnitDetail(raw);

    if (!detail) {
      throw new Error("اطلاعات واحد یافت نشد.");
    }

    return detail;
  },

  async update(unitId: string, data: Partial<UnitDetail>): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiClient.post<string>(
        "/vahed.php",
        {
          idv: unitId,
          namevahed: data.namevahed,
          metter: data.metter,
          aab: data.aab,
          gaz: data.gaz,
          bargh: data.bargh,
          parking: data.parking,
          anbari: data.anbari,
          tozihat: data.tozihat,
          datefrom: data.dateFrom,
          statephp: "SaveVahedInfo",
        }
      );

      const raw = String(response.data ?? "");
      console.log("Update unit response:", raw);

      if (raw.startsWith("ok")) {
        return { success: true, message: "اطلاعات با موفقیت ذخیره شد." };
      }

      return { success: false, message: "ذخیره اطلاعات با خطا مواجه شد." };
    } catch (error) {
      console.error("Update unit error:", error);
      return { success: false, message: "ارتباط با سرور برقرار نشد." };
    }
  },
};