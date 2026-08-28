// import { redirect } from "next/navigation";

// export default function HomePage() {
//   redirect("/login");
// }


// src/app/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/src/features/auth/store/auth.store";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // فقط بعد از mount شدن و وقتی بارگذاری تموم شد
    if (isMounted && !isLoading) {
      console.log("🔍 Checking auth status:", { isAuthenticated });
      
      if (isAuthenticated) {
        console.log("✅ Authenticated → redirecting to dashboard");
        router.replace("/dashboard");
      } else {
        console.log("❌ Not authenticated → redirecting to login");
        router.replace("/login");
      }
    }
  }, [isMounted, isAuthenticated, isLoading, router]);

  // نمایش اسپلش در حین بارگذاری
  if (!isMounted || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-background">
        <div className="text-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-sm text-muted-foreground">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  // در حال redirect (چیزی نمایش داده نشه)
  return null;
}