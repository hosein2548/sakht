import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "sakhteman-session";
const SESSION_MAX_AGE = 60 * 60 * 24;

async function isValidSession(token: string | undefined) {
  if (!token) return false;

  const secret = process.env.AUTH_SESSION_SECRET;
  if (!secret) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [timestamp, nonce, signature] = parts;
  const issuedAt = Number(timestamp);
  if (!Number.isFinite(issuedAt)) return false;

  const age = Date.now() - issuedAt;
  if (age < 0 || age > SESSION_MAX_AGE * 1000) return false;

  const data = `${timestamp}.${nonce}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const expectedBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(data)
  );

  const expected = btoa(String.fromCharCode(...new Uint8Array(expectedBuffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return signature === expected;
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const publicPaths = ["/login", "/login/otp"];
  const isPublicPath = publicPaths.some(
    (publicPath) => path === publicPath || path.startsWith(`${publicPath}/`)
  );

  const hasValidSession = await isValidSession(
    request.cookies.get(SESSION_COOKIE)?.value
  );

  if (isPublicPath && hasValidSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!isPublicPath && !hasValidSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
