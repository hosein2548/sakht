import { apiClient } from "@/src/core/api/client";

import type {
  Expense,
  ExpenseSplit,
} from "../types/expense.types";

function parseArray(
  raw: string
): unknown[] {
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
    ? data
    : [];
}

export const expenseApi = {
  async getAll(
    buildingId: string
  ): Promise<Expense[]> {
    const response =
      await apiClient.post<string>(
        "/hazine.php",
        {
          ids: buildingId,
          statephp:
            "getlisthazine",
        }
      );

    const raw =
      String(response.data ?? "");

    console.log(
      "getlisthazine response:",
      raw
    );

    if (
      raw === "no" ||
      raw === ""
    ) {
      return [];
    }

    return parseArray(raw).map(
      (item) => {
        const value =
          item as Record<
            string,
            unknown
          >;

        return {
          idhazine: String(
            value.idhazine ?? ""
          ),

          name: String(
            value.name ?? ""
          ),

          startdate: String(
            value.startdate ?? ""
          ),

          enddate: String(
            value.enddate ?? ""
          ),

          price: String(
            value.price ?? ""
          ),

          getfrom: String(
            value.getfrom ?? ""
          ),

          chevahedi: String(
            value.chevahedi ?? ""
          ),

          noemohasebe: String(
            value.noemos ?? ""
          ),

          khalibaki: String(
            value.khali ?? ""
          ),

          resid: String(
            value.resid ?? ""
          ),
        };
      }
    );
  },

 async getSplit(
    buildingId: string,
    expenseId: string
  ): Promise<ExpenseSplit[]> {
    const response =
      await apiClient.post<string>(
        "/hazine.php",
        {
          ids: buildingId,

          idhazine: expenseId,

          statephp:
            "getlisttaghsimhazine",
        }
      );

    const raw =
      String(response.data ?? "");

    console.log(
      "getlisttaghsimhazine response:",
      raw
    );

    if (
      raw === "no" ||
      raw === ""
    ) {
      return [];
    }

    return parseArray(raw).map(
      (item) => {
        const value =
          item as Record<
            string,
            unknown
          >;

        return {
          idv: String(
            value.idv ??
            value.idvahed ??
            ""
          ),

          namev: String(
            value.namevahed ??
            value.namev ??
            ""
          ),

          price: String(
            value.price ??
            ""
          ),

          nafar: String(
            value.nafar ??
            ""
          ),

          metter: String(
            value.metter ??
            ""
          ),

          day: String(
            value.day ??
            ""
          ),

          naghsh:
            String(
              value.naghsh ?? ""
            ) === "malek"
              ? "مالک"
              : "ساکن",
        };
      }
    );
  },

  async remove(
    buildingId: string,
    expenseId: string
  ) {
    const response =
      await apiClient.post<string>(
        "/hazine.php",
        {
          ids: buildingId,

          idhazine: expenseId,

          statephp:
            "deletehazine",
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

    if (
      raw === "no-long"
    ) {
      return {
        success: false,

        message:
          "امکان حذف این هزینه وجود ندارد.",
      };
    }

    return {
      success: false,

      message:
        "حذف هزینه انجام نشد.",
    };
  },
};