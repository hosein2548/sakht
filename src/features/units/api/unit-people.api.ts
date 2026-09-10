// src/features/units/api/unit-people.api.ts
import { apiClient } from "@/src/core/api/client";

// ============================================
// Types
// ============================================

export interface Resident {
  idnaghsh: string;
  iduser: string;
  nameuser: string;
  phone: string;
  datestart: string;
  count: string;
  naghsh: 'مالک' | 'ساکن' | string;
}

export interface AddPersonParams {
  unitId: string;
  phone: string;
  date: string;
  count: string;
  naghsh: 'malek' | 'saken';
}

export interface EditTenantPhoneParams {
  idnaghsh: string;
  phone: string;
}

export interface EditTenantDateParams {
  idnaghsh: string;
  date: string;
}

export interface EditTenantCountParams {
  idnaghsh: string;
  count: string;
}

export interface EditOwnerPhoneParams {
  idnaghsh: string;
  phone: string;
}

export interface EditOwnerDateParams {
  idnaghsh: string;
  date: string;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  data?: Resident[];
}

// ============================================
// Helper Functions
// ============================================

export function getTodayPersian(): string {
  const now = new Date();
  const year = now.getFullYear() - 621;
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
}

export function isValidPersianDate(date: string): boolean {
  const pattern = /^(\d{4})\/(\d{2})\/(\d{2})$/;
  if (!pattern.test(date)) return false;

  const [, year, month, day] = date.match(pattern) || [];
  const y = parseInt(year);
  const m = parseInt(month);
  const d = parseInt(day);

  if (y < 1300 || y > 1500) return false;
  if (m < 1 || m > 12) return false;
  if (d < 1 || d > 31) return false;

  const daysInMonth = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
  if (d > daysInMonth[m - 1]) return false;

  return true;
}

function parsePeopleResponse(raw: string): Resident[] {
  console.log("📋 Raw people response:", raw);

  if (raw === "no" || raw === "") {
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

    return data.map((item: Record<string, unknown>) => ({
      idnaghsh: String(item.idnaghsh ?? ""),
      iduser: String(item.iduser ?? ""),
      nameuser: String(item.nameuser ?? ""),
      phone: String(item.phone ?? ""),
      datestart: String(item.datestart ?? ""),
      count: String(item.count ?? "0"),
      naghsh: item.naghsh === "malek" ? "مالک" : "ساکن",
    }));
  } catch (error) {
    console.error("❌ Cannot parse people response:", error);
    return [];
  }
}

// ============================================
// API Functions
// ============================================

