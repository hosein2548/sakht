import { useState, useEffect, useCallback } from "react";

export interface UseOtpTimerResult {
  /** ثانیه‌های باقی‌مانده */
  seconds: number;
  /** آیا تایمر فعال است */
  isActive: boolean;
  /** آیا می‌توان کد جدید درخواست کرد */
  canResend: boolean;
  /** تنظیم مجدد تایمر با زمان جدید */
  reset: (newSeconds: number) => void;
  /** شروع مجدد تایمر */
  start: () => void;
  /** توقف تایمر */
  stop: () => void;
}

/**
 * هاک شمارنده معکوس برای OTP
 */
export function useOtpTimer(
  initialSeconds: number = 120
): UseOtpTimerResult {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(true);
  const [canResend, setCanResend] = useState(false);

  // تنظیم تایمر
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          setIsActive(false);
          setCanResend(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  // تنظیم مجدد تایمر
  const reset = useCallback((newSeconds: number) => {
    setSeconds(newSeconds);
    setIsActive(true);
    setCanResend(false);
  }, []);

  // شروع مجدد تایمر
  const start = useCallback(() => {
    if (!isActive) {
      setIsActive(true);
      setCanResend(false);
    }
  }, [isActive]);

  // توقف تایمر
  const stop = useCallback(() => {
    setIsActive(false);
  }, []);

  return {
    seconds,
    isActive,
    canResend,
    reset,
    start,
    stop,
  };
}