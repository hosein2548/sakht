import { apiClient } from "@/src/core/api/client";

import type {
  AuthUser,
  SendCodeResponse,
  VerifyCodeResponse,
} from "../types/auth.types";

/**
 * استخراج اطلاعات کاربر از پاسخ سرور
 */
function extractUserFromResponse(
  response: string
): AuthUser | null {
  if (!response.startsWith("ok")) {
    return null;
  }

  const jsonStart = response.indexOf("[");

  if (jsonStart === -1) {
    return null;
  }

  try {
    const jsonText = response.substring(jsonStart);
    const data = JSON.parse(jsonText);

    if (
      !Array.isArray(data) ||
      data.length === 0
    ) {
      return null;
    }

    const item = data[0];

    if (!item?.iduser) {
      return null;
    }

    return {
      iduser: String(item.iduser),
      nameuser: String(item.nameuser ?? ""),
      phone: "",
      role: null,
    };
  } catch (error) {
    console.error(
      "Cannot parse login response:",
      error
    );
    return null;
  }
}

export const authApi = {
  /**
   * ارسال کد تایید به شماره موبایل
   */
  async sendCode(
    phone: string
  ): Promise<SendCodeResponse> {
    const response =
      await apiClient.post<string>(
        "/login.php",
        {
          phonenumber: phone,
          statephp: "checkphone",
        }
      );

    const raw = String(response.data ?? "");

    console.log("checkphone response:", raw);

    // بررسی پاسخ سرور
    if (!raw.startsWith("ok")) {
      return {
        success: false,
        message: "شماره موبایل مورد قبول نیست.",
        expirySeconds: 0,
      };
    }

    // استخراج زمان انقضا از پاسخ (مثل فلاتر)
    // پاسخ سرور به این فرمت است: ok120{...json...}
    let expirySeconds = 20; // مقدار پیش‌فرض

    try {
      const numberMatch = raw.match(/^ok(\d+)/);
      if (numberMatch && numberMatch[1]) {
        expirySeconds = parseInt(numberMatch[1]) * 60; // تبدیل دقیقه به ثانیه
      }
    } catch (error) {
      console.warn("Could not parse expiry seconds, using default:", error);
    }

    return {
      success: true,
      message: "کد تایید با موفقیت ارسال شد.",
      expirySeconds: expirySeconds,
    };
  },

  /**
   * تایید کد ارسال شده
   */
  async verifyCode(
    phone: string,
    code: string
  ): Promise<VerifyCodeResponse> {
    const response =
      await apiClient.post<string>(
        "/login.php",
        {
          mycode: code,
          myphone: phone,
          statephp: "checkcode",
        }
      );

    const raw = String(response.data ?? "");

    console.log("checkcode response:", raw);

    // بررسی خطاهای احتمالی
    if (raw === "no" || raw === "false") {
      return {
        success: false,
        message: "کد وارد شده صحیح نیست.",
      };
    }

    const user = extractUserFromResponse(raw);

    if (!user) {
      return {
        success: false,
        message: "کد وارد شده صحیح نیست.",
      };
    }

    return {
      success: true,
      user: {
        ...user,
        phone,
      },
    };
  },
};