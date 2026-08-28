import { apiClient } from "@/src/core/api/client";

import type {
  ExpenseSplit,
} from "../types/expense.types";
import { string } from "zod";

export interface ExpensePreviewInput {
  buildingId: string;

  calculationType:
    | "metter"
    | "vahed"
    | "nafar";

  payer:
    | "malek"
    | "saken";

  unitScope:
    | "all"
    | "khas";

  selectedUnitIds: string[];

  emptyUnitPayment:
    | "sayer"
    | "malek";

  dateFrom: string;
  dateTo: string;

  price: string;
}

export interface SaveExpenseInput
  extends ExpensePreviewInput {
  userId: string;

  name: string;

  paymentType:
    | "justone"
    | "every";

  repeatDay: string;

  paymentDeadline: string;

  comment: string;

  calculatedItems: ExpenseSplit[];

  receipt?: File | null;
}

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

function buildSelectedUnits(
  ids: string[]
) {
  if (ids.length === 0) {
    return "0";
  }

  return `${ids.join("-")}-`;
}

export const expenseCreateApi = {
  async preview(
    input: ExpensePreviewInput
  ): Promise<ExpenseSplit[]> {
    const response =
      await apiClient.post<string>(
        "/hazine.php",
        {
          ids: input.buildingId,

          noemo:
            input.calculationType,

          chekasi:
            input.payer,

          chevahedi:
            input.unitScope,

          listv:
            buildSelectedUnits(
              input.selectedUnitIds
            ),

          datefrom:
            input.dateFrom,

          dateto:
            input.dateTo,

          saken0:
            input.emptyUnitPayment,

          price:
            input.price,

          statephp:
            "getinfoForcalc",
        }
      );

    const raw =
      String(response.data ?? "");

    console.log(
      "getinfoForcalc response:",
      raw
    );

    if (
      raw === "no" ||
      raw === ""
    ) {
      return [];
    }

    return parseArray(raw).map(
      (item) => ({
        idv: String(
      item.idv ?? ""
    ),
        namev: String(
          item.namev ?? ""
        ),

        price: String(
          item.price ?? ""
        ),

        nafar: String(
          item.nafar ?? ""
        ),

        metter: String(
          item.metter ?? ""
        ),

        naghsh: String(
          item.naghsh ?? ""
        ),
        day:String(item.day ?? "")
      })
    );
  },

  async save(
    input: SaveExpenseInput
  ) {
    const unitIds =
      buildSelectedUnits(
        input.selectedUnitIds
      );

    let strCalc = "";

for (
  const item of input.calculatedItems
) {
  strCalc +=
    item.idv +
    "|" +
    item.metter +
    "|" +
    item.nafar +
    "|" +
    item.day +
    "|" +
    item.price +
    "|" +
    item.naghsh +
    "|";
}

    /*
     * برای جلوگیری از ارسال داده ناقص،
     * API واقعی باید calculatedItems را
     * به فرمت idv|metter|nafar|day|price|naghsh
     * تبدیل کند.
     */

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
      "nameh",
      input.name
    );

    formData.append(
      "noep",
      input.paymentType
    );

    formData.append(
      "noemo",
      input.calculationType
    );

    formData.append(
      "chekasi",
      input.payer
    );

    formData.append(
      "chevahedi",
      input.unitScope
    );

    formData.append(
      "listv",
      unitIds
    );

    formData.append(
      "datefrom",
      input.dateFrom
    );

    formData.append(
      "dateto",
      input.dateTo
    );

    formData.append(
      "daydore",
      input.paymentType ===
        "every"
        ? input.repeatDay
        : "0"
    );

    formData.append(
      "saken0",
      input.emptyUnitPayment
    );

    formData.append(
      "price",
      input.price
    );

    formData.append(
      "mohlatp",
      input.paymentDeadline
    );

    formData.append(
      "strcalc",
      strCalc
    );

    formData.append(
      "statephp",
      "savenewhazine"
    );

    formData.append(
      "tozihat",
      input.comment
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
        "/hazine.php",
        formData
      );

    const raw =
      String(response.data ?? "");

    console.log(
      "savenewhazine response:",
      raw
    );

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
        "ثبت هزینه انجام نشد.",
    };
  },
};