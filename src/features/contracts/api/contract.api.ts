import { apiClient } from "@/src/core/api/client";

import type {
  ContractItem,
} from "../types/contract.types";

function parseArray(
  raw: string
): Record<string, unknown>[] {
  if (!raw.startsWith("ok")) {
    return [];
  }

  const jsonStart = raw.indexOf("[");

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

function mapContract(
  item: Record<string, unknown>
): ContractItem {
  const rawState =
    String(item.state ?? "");

  let state = rawState;

  if (rawState === "active") {
    state = "فعال";
  } else if (rawState === "faskh") {
    state = "فسخ شده";
  } else if (rawState === "delete") {
    state = "حذف شده";
  } else if (rawState === "end") {
    state = "پایان یافته";
  }

  return {
    idc: String(item.idc ?? ""),
    ids: String(item.ids ?? ""),
    idv: String(item.idv ?? ""),

    subject: String(
      item.onvan ?? ""
    ),

    startDate: String(
      item.startdate ?? ""
    ),

    endDate: String(
      item.enddate ?? ""
    ),

    price: String(
      item.price ?? ""
    ),

    address: String(
      item.address ?? ""
    ),

    phone: String(
      item.phone ?? ""
    ),

    counterparty: String(
      item.namemotosadi ?? ""
    ),

    description: String(
      item.tozihat ?? ""
    ),

    state,

    terminateDate: String(
      item.faskhdate ?? ""
    ),

    terminateReason: String(
      item.dalilfaskh ?? ""
    ),

    receipt: String(
      item.resid ?? "0"
    ),
  };
}

export const contractApi = {
  async getAll(
    buildingId: string,
    active: boolean
  ): Promise<ContractItem[]> {
    const response =
      await apiClient.post<string>(
        "/contract.php",
        {
          ids: buildingId,

          search: active
            ? "active"
            : "deactive",

          statephp:
            "getcontract",
        }
      );

    const raw =
      String(response.data ?? "");

    console.log(
      "getcontract response:",
      raw
    );

    if (
      raw === "no" ||
      raw === ""
    ) {
      return [];
    }

    return parseArray(raw).map(
      mapContract
    );
  },

  async remove(
    buildingId: string,
    userId: string,
    contractId: string
  ) {
    const response =
      await apiClient.post<string>(
        "/contract.php",
        {
          ids: buildingId,
          idu: userId,
          idc: contractId,

          statephp:
            "deletecontract",
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
        "حذف قرارداد انجام نشد.",
    };
  },

  async terminate(
    buildingId: string,
    userId: string,
    contractId: string,
    reason: string,
    date: string
  ) {
    const response =
      await apiClient.post<string>(
        "/contract.php",
        {
          ids: buildingId,

          idc: contractId,

          idu: userId,

          faskhdalil: reason,

          faskhdate: date,

          statephp:
            "faskh",
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
        "فسخ قرارداد انجام نشد.",
    };
  },

  async save(
    input: {
      buildingId: string;

      userId: string;

      state:
        | "savenew"
        | "saveedit"
        | "saveeditoldpic";

      contractId: string;

      startDate: string;

      endDate: string;

      price: string;

      subject: string;

      phone: string;

      address: string;

      counterparty: string;

      description: string;

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
      "idu",
      input.userId
    );

    formData.append(
      "startdate",
      input.startDate
    );

    formData.append(
      "enddate",
      input.endDate
    );

    formData.append(
      "price",
      input.price
    );

    formData.append(
      "onvan",
      input.subject
    );

    formData.append(
      "phone",
      input.phone
    );

    formData.append(
      "address",
      input.address
    );

    formData.append(
      "namemotosadi",
      input.counterparty
    );

    formData.append(
      "tozihat",
      input.description
    );

    formData.append(
      "statesave",
      input.state
    );

    formData.append(
      "statephp",
      "save"
    );

    formData.append(
      "idc",
      input.contractId
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
        "/contract.php",
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

    return {
      success: false,
      message:
        "ذخیره قرارداد انجام نشد.",
    };
  },
};