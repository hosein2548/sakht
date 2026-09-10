"use client";

import {
  useEffect,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  useSession,
} from "@/src/providers";

import {
  WelcomePage,
} from "@/src/components/layout/welcome-page";


export default function Page() {
  const router = useRouter();

  const {
    isAuthenticated,
    isLoading,
  } = useSession();


  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [
    isAuthenticated,
    isLoading,
    router,
  ]);


  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }


  return <WelcomePage />;
}