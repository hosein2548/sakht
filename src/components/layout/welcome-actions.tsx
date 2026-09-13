"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

import { useSession } from "@/src/providers";
import { AuthService } from "@/src/core/auth/auth.service";

export function WelcomeActions() {

  const router = useRouter();

  const {
    logout,
  } = useSession();



  const handleCreateBuilding = () => {

    router.push("/buildings/new");

  };



  const handleLogout = async () => {

    await logout();

    router.replace("/login");

    
    
      // AuthService تنها نقطه خروج است:
      // - Session سرور رو پاک می‌کنه
      // - Storeها رو reset می‌کنه
      // - خودش به /login هدایت می‌کنه
      await AuthService.getInstance().logout();

  };



  return (

    <div
      className="
      w-full
      flex
      flex-col
      gap-3
      "
    >


      <Button

        size="lg"

        onClick={handleCreateBuilding}

      >

        ایجاد ساختمان جدید

      </Button>



      <Button

        variant="outline"

        size="lg"

        onClick={handleLogout}

      >

        خروج از حساب کاربری

      </Button>


    </div>

  );

}