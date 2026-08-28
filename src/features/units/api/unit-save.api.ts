import { apiClient } from "@/src/core/api/client";

export interface SaveUnitInput {
  idv: string;
  ids: string;

  namevahed: string;
  metter: string;

  aab: string;
  gaz: string;
  bargh: string;

  parking: string;
  anbari: string;

  tozihat: string;
  datefrom: string;
}

function parseResponse(
  raw: string
): {
  success: boolean;
  message?: string;
} {
  if (raw.startsWith("ok")) {
    return {
      success: true,
    };
  }

  if (raw.startsWith("no")) {
    return {
      success: false,
      message: "ذخیره اطلاعات واحد انجام نشد.",
    };
  }

  return {
    success: false,
    message:
      "پاسخ نامعتبر از سرور دریافت شد.",
  };
}

export const unitSaveApi = {
  async save(
    input: SaveUnitInput
  ) {
    const response =
      await apiClient.post<string>(
        "/vahed.php",
        {
          idv: input.idv,
          ids: input.ids,

          namevahed:
            input.namevahed,

          metter:
            input.metter,

          aab:
            input.aab,

          gaz:
            input.gaz,

          bargh:
            input.bargh,

          parking:
            input.parking,

          anbari:
            input.anbari,

          tozihat:
            input.tozihat,

          datefrom:
            input.datefrom,

          statephp:
            "SaveVahedInfo",
        }
      );

    const raw =
      String(response.data ?? "");

    console.log(
      "SaveVahedInfo response:",
      raw
    );

    return parseResponse(raw);
  },
};