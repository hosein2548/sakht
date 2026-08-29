import { NextResponse } from "next/server";
import { createHmac, randomBytes } from "node:crypto";
import { verifyLoginCode } from "@/src/features/auth/services/auth-verification.service";
import type { AuthUser } from "@/src/features/auth/types/auth.types";

const COOKIE_NAME = "sakhteman-session";
const MAX_AGE = 60 * 60 * 24;

function getSecret() {
  const secret = process.env.AUTH_SESSION_SECRET;
  if (!secret) throw new Error("AUTH_SESSION_SECRET is not configured");
  return secret;
}

function createSessionToken() {
  const payload = `${Date.now()}.${randomBytes(24).toString("base64url")}`;
  const signature = createHmac("sha256", getSecret())
    .update(payload)
    .digest("base64url");

  return `${payload}.${signature}`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      phone?: unknown;
      code?: unknown;
    };

    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const code = typeof body.code === "string" ? body.code.trim() : "";

    if (!/^09\d{9}$/.test(phone) || !/^\d{5}$/.test(code)) {
      return NextResponse.json(
        { success: false, message: "شماره موبایل یا کد تایید نامعتبر است." },
        { status: 400 }
      );
    }

    const user = await verifyLoginCode(phone, code);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "کد وارد شده صحیح نیست." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      user: user satisfies AuthUser,
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: createSessionToken(),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: MAX_AGE,
    });

    return response;
  } catch (error) {
    console.error("Verify login failed:", error);
    return NextResponse.json(
      { success: false, message: "تایید ورود با خطا مواجه شد." },
      { status: 500 }
    );
  }
}
