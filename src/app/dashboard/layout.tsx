"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import AppShell from "@/src/components/layout/AppShell";

import { useSession } from "@/src/providers";

import { checkUserAccess } from "@/src/features/building/services/access.service";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const {
    user,
    isAuthenticated,
    isLoading: sessionLoading,
  } = useSession();

  const [isCheckingAccess, setIsCheckingAccess] =
    useState(true);

  const [hasAccess, setHasAccess] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);


  const checkAccess = useCallback(async () => {

  if (!user?.iduser) {
    return;
  }

  setIsCheckingAccess(true);
  setError(null);

  try {

    console.log(
      "🔐 Dashboard: checking user access...",
      user.iduser
    );


    const access =
      await checkUserAccess(user.iduser);


    console.log(
      "🔐 Dashboard access:",
      access
    );


    if (!access.hasRole) {

      console.log(
        "⚠️ Dashboard: user has no role, redirecting to welcome..."
      );


      setHasAccess(false);

      router.replace("/welcome");

      return;
    }


    console.log(
      "✅ Dashboard: user has a valid role"
    );


    setHasAccess(true);


  } catch (error) {


    console.error(
      "❌ Dashboard access check error:",
      error
    );


    setHasAccess(false);


    setError(
      "بررسی دسترسی کاربر با خطا مواجه شد."
    );


  } finally {

    setIsCheckingAccess(false);

  }


}, [user, router]);


  useEffect(() => {
    if (sessionLoading) {
      return;
    }

    if (!isAuthenticated || !user) {
      console.log(
        "❌ Dashboard: user is not authenticated."
      );

      router.replace("/login");

      return;
    }

    void checkAccess();

  }, [
    sessionLoading,
    isAuthenticated,
    user,
    checkAccess,
    router,
  ]);


  /*
   * هنوز Session مشخص نشده
   */
  if (sessionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }


  /*
   * کاربر لاگین نیست
   */
  if (!isAuthenticated || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }


  /*
   * در حال بررسی نقش
   */
  if (isCheckingAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />

          <p className="text-sm text-muted-foreground">
            در حال بررسی دسترسی شما...
          </p>
        </div>
      </div>
    );
  }


  /*
   * خطا در بررسی دسترسی
   */
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="flex w-full max-w-md flex-col items-center gap-4 text-center">
          <p className="text-destructive">
            {error}
          </p>

          <button
            type="button"
            onClick={() => {
              void checkAccess();
            }}
            className="text-sm text-primary underline"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }


  /*
   * کاربر بدون نقش است.
   * قبل از redirect چیزی از Dashboard نمایش نده.
   */
  if (!hasAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }


  /*
   * کاربر دارای نقش معتبر است.
   */
  return (
    <AppShell>
      {children}
    </AppShell>
  );
}