import { apiClient } from "@/src/core/api/client";

import type {
  Building,
  PreviousManagerBuilding,
  Unit,
  BuildingApiResult,
} from "../types/building.types";

export const buildingApi = {
  async getUserBuildings(
    iduser: string
  ): Promise<BuildingApiResult> {
    const response =
      await apiClient.post<string>(
        "/sakhteman.php",
        {
          iduser,
          statephp:
            "checkAllsakhteman",
        }
      );

    const raw =
      String(response.data ?? "");

    console.log(
      "sakhteman response:",
      raw
    );

    if (raw === "nonaghsh") {
      return {
        buildings: [],
        previousManagerBuildings: [],
        units: [],
      };
    }

    if (!raw.startsWith("ok")) {
      throw new Error(
        "دریافت اطلاعات ساختمان و واحد ناموفق بود."
      );
    }

    const jsonStart =
      raw.indexOf("[");

    if (jsonStart === -1) {
      throw new Error(
        "فرمت پاسخ ساختمان نامعتبر است."
      );
    }

    try {
      const data = JSON.parse(
        raw.substring(jsonStart)
      );

      if (!Array.isArray(data)) {
        throw new Error(
          "اطلاعات دریافتی آرایه نیست."
        );
      }

      const buildings: Building[] = [];

      const previousManagerBuildings:
        PreviousManagerBuilding[] = [];

      const unitsByKey = new Map<string, Unit>();

      for (const item of data) {
        /*
         * ساختمان تحت مدیریت
         */
        if (
          String(item?.idmodir ?? "") ===
          String(iduser)
        ) {
          buildings.push({
            ids: String(
              item?.ids ?? ""
            ),
            names: String(
              item?.names ?? ""
            ),
            idmodir: String(
              item?.idmodir ?? ""
            ),
            namemodir: String(
              item?.namemodir ?? ""
            ),
            idcity: String(
              item?.idcity ?? ""
            ),
            namecity: String(
              item?.namecity ?? ""
            ),
            nameostan: String(
              item?.nameostan ?? ""
            ),
            codeostan: String(
              item?.codeostan ?? ""
            ),
          });
        }

        /*
         * ساختمان‌هایی که قبلاً مدیر آنها بوده
         */
        if (
          String(
            item?.idmodirpish ?? ""
          ) === String(iduser)
        ) {
          previousManagerBuildings.push({
            ids: String(
              item?.ids ?? ""
            ),
            names: String(
              item?.names ?? ""
            ),
            idmodir: String(
              item?.idmodir ?? ""
            ),
            namemodir: String(
              item?.namemodir ?? ""
            ),
            idcity: String(
              item?.idcity ?? ""
            ),
            namecity: String(
              item?.namecity ?? ""
            ),
            nameostan: String(
              item?.nameostan ?? ""
            ),
            codeostan: String(
              item?.codeostan ?? ""
            ),
          });
        }

        /*
         * واحدهایی که کاربر مالک یا ساکن آنهاست
         */
        if (
          String(item?.idmalek ?? "") === String(iduser) ||
          String(item?.idsaken ?? "") === String(iduser)
        ) {
          const unit: Unit = {
            idv: String(item?.idv ?? ""),
            namev: String(item?.namev ?? ""),
            malek: String(item?.idmalek ?? ""),
            saken: String(item?.idsaken ?? ""),
            idmodir: String(item?.idmodir ?? ""),
            namemodir: String(item?.namemodir ?? ""),
            ids: String(item?.ids ?? ""),
            names: String(item?.names ?? ""),
            idcity: String(item?.idcity ?? ""),
            namecity: String(item?.namecity ?? ""),
            nameostan: String(item?.nameostan ?? ""),
            codeostan: String(item?.codeostan ?? ""),
          };

          // ممکن است API برای یک واحد چند رکورد برگرداند.
          // واحد را یکی نگه می‌داریم تا نقش مالک/ساکن روی همان رکورد تجمیع شود.
          const key = `${unit.ids}-${unit.idv}`;
          const existing = unitsByKey.get(key);

          if (!existing) {
            unitsByKey.set(key, unit);
          } else {
            unitsByKey.set(key, {
              ...existing,
              malek: existing.malek || unit.malek,
              saken: existing.saken || unit.saken,
              idmodir: existing.idmodir || unit.idmodir,
              namemodir: existing.namemodir || unit.namemodir,
            });
          }
        }
      }

      return {
        buildings,
        previousManagerBuildings,
        units: Array.from(unitsByKey.values()),
      };
    } catch (error) {
      console.error(
        "Cannot parse sakhteman response:",
        error
      );

      throw new Error(
        "خواندن اطلاعات ساختمان و واحد ناموفق بود."
      );
    }
  },
};