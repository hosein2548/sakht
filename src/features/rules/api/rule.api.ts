import { apiClient } from "@/src/core/api/client";

import type {
  BuildingRule,
} from "../types/rule.types";

function parseRules(
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

export const ruleApi = {
  async getAll(
    buildingId: string
  ): Promise<BuildingRule[]> {
    const response =
      await apiClient.post<string>(
        "/ghavanin.php",
        {
          idsakhteman:
            buildingId,

          statephp:
            "getghavanin",
        }
      );

    const raw =
      String(response.data ?? "");

    console.log(
      "getghavanin response:",
      raw
    );

    if (
      raw === "no" ||
      raw === "no ghavanin" ||
      raw === ""
    ) {
      return [];
    }

    return parseRules(raw).map(
      (item) => ({
        subject: String(
          item.subject ?? ""
        ),

        text: String(
          item.matn ?? ""
        ),
      })
    );
  },
};