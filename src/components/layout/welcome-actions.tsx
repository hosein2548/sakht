// src/components/layout/welcome-actions.tsx
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AuthService } from "@/src/core/auth/auth.service";

export function WelcomeActions() {
  const router = useRouter();

  const handleCreateBuilding = () => {
    router.push("/buildings/new");
  };

  const handleLogout = async () => {
    // AuthService تنها نقطه خروج است:
    // - Session سرور رو پاک می‌کنه
    // - Storeها رو reset می‌کنه
    // - خودش به /login هدایت می‌کنه
    await AuthService.getInstance().logout();
  };

  return (
    <div className="flex w-full flex-col gap-3">
      <Button size="lg" onClick={handleCreateBuilding}>
        ایجاد ساختمان جدید
      </Button>

      <Button variant="outline" size="lg" onClick={() => void handleLogout()}>
        خروج از حساب کاربری
      </Button>
    </div>
  );
}