  "use client";

  import { useState } from "react";

  import {
    Bell,
    Menu,
  } from "lucide-react";

  import { Button } from "@/components/ui/button";

  import BuildingDrawer from "./BuildingDrawer";
  import MainDrawer from "./MainDrawer";
  import NotificationPanel from "./NotificationPanel";

  import {
    useNotificationStore,
  } from "@/src/features/notifications/store/notification.store";

  interface AppShellProps {
    children: React.ReactNode;
  }

  export default function AppShell({
    children,
  }: AppShellProps) {
    const [
      buildingDrawerOpen,
      setBuildingDrawerOpen,
    ] = useState(false);

    const [
      mainDrawerOpen,
      setMainDrawerOpen,
    ] = useState(false);

    const [
      notificationOpen,
      setNotificationOpen,
    ] = useState(false);

    const notifications =
      useNotificationStore(
        (state) => state.notifications
      );

    const hasNotifications =
      notifications.length > 0;

    const notificationCount =
      notifications.reduce(
        (total, item) => {
          const count =
            Number.parseInt(
              item.count,
              10
            );

          return (
            total +
            (Number.isNaN(count)
              ? 0
              : count)
          );
        },
        0
      );

    return (
      <div
        dir="rtl"
        className="min-h-screen bg-background"
      >
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
          <div className="relative flex h-16 items-center justify-between px-3 sm:px-5">

            {/* منوی ساختمان */}
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() =>
                  setBuildingDrawerOpen(true)
                }
                aria-label="ساختمان و واحد"
              >
                <Menu className="h-6 w-6" />
              </Button>

              {/* اعلان‌ها */}
              {hasNotifications && (
                <div className="relative">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setNotificationOpen(true)
                    }
                    aria-label="موارد جدید"
                  >
                    <Bell className="h-5 w-5" />
                  </Button>

                  {notificationCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                      {notificationCount > 99
                        ? "99+"
                        : notificationCount}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* عنوان */}
            <div className="absolute left-1/2 -translate-x-1/2">
              <span className="text-base font-bold sm:text-lg">
                ساختمان
              </span>
            </div>

            {/* منوی اصلی */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() =>
                setMainDrawerOpen(true)
              }
              aria-label="منوی اصلی"
            >
              <Menu className="h-6 w-6" />
            </Button>

          </div>
        </header>

        <main className="min-h-[calc(100vh-4rem)]">
          {children}
        </main>

        <BuildingDrawer
          open={buildingDrawerOpen}
          onOpenChange={
            setBuildingDrawerOpen
          }
        />

        <NotificationPanel
          open={notificationOpen}
          onOpenChange={
            setNotificationOpen
          }
        />

        <MainDrawer
          open={mainDrawerOpen}
          onOpenChange={
            setMainDrawerOpen
          }
        />
      </div>
    );
  }