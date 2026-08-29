// src/app/(auth)/login/otp/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, AlertCircle, Clock, RefreshCw } from "lucide-react";

import { AuthService } from "@/src/core/auth/auth.service";
import { useAuthStore } from "@/src/core/store/auth.store";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const INITIAL_SECONDS = 120;

export default function OtpPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [seconds, setSeconds] = useState(INITIAL_SECONDS);
  const [canResend, setCanResend] = useState(false);

  const { phone, setUser, setAuthenticated } = useAuthStore();

  // Focus on input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // اگر شماره تلفن وجود نداشت، برگشت به صفحه ورود
  useEffect(() => {
    if (!phone) {
      router.push("/login");
    }
  }, [phone, router]);

  // تایمر
  useEffect(() => {
    if (seconds <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setTimeout(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [seconds]);

  const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleResend = async () => {
    if (!phone) return;

    setError("");
    setSuccess(false);

    try {
      const authService = AuthService.getInstance();
      const result = await authService.sendCode(phone);

      if (!result.success) {
        setError(result.message || "ارسال مجدد کد با خطا مواجه شد.");
        return;
      }

      // تنظیم مجدد تایمر
      setSeconds(result.expirySeconds || INITIAL_SECONDS);
      setCanResend(false);
      setSuccess(true);

      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("[OtpPage] Resend error:", error);
      setError("ارسال مجدد کد با خطا مواجه شد.");
    }
  };

  const handleVerify = async () => {
    if (!phone || code.length !== 5) {
      setError("لطفاً کد ۵ رقمی را وارد کنید.");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      const authService = AuthService.getInstance();
      const result = await authService.verifyCode(phone, code);

      if (!result.success || !result.user) {
        setError(result.message || "کد وارد شده صحیح نیست.");
        return;
      }

      // تایید نهایی - Storeها قبلاً در AuthService تنظیم شدن
      // فقط برای اطمینان دوباره ست می‌کنیم
      setUser(result.user);
      setAuthenticated(true);

      // هدایت به داشبورد
      router.replace("/dashboard");

    } catch (error) {
      console.error("[OtpPage] Verify error:", error);
      setError("تایید کد با خطا مواجه شد.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && code.length === 5) {
      void handleVerify();
    }
  };

  if (!phone) {
    return null;
  }

  return (
    <div dir="rtl" className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-background px-4 py-12">
      <Card className="w-full max-w-md border-0 shadow-xl">
        <CardHeader className="space-y-2 text-center">
          <Link href="/login" className="inline-flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            بازگشت
          </Link>

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Clock className="h-8 w-8 text-primary" />
          </div>

          <CardTitle className="text-2xl font-bold">کد تایید</CardTitle>
          <CardDescription className="text-sm">
            کد ۵ رقمی ارسال شده به شماره
            <span className="mx-1 font-medium text-foreground">
              {phone.replace(/(\d{4})(\d{4})(\d{3})/, "$1***$2$3")}
            </span>
            را وارد کنید.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {success && (
            <Alert className="border-success/30 bg-success/10 text-success dark:bg-success/15">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>کد جدید با موفقیت ارسال شد.</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="border-destructive/30 bg-destructive/5 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Input
              ref={inputRef}
              dir="ltr"
              type="text"
              inputMode="numeric"
              maxLength={5}
              placeholder="مثال: ۱۲۳۴۵"
              className="h-14 text-center text-2xl font-bold tracking-widest"
              value={code}
              onChange={(event) => {
                const value = event.target.value.replace(/\D/g, "");
                setCode(value);
                if (error) setError("");
              }}
              onKeyDown={handleKeyDown}
              disabled={isVerifying}
            />
            <p className="text-center text-xs text-muted-foreground">کد تایید ۵ رقمی است</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
              <span className="text-sm font-medium">زمان باقی‌مانده</span>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className={`font-mono text-lg font-bold ${seconds > 0 ? "text-foreground" : "text-destructive"}`}>
                  {formatTime(seconds)}
                </span>
              </div>
            </div>

            {canResend ? (
              <Button variant="outline" className="w-full gap-2" onClick={() => void handleResend()} disabled={isVerifying}>
                <RefreshCw className="h-4 w-4" />
                ارسال مجدد کد
              </Button>
            ) : (
              <Button variant="outline" className="w-full gap-2 text-muted-foreground" disabled>
                <Clock className="h-4 w-4" />
                {formatTime(seconds)} تا ارسال مجدد
              </Button>
            )}
          </div>

          <Button
            className="h-12 w-full gap-2 text-base font-semibold"
            disabled={code.length !== 5 || isVerifying}
            onClick={() => void handleVerify()}
          >
            {isVerifying ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-background border-t-transparent" />
                در حال تایید...
              </>
            ) : (
              "تایید و ورود"
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            در صورت عدم دریافت کد، پس از اتمام تایمر می‌توانید درخواست ارسال مجدد کنید.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}