export const unitPeopleApi = {
  // ============================================
  // دریافت لیست مالک و ساکنان
  // ============================================

  async getByUnit(unitId: string , stateactive:string): Promise<Resident[]> {
    try {
      const response = await apiClient.post<string>("/vahed.php", {
        idv: unitId,
        statephp: "getmaleksaken",
        stateactive:stateactive
      });

      const raw = String(response.data ?? "");
      return parsePeopleResponse(raw);
    } catch (error) {
      console.error("❌ Get people error:", error);
      throw new Error("دریافت اطلاعات ساکنان با خطا مواجه شد.");
    }
  },

  // ============================================
  // افزودن مالک یا ساکن جدید
  // ============================================

  async addPerson(params: AddPersonParams): Promise<ApiResponse> {
    try {
      if (!isValidPersianDate(params.date)) {
        return {
          success: false,
          message: "تاریخ وارد شده معتبر نیست. فرمت صحیح: 1404/01/01",
        };
      }

      const response = await apiClient.post<string>("/vahed.php", {
        idv: params.unitId,
        phone: params.phone,
        date: params.date,
        countp: params.count || "0",
        naghsh: params.naghsh,
        statephp: "SaveNewMalekSaken",
      });

      const raw = String(response.data ?? "");
      console.log("➕ Add person response:", raw);

      if (raw.startsWith("ok")) {
        return {
          success: true,
          message: "افزودن با موفقیت انجام شد.",
        };
      }

      if (raw === "notekrari") {
        return {
          success: false,
          message: "این شماره همراه در حال حاضر ثبت شده است.",
        };
      }

      return {
        success: false,
        message: "افزودن با خطا مواجه شد.",
      };
    } catch (error) {
      console.error("❌ Add person error:", error);
      return {
        success: false,
        message: "ارتباط با سرور برقرار نشد.",
      };
    }
  },

  // ============================================
  // ویرایش شماره موبایل ساکن
  // ============================================

  async editTenantPhone(params: EditTenantPhoneParams): Promise<ApiResponse> {
    try {
      const response = await apiClient.post<string>("/vahed.php", {
        idnaghsh: params.idnaghsh,
        phone: params.phone,
        naghsh: "saken",
        statephp: "edit_saken_phone",
      });

      const raw = String(response.data ?? "");
      console.log("📱 Edit tenant phone response:", raw);

      if (raw.startsWith("ok")) {
        return {
          success: true,
          message: "شماره موبایل با موفقیت ویرایش شد.",
        };
      }

      if (raw === "tekrari") {
        return {
          success: false,
          message: "این شماره موبایل در حال حاضر ثبت شده است.",
        };
      }

      return {
        success: false,
        message: "ویرایش شماره با خطا مواجه شد.",
      };
    } catch (error) {
      console.error("❌ Edit tenant phone error:", error);
      return {
        success: false,
        message: "ارتباط با سرور برقرار نشد.",
      };
    }
  },

  // ============================================
  // ویرایش تاریخ شروع سکونت
  // ============================================

  async editTenantDate(params: EditTenantDateParams): Promise<ApiResponse> {
    try {
      if (!isValidPersianDate(params.date)) {
        return {
          success: false,
          message: "تاریخ وارد شده معتبر نیست. فرمت صحیح: 1404/01/01",
        };
      }

      const response = await apiClient.post<string>("/vahed.php", {
        idnaghsh: params.idnaghsh,
        date: params.date,
        naghsh: "saken",
        statephp: "edit_saken_date",
      });

      const raw = String(response.data ?? "");
      console.log("📅 Edit tenant date response:", raw);

      if (raw.startsWith("ok")) {
        return {
          success: true,
          message: "تاریخ شروع با موفقیت ویرایش شد.",
        };
      }

      return {
        success: false,
        message: "ویرایش تاریخ با خطا مواجه شد.",
      };
    } catch (error) {
      console.error("❌ Edit tenant date error:", error);
      return {
        success: false,
        message: "ارتباط با سرور برقرار نشد.",
      };
    }
  },

  // ============================================
  // ویرایش تعداد نفرات ساکن
  // ============================================

  async editTenantCount(params: EditTenantCountParams): Promise<ApiResponse> {
    try {
      const response = await apiClient.post<string>("/vahed.php", {
        idnaghsh: params.idnaghsh,
        countp: params.count,
        naghsh: "saken",
        statephp: "edit_saken_count",
      });

      const raw = String(response.data ?? "");
      console.log("👥 Edit tenant count response:", raw);

      if (raw.startsWith("ok")) {
        return {
          success: true,
          message: "تعداد نفرات با موفقیت ویرایش شد.",
        };
      }

      return {
        success: false,
        message: "ویرایش تعداد نفرات با خطا مواجه شد.",
      };
    } catch (error) {
      console.error("❌ Edit tenant count error:", error);
      return {
        success: false,
        message: "ارتباط با سرور برقرار نشد.",
      };
    }
  },

  // ============================================
  // ویرایش شماره موبایل مالک
  // ============================================

  async editOwnerPhone(params: EditOwnerPhoneParams): Promise<ApiResponse> {
    try {
      const response = await apiClient.post<string>("/vahed.php", {
        idnaghsh: params.idnaghsh,
        phone: params.phone,
        naghsh: "malek",
        statephp: "editmalek",
      });

      const raw = String(response.data ?? "");
      console.log("📱 Edit owner phone response:", raw);

      if (raw.startsWith("ok")) {
        return {
          success: true,
          message: "شماره موبایل با موفقیت ویرایش شد.",
        };
      }

      if (raw === "tekrari") {
        return {
          success: false,
          message: "این شماره موبایل در حال حاضر ثبت شده است.",
        };
      }

      return {
        success: false,
        message: "ویرایش شماره با خطا مواجه شد.",
      };
    } catch (error) {
      console.error("❌ Edit owner phone error:", error);
      return {
        success: false,
        message: "ارتباط با سرور برقرار نشد.",
      };
    }
  },

  // ============================================
  // ویرایش تاریخ شروع مالکیت
  // ============================================

  async editOwnerDate(params: EditOwnerDateParams): Promise<ApiResponse> {
    try {
      if (!isValidPersianDate(params.date)) {
        return {
          success: false,
          message: "تاریخ وارد شده معتبر نیست. فرمت صحیح: 1404/01/01",
        };
      }

      const response = await apiClient.post<string>("/vahed.php", {
        idnaghsh: params.idnaghsh,
        date: params.date,
        naghsh: "malek",
        statephp: "editmalek_date",
      });

      const raw = String(response.data ?? "");
      console.log("📅 Edit owner date response:", raw);

      if (raw.startsWith("ok")) {
        return {
          success: true,
          message: "تاریخ شروع مالکیت با موفقیت ویرایش شد.",
        };
      }

      return {
        success: false,
        message: "ویرایش تاریخ با خطا مواجه شد.",
      };
    } catch (error) {
      console.error("❌ Edit owner date error:", error);
      return {
        success: false,
        message: "ارتباط با سرور برقرار نشد.",
      };
    }
  },

  // ============================================
  // حذف/پایان دوره مالک یا ساکن
  // ============================================

  async deletePerson(idnaghsh: string, endDate: string): Promise<ApiResponse> {
    try {
      if (!isValidPersianDate(endDate)) {
        return {
          success: false,
          message: "تاریخ پایان معتبر نیست. فرمت صحیح: 1404/01/01",
        };
      }

      const response = await apiClient.post<string>("/vahed.php", {
        idnaghsh: idnaghsh,
        date: endDate,
        statephp: "DeleteMalekSaken",
      });

      const raw = String(response.data ?? "");
      console.log("🗑️ Delete person response:", raw);

      if (raw.startsWith("ok")) {
        return {
          success: true,
          message: "پایان دوره با موفقیت انجام شد.",
        };
      }

      return {
        success: false,
        message: "پایان دوره با خطا مواجه شد.",
      };
    } catch (error) {
      console.error("❌ Delete person error:", error);
      return {
        success: false,
        message: "ارتباط با سرور برقرار نشد.",
      };
    }
  },

  // ============================================
  // Backward-compatible facade
  // ============================================

  async getAll(unitId: string, stateactive:string): Promise<Resident[]> {
    return this.getByUnit(unitId,stateactive);
  },

  async add(
    unitId: string,
    phone: string,
    date: string,
    role: 'malek' | 'saken',
    count: string
  ): Promise<ApiResponse> {
    return this.addPerson({
      unitId,
      phone,
      date,
      count,
      naghsh: role,
    });
  },

  async edit(
    _unitId: string,
    person: Resident,
    data: {
      phone: string;
      date: string;
      count: string;
      state: string;
    }
  ): Promise<ApiResponse> {
    switch (data.state) {
      case 'edit_saken_phone':
        return this.editTenantPhone({ idnaghsh: person.idnaghsh, phone: data.phone });
      case 'edit_saken_date':
        return this.editTenantDate({ idnaghsh: person.idnaghsh, date: data.date });
      case 'edit_saken_count':
        return this.editTenantCount({ idnaghsh: person.idnaghsh, count: data.count });
      case 'editmalek':
        return this.editOwnerPhone({ idnaghsh: person.idnaghsh, phone: data.phone });
      case 'editmalek_date':
        return this.editOwnerDate({ idnaghsh: person.idnaghsh, date: data.date });
      default:
        return { success: false, message: 'نوع ویرایش مشخص نیست.' };
    }
  },

  async remove(person: Resident): Promise<ApiResponse> {
    return this.deletePerson(person.idnaghsh, getTodayPersian());
  },
};