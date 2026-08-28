import { apiClient } from "@/src/core/api/client";

import type {
  BuildingBill,
  FundBillItem,
  UnitBillItem,
} from "../types/billing.types";

export type BillingMode =
  | "sakhteman"
  | "vahed"
  | "sandogh";

export type BillingSearch =
  | "sakhteman-one"
  | "sakhteman-all"
  | "sakhteman-bedehkar"
  | "vahed-one"
  | "vahed-all"
  | "vahed-malek"
  | "vahed-saken"
  | "sandogh";

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

function formatNumber(
  value: unknown
): string {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "0";
  }

  const numeric = Number(
    String(value).replace(/,/g, "")
  );

  if (Number.isNaN(numeric)) {
    return String(value);
  }

  return new Intl.NumberFormat(
    "en-US"
  ).format(numeric);
}

function mapBuildingBill(
  item: Record<string, unknown>
): BuildingBill {
  return {
    unitId: String(
      item.idvahed ?? ""
    ),

    unitName: String(
      item.namevahed ?? ""
    ),

    sumPayOwner:
      formatNumber(
        item.sumpaymalek
      ),

    sumPayResident:
      formatNumber(
        item.sumpaysaken
      ),

    sumCostOwner:
      formatNumber(
        item.sumcostmalek
      ),

    sumCostResident:
      formatNumber(
        item.sumcostsaken
      ),

    balanceOwner:
      formatNumber(
        item.mandemalek
      ),

    balanceResident:
      formatNumber(
        item.mandesaken
      ),

    ownerStatus: String(
      item.statemalek ?? ""
    ),

    residentStatus: String(
      item.statesaken ?? ""
    ),
  };
}

function mapUnitBill(
  item: Record<string, unknown>
): UnitBillItem {
  return {
    unitId: String(
      item.idv ?? ""
    ),

    unitName: String(
      item.namevahed ?? ""
    ),

    title: String(
      item.onvan ?? ""
    ),

    price:
      formatNumber(
        item.price
      ),

    dateFrom: String(
      item.date1 ?? ""
    ),

    dateTo: String(
      item.date2 ?? ""
    ),

    saveDate: String(
      item.datesave ?? ""
    ),

    person:
      String(item.who ?? "") ===
      "malek"
        ? "مالک"
        : "ساکن",

    type:
      String(
        item.costpay ?? ""
      ) === "cost"
        ? "هزینه"
        : "پرداخت",
  };
}

function mapFundBill(
  item: Record<string, unknown>
): FundBillItem {
  return {
    title: String(
      item.onvan ?? ""
    ),

    price:
      formatNumber(
        item.price
      ),

    dateStart: String(
      item.datestart ?? ""
    ),

    dateEnd: String(
      item.dateend ?? ""
    ),
  };
}

export const billingApi = {
  async getBuilding(
    buildingId: string,
    unitId: string | null,
    search:
      | "sakhteman-one"
      | "sakhteman-all"
      | "sakhteman-bedehkar"
  ): Promise<BuildingBill[]> {
    const response =
      await apiClient.post<string>(
        "/bill.php",
        {
          ids: buildingId,

          idv:
            unitId || "0",

          search,

          statephp: "getbill",
        }
      );

    const raw =
      String(response.data ?? "");

    console.log(
      "building bill response:",
      raw
    );

    if (
      raw === "no" ||
      raw === ""
    ) {
      return [];
    }

    return parseArray(raw).map(
      mapBuildingBill
    );
  },

  async getUnit(
    buildingId: string,
    unitId: string,
    search:
      | "vahed-one"
      | "vahed-all"
      | "vahed-malek"
      | "vahed-saken",
    dateStart: string,
    dateEnd: string
  ): Promise<UnitBillItem[]> {
    const response =
      await apiClient.post<string>(
        "/bill.php",
        {
          ids: buildingId,

          idv:
            unitId || "0",

          search,

          datestart:
            dateStart,

          dateend:
            dateEnd,

          statephp: "getbill",
        }
      );

    const raw =
      String(response.data ?? "");

    console.log(
      "unit bill response:",
      raw
    );

    if (
      raw === "no" ||
      raw === ""
    ) {
      return [];
    }

    return parseArray(raw).map(
      mapUnitBill
    );
  },

  async getFund(
    buildingId: string,
    dateStart: string,
    dateEnd: string
  ): Promise<FundBillItem[]> {
    const response =
      await apiClient.post<string>(
        "/bill.php",
        {
          ids: buildingId,

          idv: "0",

          datestart:
            dateStart,

          dateend:
            dateEnd,

          search: "sandogh",

          statephp: "getbill",
        }
      );

    const raw =
      String(response.data ?? "");

    console.log(
      "fund bill response:",
      raw
    );

    if (
      raw === "no" ||
      raw === ""
    ) {
      return [];
    }

    return parseArray(raw).map(
      mapFundBill
    );
  },
};