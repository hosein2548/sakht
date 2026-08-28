"use client";

import Link from "next/link";

import {
  Bell,
  Calculator,
  MessageSquare,
  Settings,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import {
  useNotificationStore,
} from "@/src/features/notifications/store/notification.store";

interface NotificationPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function getNotificationIcon(type: string) {
  if (type === "cost") {
    return Calculator;
  }

  if (
    type === "message" ||
    type === "elanat"
  ) {
    return MessageSquare;
  }

  if (
    type === "endmidir" ||
    type === "newmidir" ||
    type === "pishnahad"
  ) {
    return Settings;
  }

  return Bell;
}

function getNotificationHref(type: string) {
  if (type === "cost") {
    return "/costs";
  }

  if (
    type === "message" ||
    type === "elanat"
  ) {
    return "/messages";
  }

  if (
    type === "endmidir" ||
    type === "newmidir" ||
    type === "pishnahad"
  ) {
    return "/management";
  }

  return "#";
}

export default function NotificationPanel({
  open,
  onOpenChange,
}: NotificationPanelProps) {
  const notifications =
    useNotificationStore(
      (state) => state.notifications
    );

  const isLoading =
    useNotificationStore(
      (state) => state.isLoading
    );

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
    >
      <SheetContent
        side="left"
        className="w-[90%] max-w-md p-0"
      >
        <SheetHeader className="border-b px-5 py-5">
          <SheetTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            موارد جدید
          </SheetTitle>
        </SheetHeader>

        <div className="h-[calc(100vh-5rem)] overflow-y-auto">
          {isLoading ? (
            <div className="flex min-h-40 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex min-h-40 flex-col items-center justify-center px-6 text-center text-muted-foreground">
              <Bell className="mb-3 h-8 w-8" />

              <p className="text-sm">
                مورد جدیدی وجود ندارد.
              </p>
            </div>
          ) : (
            <div className="space-y-2 p-3">
              {notifications.map((item) => {
                const Icon =
                  getNotificationIcon(
                    item.noepayam
                  );

                const href =
                  getNotificationHref(
                    item.noepayam
                  );

                return (
                  <Link
                    key={item.id}
                    href={href}
                    onClick={() =>
                      onOpenChange(false)
                    }
                    className="block rounded-xl border p-4 transition hover:bg-muted"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">
                          {item.description}
                        </p>

                        {item.subject && (
                          <p className="mt-1 truncate text-sm">
                            {item.subject}
                          </p>
                        )}

                        {item.count && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            تعداد: {item.count}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="border-t px-4 py-4">
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() =>
                onOpenChange(false)
              }
            >
              <X className="ml-2 h-4 w-4" />
              بستن
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}