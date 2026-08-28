import { apiClient } from "@/src/core/api/client";

import type {
  AnnouncementMessage,
  MessageUnit,
  PrivateMessage,
} from "../types/message.types";

function parseArray(raw: string): Record<string, unknown>[] {
  if (!raw.startsWith("ok")) {
    return [];
  }

  const jsonStart = raw.indexOf("[");
  if (jsonStart === -1) {
    return [];
  }

  try {
    const data = JSON.parse(raw.substring(jsonStart));
    return Array.isArray(data) ? (data as Record<string, unknown>[]) : [];
  } catch {
    return [];
  }
}

export const messageApi = {
  // ============================================
  // دریافت اعلان‌های عمومی
  // ============================================
  async getAnnouncements(buildingId: string): Promise<AnnouncementMessage[]> {
    const response = await apiClient.post<string>("/message.php", {
      ids: buildingId,
      count: "all",
      statephp: "getpayam_elanat",
    });

    const raw = String(response.data ?? "");
    console.log("📢 getpayam_elanat response:", raw);

    if (raw === "no" || raw === "") {
      return [];
    }

    return parseArray(raw).map((item) => ({
      id: String(item.id ?? ""),
      subject: String(item.subject ?? ""),
      message: String(item.mymessage ?? ""),
      date: String(item.date ?? ""),
      senderName: String(item.namemodir ?? ""),
    }));
  },

  // ============================================
  // ارسال اعلان عمومی
  // ============================================
  async sendAnnouncement(
    buildingId: string,
    userId: string,
    subject: string,
    message: string
  ) {
    const response = await apiClient.post<string>("/message.php", {
      ids: buildingId,
      iduser: userId,
      subject,
      payam: message,
      statephp: "sendpayam_elanat",
    });

    const raw = String(response.data ?? "");
    console.log("📤 sendpayam_elanat response:", raw);

    if (raw.startsWith("ok")) {
      return { success: true };
    }
    return { success: false, message: "ارسال اعلان انجام نشد." };
  },

  // ============================================
  // حذف اعلان عمومی
  // ============================================
  async deleteAnnouncement(buildingId: string, userId: string, id: string) {
    const response = await apiClient.post<string>("/message.php", {
      ids: buildingId,
      idpayam: id,
      iduser: userId,
      statephp: "deletepayam_elanat",
    });

    const raw = String(response.data ?? "");
    console.log("🗑️ deletepayam_elanat response:", raw);

    if (raw.startsWith("ok")) {
      return { success: true };
    }
    return { success: false, message: "حذف اعلان انجام نشد." };
  },

  // ============================================
  // دریافت لیست واحدها (برای مدیر)
  // ============================================
  async getUnits(buildingId: string): Promise<MessageUnit[]> {
    const response = await apiClient.post<string>("/message.php", {
      ids: buildingId,
      statephp: "getAllvahed",
    });

    const raw = String(response.data ?? "");
    console.log("🏢 getAllvahed response:", raw);

    if (raw === "no" || raw === "") {
      return [];
    }

    return parseArray(raw).map((item) => ({
      idv: String(item.idv ?? ""),
      namev: String(item.namev ?? ""),
      unreadResident: String(item.countunRead_s ?? "0"),
      unreadManager: String(item.countunRead_m ?? "0"),
    }));
  },

  // ============================================
  // دریافت پیام‌های خصوصی
  // ============================================
  async getPrivateMessages(
    buildingId: string,
    unitId: string,
    role: "modir" | "malek" | "saken" | "maleksaken",
    targetRole?: "malek" | "saken"
  ): Promise<PrivateMessage[]> {
    // تعیین chatGET و chatSEND بر اساس نقش
    let chatGet = "modir";
    let chatSend = role;

    if (role === "modir") {
      // مدیر: گیرنده targetRole هست (مالک یا ساکن)
      chatSend = "modir";
      chatGet = targetRole || "malek";
      console.log(`👤 Manager chatting with: ${chatGet}`);
    } else if (role === "maleksaken") {
      // کاربر هم مالک و هم ساکن: با نقش انتخاب شده
      chatSend = targetRole || "malek";
      chatGet = "modir";
    } else {
      // کاربر معمولی (مالک یا ساکن)
      chatSend = role;
      chatGet = "modir";
    }

    console.log(`📨 getPrivateMessages: chatSend=${chatSend}, chatGet=${chatGet}`);

    const response = await apiClient.post<string>("/message.php", {
      ids: buildingId,
      idv: unitId,
      chatGET: chatGet,
      chatSEND: chatSend,
      statephp: "getpayam_private",
    });

    const raw = String(response.data ?? "");
    console.log("💬 getpayam_private response:", raw);

    if (raw === "no" || raw === "") {
      return [];
    }

    return parseArray(raw).map((item) => ({
      id: String(item.id ?? ""),
      managerMessage: String(item.payammodir ?? ""),
      userMessage: String(item.payamuser ?? ""),
      managerDate: String(item.datemodir ?? ""),
      userDate: String(item.dateuser ?? ""),
      managerName: String(item.namemodir ?? ""),
      userName: String(item.nameuser ?? ""),
      readState: String(item.stateread ?? ""),
    }));
  },

  // ============================================
  // ارسال پیام خصوصی
  // ============================================
  async sendPrivateMessage(
    buildingId: string,
    unitId: string,
    userId: string,
    role: "modir" | "malek" | "saken" | "maleksaken",
    message: string,
    targetRole: "malek" | "saken" = "malek"
  ) {
    // تعیین chatGET و chatSEND بر اساس نقش
    let chatGet = "modir";
    let chatSend = role;

    if (role === "modir") {
      // مدیر: گیرنده targetRole هست
      chatSend = "modir";
      chatGet = targetRole;
      console.log(`👤 Manager sending to: ${chatGet}`);
    } else if (role === "maleksaken") {
      // کاربر هم مالک و هم ساکن
      chatSend = targetRole;
      chatGet = "modir";
    } else {
      // کاربر معمولی
      chatSend = role;
      chatGet = "modir";
    }

    console.log(`📤 sendPrivateMessage: chatSend=${chatSend}, chatGet=${chatGet}, message=${message}`);

    const response = await apiClient.post<string>("/message.php", {
      ids: buildingId,
      idv: unitId,
      payam: message,
      iduser: userId,
      chatGET: chatGet,
      chatSEND: chatSend,
      statephp: "sendpayamprivate",
    });

    const raw = String(response.data ?? "");
    console.log("📤 sendpayamprivate response:", raw);

    if (raw === "ok") {
      return { success: true };
    }

    if (raw === "no personel") {
      return { success: false, message: "دسترسی غیرمجاز." };
    }

    return { success: false, message: "ارسال پیام انجام نشد." };
  },
};