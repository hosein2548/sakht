import "server-only";

import type { AuthUser } from "../types/auth.types";

const PHP_BASE_URL =
  process.env.PHP_API_BASE_URL ?? "https://web120.ir/apartment/app_ver1";

function extractUser(raw: string, phone: string): AuthUser | null {
  if (!raw.startsWith("ok")) return null;

  const jsonStart = raw.indexOf("[");
  if (jsonStart === -1) return null;

  try {
    const data = JSON.parse(raw.substring(jsonStart));
    if (!Array.isArray(data) || data.length === 0 || !data[0]?.iduser) {
      return null;
    }

    const item = data[0];

    return {
      iduser: String(item.iduser),
      nameuser: String(item.nameuser ?? ""),
      phone,
      role: item.role === "modir" || item.role === "malek" || item.role === "saken"
        ? item.role
        : null,
    };
  } catch {
    return null;
  }
}

export async function verifyLoginCode(
  phone: string,
  code: string
): Promise<AuthUser | null> {
  const response = await fetch(`${PHP_BASE_URL}/login.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/plain, application/json",
    },
    cache: "no-store",
    body: JSON.stringify({
      mycode: code,
      myphone: phone,
      statephp: "checkcode",
    }),
  });

  if (!response.ok) return null;

  const raw = await response.text();

  if (raw === "no" || raw === "false") return null;

  return extractUser(raw, phone);
}
