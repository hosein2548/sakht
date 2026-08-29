"use client";

import { useEffect, useState } from "react";



import { useRouter } from "next/navigation";

import { useAuthStore } from "@/src/core/store/auth.store";
import { useAppStore } from "@/src/core/store/app.store";
import { AuthService } from "@/src/core/auth/auth.service";

import {
  notificationApi,
} from "@/src/features/notifications/api/notification.api";

import {
  useNotificationStore,
} from "@/src/features/notifications/store/notification.store";

import {
  announcementApi,
} from "@/src/features/announcements/api/announcement.api";

import {
  useAnnouncementStore,
} from "@/src/features/announcements/store/announcement.store";

import {
  AlertTriangle,
  Building2,
  Calculator,
  FileText,
  Home,
  MessageSquare,
  Receipt,
  RefreshCw,
  Users,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
} from "@/components/ui/card";



import { authStorage } from "@/src/core/storage/auth.storage";

import {
  useBuildingStore,
} from "@/src/features/building/store/building.store";

import {
  initializeUserContext,
} from "@/src/features/building/services/bootstrap.service";

import {
  dashboardApi,
} from "@/src/features/dashboard/api/dashboard.api";

import {
  useDashboardStore,
} from "@/src/features/dashboard/store/dashboard.store";

export default function DashboardPage() {
  
  const [isInitializing, setIsInitializing] = useState(true);

 
  const { user, setUser } = useAppStore();

  const router = useRouter();

  // ============================================
  // Auth State
  // ============================================

  const { user: authUser, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  // ============================================
  // Announcements Store
  // ============================================

  const announcements = useAnnouncementStore((state) => state.announcements);
  const announcementsLoading = useAnnouncementStore((state) => state.isLoading);
  const setAnnouncements = useAnnouncementStore((state) => state.setAnnouncements);
  const setAnnouncementsLoading = useAnnouncementStore((state) => state.setLoading);
  const setAnnouncementsError = useAnnouncementStore((state) => state.setError);

  // ============================================
  // Notifications Store
  // ============================================

  const notifications = useNotificationStore((state) => state.notifications);
  const notificationLoading = useNotificationStore((state) => state.isLoading);
  const setNotifications = useNotificationStore((state) => state.setNotifications);
  const setNotificationLoading = useNotificationStore((state) => state.setLoading);
  const setNotificationError = useNotificationStore((state) => state.setError);

  // ============================================
  // App Store (User)
  // ============================================

  

  // ============================================
  // Building Store
  // ============================================

  const selectedBuilding = useBuildingStore((state) => state.selectedBuilding);
  const selectedUnit = useBuildingStore((state) => state.selectedUnit);
  const buildings = useBuildingStore((state) => state.buildings);
  const units = useBuildingStore((state) => state.units);

  // ============================================
  // Dashboard Store
  // ============================================

  const mainInfo = useDashboardStore((state) => state.mainInfo);
  const isLoading = useDashboardStore((state) => state.isLoading);
  const error = useDashboardStore((state) => state.error);
  const setMainInfo = useDashboardStore((state) => state.setMainInfo);
  const setLoading = useDashboardStore((state) => state.setLoading);
  const setError = useDashboardStore((state) => state.setError);

  // ============================================
  // ✅ Mount Check
  // ============================================

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ============================================
  // ✅ Auth Check - Redirect if not authenticated
  // ============================================

  useEffect(() => {
    // تا زمانی که mounted نشده، کاری نکن
    if (!isMounted) return;

    // اگر در حال بارگذاری احراز هویت هستیم، صبر کن
    if (authLoading) return;

    // اگر احراز هویت نشده یا کاربر وجود نداره → برو به لاگین
    if (!isAuthenticated || !authUser) {
      console.log("❌ Dashboard: Not authenticated, redirecting to login...");
      router.replace("/login");
    }
  }, [isMounted, authLoading, isAuthenticated, authUser, router]);

  // ============================================
  // Restore User from localStorage
  // ============================================

  useEffect(() => {
    if (user) return;

    const storedUser = authStorage.load();
    if (!storedUser) return;

    useAppStore.getState().setUser(storedUser);
  }, [user]);

  // ============================================
  // Bootstrap after Refresh
  // ============================================

  useEffect(() => {
    if (!user) return;

    if (buildings.length > 0 || units.length > 0) return;

    void initializeUserContext(user).catch((bootstrapError) => {
      console.error("Dashboard bootstrap error:", bootstrapError);
    });
  }, [user, buildings.length, units.length]);

  // ============================================
  // Load Main Information
  // ============================================

  useEffect(() => {
    if (!user) return;

    const ids = selectedBuilding?.ids ?? selectedUnit?.ids ?? "";

    if (!ids) return;

    const loadMainInfo = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await dashboardApi.getMainInfo(ids, user.iduser);
        setMainInfo(result);
      } catch (requestError) {
        console.error("infomain error:", requestError);
        setError("دریافت اطلاعات صفحه اصلی با خطا مواجه شد.");
      } finally {
        setLoading(false);
      }
    };

    void loadMainInfo();
  }, [user, selectedBuilding?.ids, selectedUnit?.ids, setMainInfo, setLoading, setError]);

  // ============================================
  // Load Notifications
  // ============================================

  useEffect(() => {
    if (!user?.iduser) return;

    const loadNotifications = async () => {
      try {
        setNotificationLoading(true);
        setNotificationError(null);

        const result = await notificationApi.getNotifications(user.iduser);
        setNotifications(result);
      } catch (error) {
        console.error("Notification loading error:", error);
        setNotificationError("دریافت اعلان‌ها با خطا مواجه شد.");
      } finally {
        setNotificationLoading(false);
      }
    };

    void loadNotifications();
  }, [user?.iduser, setNotifications, setNotificationLoading, setNotificationError]);

  // ============================================
  // Load Announcements
  // ============================================

  useEffect(() => {
    const buildingId = selectedBuilding?.ids ?? selectedUnit?.ids ?? "";

    if (!buildingId) return;

    const loadAnnouncements = async () => {
      try {
        setAnnouncementsLoading(true);
        setAnnouncementsError(null);

        const result = await announcementApi.getRecent(buildingId);
        setAnnouncements(result);
      } catch (error) {
        console.error("Announcement loading error:", error);
        setAnnouncementsError("دریافت اطلاعیه‌ها با خطا مواجه شد.");
      } finally {
        setAnnouncementsLoading(false);
      }
    };

    void loadAnnouncements();
  }, [
    selectedBuilding?.ids,
    selectedUnit?.ids,
    setAnnouncements,
    setAnnouncementsLoading,
    setAnnouncementsError,
  ]);

   useEffect(() => {
    const initAuth = async () => {
      try {
        // اگر در Store کاربر وجود داره، ازش استفاده کن
        if (isAuthenticated && authUser) {
          setUser(authUser);
          setIsInitializing(false);
          return;
        }

        // اگر در Store نبود، از localStorage یا Session بخوان
        const authService = AuthService.getInstance();
        const user = await authService.checkAuth();

        if (user) {
          setIsInitializing(false);
          return;
        }

        // اگر هیچکدام نبود، به لاگین برو
        router.replace("/login");
      } catch (error) {
        console.error("[Dashboard] Auth init error:", error);
        router.replace("/login");
      } finally {
        setIsInitializing(false);
      }
    };

    initAuth();
  }, [isAuthenticated, authUser, router, setUser]);

  // ============================================
  // ✅ ریدایرکت در صورت عدم احراز هویت
  // ============================================

  useEffect(() => {
    if (!isInitializing && !authLoading) {
      if (!isAuthenticated || !authUser || !user) {
        router.replace("/login");
      }
    }
  }, [isInitializing, authLoading, isAuthenticated, authUser, user, router]);
  // ============================================
  // ✅ Loading State
  // ============================================

  if (!isMounted || authLoading) {
    return (
      <div dir="rtl" className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // ✅ Not Logged In
  // ============================================

  if (!isAuthenticated || !authUser || !user) {
    return (
      <div dir="rtl" className="flex min-h-[70vh] items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-destructive" />
            <h1 className="text-lg font-bold">نیاز به ورود</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              ابتدا وارد حساب کاربری شوید.
            </p>
            <Button
              className="mt-4"
              onClick={() => router.push("/login")}
            >
              رفتن به صفحه ورود
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ============================================
  // Waiting for Building / Unit
  // ============================================

  const contextReady = Boolean(selectedBuilding || selectedUnit);

  if (!contextReady) {
    return (
      <div dir="rtl" className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <h1 className="mt-4 font-semibold">در حال آماده‌سازی صفحه اصلی</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            در حال دریافت اطلاعات ساختمان و واحد...
          </p>
        </div>
      </div>
    );
  }

  // ============================================
  // Current Context
  // ============================================

  const buildingName = selectedBuilding?.names ?? selectedUnit?.names ?? "";
  const unitName = selectedUnit?.namev ?? "";

  // ============================================
  // Dashboard Error
  // ============================================

  if (error) {
    return (
      <div dir="rtl" className="px-4 py-5">
        <Card>
          <CardContent className="p-6 text-center">
            <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-destructive" />
            <h1 className="font-bold">خطا در دریافت اطلاعات</h1>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            <Button
              className="mt-5"
              variant="outline"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="ml-2 h-4 w-4" />
              تلاش مجدد
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ============================================
  // ✅ Main Page
  // ============================================

  return (
    <div dir="rtl" className="space-y-5 px-4 py-5">
      {/* ================================================= */}
      {/* User / Context Header                            */}
      {/* ================================================= */}

      <section>
        <p className="text-sm text-muted-foreground">
          سلام {mainInfo?.nameuser || user?.nameuser || "کاربر"}
        </p>
        <h1 className="mt-1 text-xl font-bold">{buildingName}</h1>
        {unitName && (
          <p className="mt-1 text-sm text-muted-foreground">واحد: {unitName}</p>
        )}
      </section>

      {/* ================================================= */}
      {/* Financial Information                            */}
      {/* ================================================= */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* موجودی صندوق */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted">
                <Wallet className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">موجودی صندوق</p>
                <p className="mt-1 truncate text-xl font-bold">
                  {isLoading ? "در حال دریافت..." : mainInfo?.mojoodi || "۰"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* بدهی */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">بدهی</p>
                <p className="mt-1 truncate text-xl font-bold">
                  {isLoading ? "در حال دریافت..." : mainInfo?.bedehi || "۰"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ================================================= */}
      {/* Statistics                                       */}
      {/* ================================================= */}

      <Card>
        <CardContent className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-4">
          <div className="text-center">
            <Building2 className="mx-auto h-6 w-6" />
            <p className="mt-2 text-xs text-muted-foreground">تعداد واحد</p>
            <p className="mt-1 text-lg font-bold">{mainInfo?.countvahed || "۰"}</p>
          </div>
          <div className="text-center">
            <Users className="mx-auto h-6 w-6" />
            <p className="mt-2 text-xs text-muted-foreground">تعداد نفرات</p>
            <p className="mt-1 text-lg font-bold">{mainInfo?.countnafar || "۰"}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">اطلاعات ۱</p>
            <p className="mt-2 text-lg font-bold">{mainInfo?.rezerv1 || "—"}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">اطلاعات ۲</p>
            <p className="mt-2 text-lg font-bold">{mainInfo?.rezerv2 || "—"}</p>
          </div>
        </CardContent>
      </Card>

      {/* ================================================= */}
      {/* Announcements                                    */}
      {/* ================================================= */}

      {(announcementsLoading || announcements.length > 0) && (
        <section>
          <h2 className="mb-3 px-1 text-base font-bold">اطلاعیه‌های اخیر</h2>
          <Card>
            <CardContent className="p-0">
              {announcementsLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : (
                <div>
                  {announcements.map((item, index) => (
                    <div
                      key={`${item.date}-${index}`}
                      className="cursor-pointer border-b px-4 py-4 last:border-b-0 hover:bg-muted"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="min-w-0 flex-1 truncate text-sm font-semibold">
                          {item.subject}
                        </p>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {item.date}
                        </span>
                      </div>
                      <p className="mt-2 truncate text-sm text-muted-foreground">
                        {item.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      )}

      {/* ================================================= */}
      {/* Useful Items                                     */}
      {/* ================================================= */}

      <section>
        <h2 className="mb-3 px-1 text-base font-bold">موارد پرکاربرد</h2>
        <div className="grid grid-cols-2 gap-3">
          <a href="/costs" className="rounded-2xl border p-4 transition hover:bg-muted">
            <div className="flex min-h-32 flex-col items-center justify-center text-center">
              <Calculator className="mb-4 h-9 w-9" />
              <span className="font-semibold">هزینه ها</span>
            </div>
          </a>
          <a href="/payments" className="rounded-2xl border p-4 transition hover:bg-muted">
            <div className="flex min-h-32 flex-col items-center justify-center text-center">
              <Wallet className="mb-4 h-9 w-9" />
              <span className="font-semibold">پرداختی ها</span>
            </div>
          </a>
          <a href="/bills" className="rounded-2xl border p-4 transition hover:bg-muted">
            <div className="flex min-h-32 flex-col items-center justify-center text-center">
              <Receipt className="mb-4 h-9 w-9" />
              <span className="font-semibold">صورت حساب</span>
            </div>
          </a>
          <a href="/messages" className="rounded-2xl border p-4 transition hover:bg-muted">
            <div className="flex min-h-32 flex-col items-center justify-center text-center">
              <MessageSquare className="mb-4 h-9 w-9" />
              <span className="font-semibold">پیام ها</span>
            </div>
          </a>
        </div>
      </section>

      {/* ================================================= */}
      {/* User Information                                 */}
      {/* ================================================= */}

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">کاربر</p>
              <p className="mt-1 font-semibold">
                {mainInfo?.nameuser || user?.nameuser || "کاربر"}
              </p>
            </div>
            <Home className="h-6 w-6" />
          </div>
          {mainInfo?.phone && (
            <p className="mt-3 text-sm text-muted-foreground">{mainInfo.phone}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}