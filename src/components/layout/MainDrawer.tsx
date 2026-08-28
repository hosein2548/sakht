"use client";

import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  authStorage,
} from "@/src/core/storage/auth.storage";

import {
  useAppStore,
} from "@/src/core/store/app.store";


import { cn } from "@/src/lib/utils";

import { useBuildingStore } from "@/src/features/building/store/building.store";
import { useAuthStore } from "@/src/features/auth/store/auth.store";

import {
  ArrowLeftRight,
  BookOpen,
  Calculator,
  FileText,
  Home,
  LogOut,
  MessageSquare,
  Receipt,
  Settings,
  Wallet,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  Building2,
} from "lucide-react";

import {
  MessageCircle,
} from "lucide-react";


import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";



interface MainDrawerProps {
  open: boolean;

  onOpenChange: (
    open: boolean
  ) => void;
}

const menuItems = [
  {
    title: "اطلاعات واحدها",
    href: "/units",
    icon: Home,
  },
  {
    title: "پیام ها و اعلانات",
    href: "/messages",
    icon: MessageSquare,
  },
  {
    title: " مدیریت",
    href: "/management",
    icon: Settings,
  },
  {
    title: "هزینه ها",
    href: "/costs",
    icon: Calculator,
  },
  {
    title: "پرداختی ها",
    href: "/payments",
    icon: Wallet,
  },
  {
    title: "صورت حساب",
    href: "/bills",
    icon: Receipt,
  },
  {
    title: "قرارداد ها",
    href: "/contracts",
    icon: FileText,
  },
  {
    title: "قوانین ساختمان",
    href: "/rules",
    icon: BookOpen,
  },
  {
  title: "اطلاعات ساختمان",
  href: "/building-info",
  icon: Building2,
},



];

export default function MainDrawer({
  
  open,
  onOpenChange,
}: MainDrawerProps) {
    const router = useRouter();
  

   const user = useAppStore((state) => state.user);
  const selectedBuilding = useBuildingStore((state) => state.selectedBuilding);
  const selectedUnit = useBuildingStore((state) => state.selectedUnit);
  const handleLogout = () => {
  const confirmed =
    window.confirm(
      "آیا نسبت به خروج از محیط کاربری اطمینان دارید؟"
    );

  if (!confirmed) {
    return;
  }
  
  if (typeof window !== "undefined") {
      localStorage.clear();
      sessionStorage.clear();
    }

  authStorage.clear();

  useAppStore
    .getState()
    .clearUser();

    onOpenChange(false);
    localStorage.clear();
    useAuthStore.getState().logout();
    useBuildingStore.getState().clearSelection?.();
  router.push(
    "/login"
  );
};

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
    >
      <SheetContent
        side="left"
        className="w-[88%] max-w-md p-0"
      >
        {/* Header */}
        <SheetHeader className="border-b px-5 py-5">
          <SheetTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            منوی اصلی
          </SheetTitle>
        </SheetHeader>

        <div className="h-[calc(100vh-5rem)] overflow-y-auto">

          {/* Menu */}
          <nav className="px-3 py-4">

            {menuItems.map(
              (item) => {
                const Icon =
                  item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() =>
                      onOpenChange(
                        false
                      )
                    }
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition hover:bg-muted"
                  >
                    <Icon className="h-5 w-5 shrink-0" />

                    <span>
                      {item.title}
                    </span>

                    <ArrowLeftRight className="mr-auto h-4 w-4 opacity-40" />
                  </Link>
                );
              }
            )}

          </nav>

          <div className="mx-4 border-t" />

          {/* Logout */}
          <div className="p-4">

            <Button
              type="button"
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="ml-3 h-5 w-5" />

              خروج از محیط کاربری
            </Button>

          </div>

          {/* Close */}
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