import { apiClient } from "@/src/core/api/client";

import type {
  Payment,
} from "../types/payment.types";

function parseArray(
  raw: string
): Record<string, unknown>[] {
  if (!raw.startsWith("ok")) {
    return [];
  }

  const jsonStart =
    raw.indexOf("[");

  if (jsonStart === -1) {
    return [];
  }

  const data = JSON.parse(
    raw.substring(jsonStart)
  );

  return Array.isArray(data)
    ? (data as Record<string, unknown>[])
    : [];
}

function mapPayment(
  item: Record<string, unknown>
): Payment {
  const paymentType =
    String(
      item.noe ?? ""
    ) === "enteghal"
      ? "انتقال وجه"
      : "نقدی";

  const payer =
    String(
      item.payer ?? ""
    ) === "malek"
      ? "مالک"
      : "ساکن";

  let status = "";

  const rawStatus =
    String(
      item.statemodir ?? ""
    );

  if (
    rawStatus === "baresi"
  ) {
    status = "درحال بررسی";
  } else if (
    rawStatus === "ok"
  ) {
    status = "تایید شده";
  } else if (
    rawStatus === "no"
  ) {
    status = "رد شده";
  }

  return {
    idp: String(
      item.idp ?? ""
    ),

    idupay: String(
      item.idu ?? ""
    ),

    ids: String(
      item.ids ?? ""
    ),

    idv: String(
      item.idv ?? ""
    ),

    namevahed: String(
      item.namevahed ?? ""
    ),

    title: String(
      item.onvan ?? ""
    ),

    datepay: String(
      item.datepay ?? ""
    ),

    datesave: String(
      item.datesave ?? ""
    ),

    price: String(
      item.price ?? ""
    ),

    paymentType,

    payer,

    status,

    description: String(
      item.tozihat ?? ""
    ),

    receipt: String(
      item.resid ?? "0"
    ),
  };
}

export type PaymentSearch =
  | "all"
  | "baresi"
  | "vahed";

export const paymentApi = {
  async getAll(
    buildingId: string,
    role:
      | "modir"
      | "maleksaken",
    unitId: string,
    search: PaymentSearch
  ): Promise<Payment[]> {
    const response =
      await apiClient.post<string>(
        "/payrol.php",
        {
          ids: buildingId,

          idv:
            role === "modir"
              ? unitId
              : unitId,

          naghsh: role,

          search:

            role ===
            "maleksaken"
              ? "vahed"
              : search,

          statephp:
            "getdatapey",
        }
      );

    const raw =
      String(response.data ?? "");

    console.log(
      "getdatapey response:",
      raw
    );

    if (
      raw === "no" ||
      raw === ""
    ) {
      return [];
    }

    return parseArray(raw).map(
      mapPayment
    );
  },

  async create(
    input: {
      buildingId: string;

      unitId: string;

      userId: string;

      payer:
        | "malek"
        | "saken";

      date: string;

      price: string;

      title: string;

      paymentType:
        | "naghdi"
        | "enteghal";

      receipt: File | null;
    }
  ) {
    const formData =
      new FormData();

    formData.append(
      "ids",
      input.buildingId
    );

    formData.append(
      "idv",
      input.unitId
    );

    formData.append(
      "idu",
      input.userId
    );

    formData.append(
      "payer",
      input.payer
    );

    formData.append(
      "date",
      input.date
    );

    formData.append(
      "price",
      input.price
    );

    formData.append(
      "onvan",
      input.title
    );

    formData.append(
      "noepay",
      input.paymentType
    );

    formData.append(
      "statephp",
      "savenewpay"
    );

    if (input.receipt) {
      formData.append(
        "image",
        input.receipt,
        "upload.jpg"
      );
    }

    const response =
      await apiClient.post<string>(
        "/payrol.php",
        formData
      );

    const raw =
      String(response.data ?? "");

    if (
      raw.startsWith("ok")
    ) {
      return {
        success: true,
      };
    }

    if (
      raw === "notekrari"
    ) {
      return {
        success: false,

        message:
          "این پرداخت قبلا ثبت شده است.",
      };
    }

    return {
      success: false,

      message:
        "ثبت پرداخت انجام نشد.",
    };
  },

  async reply(
    input: {
      buildingId: string;

      paymentId: string;

      role:
        | "modir"
        | "maleksaken";

      reply:
        | "ok"
        | "no"
        | "del"
        | "deletepay";

      description: string;
    }
  ) {
    const response =
      await apiClient.post<string>(
        "/payrol.php",
        {
          ids:
            input.buildingId,

          idp:
            input.paymentId,

          reply:
            input.reply,

          naghsh:
            input.role,

          tozihat:
            input.description,

          statephp:
            "reply",
        }
      );

    const raw =
      String(response.data ?? "");

    if (
      raw.startsWith("ok")
    ) {
      return {
        success: true,
      };
    }

    return {
      success: false,

      message:
        "عملیات پرداخت انجام نشد.",
    };
  },
};