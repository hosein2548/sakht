// src/app/api/auth/session/route.ts
import { NextResponse } from "next/server";
import { createHmac, randomBytes } from "node:crypto";
import { AUTH_SESSION_SECRET } from "@/src/core/config/env";
const COOKIE_NAME = "sakhteman-session";
const MAX_AGE = 60 * 60 * 24; // 24 hours

function getSecret() {
  if (!AUTH_SESSION_SECRET) {
    throw new Error("AUTH_SESSION_SECRET is not configured");
  }
  return AUTH_SESSION_SECRET;
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("base64url");
}

// POST: ایجاد Session
export async function POST() {
  try {
    const payload = `${Date.now()}.${randomBytes(24).toString("base64url")}`;
    const token = `${payload}.${sign(payload)}`;

    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: MAX_AGE,
    });

    return response;
  } catch (error) {
    console.error("[Session] Create failed:", error);
    return NextResponse.json(
      { success: false, message: "ایجاد نشست ورود انجام نشد." },
      { status: 500 }
    );
  }
}

// GET: بررسی Session
export async function GET() {
  // اینجا می‌تونید اطلاعات بیشتری از کاربر برگردونید
  // فعلاً فقط وضعیت رو چک می‌کنیم
  return NextResponse.json({ valid: true });
}

// DELETE: حذف Session
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}