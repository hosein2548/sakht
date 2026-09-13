// src/components/ui/phone-input.tsx
"use client";

import { forwardRef } from "react";
import { Phone, AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { normalizePhone } from "@/src/shared/phone/phone";

// ============================================================
// Types
// ============================================================

interface PhoneInputProps {
  /** مقدار (نرمال‌شده - ۱۱ رقم انگلیسی) */
  value: string;
  /** callback تغییر (مقدار نرمال‌شده) */
  onChange: (value: string) => void;
  /** برچسب */
  label?: string;
  /** placeholder */
  placeholder?: string;
  /** متن خطا */
  error?: string;
  /** متن راهنما */
  hint?: string;
  /** غیرفعال */
  disabled?: boolean;
  /** الزامی */
  required?: boolean;
  /** کلاس اضافه */
  className?: string;
  /** آیدی برای label */
  id?: string;
}

// ============================================================
// Component
// ============================================================

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  function PhoneInput(
    {
      value,
      onChange,
      label,
      placeholder = "۰۹۱۲۳۴۵۶۷۸۹",
      error,
      hint,
      disabled = false,
      required = false,
      className,
      id,
    },
    ref
  ) {
    const inputId = id ?? "phone-input";

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      // نرمال‌سازی: حذف غیرعددی، تبدیل اعداد فارسی، تبدیل +98
      const normalized = normalizePhone(event.target.value);
      onChange(normalized);
    };

    return (
      <div className={cn("space-y-2", className)}>
        {label && (
          <Label htmlFor={inputId}>
            {label}
            {required && <span className="text-destructive"> *</span>}
          </Label>
        )}

        <div className="relative">
          <Phone className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />

          <Input
            ref={ref}
            id={inputId}
            dir="ltr"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            maxLength={11}
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={
              error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            className={cn(
              "pr-10 text-left font-mono tracking-wider",
              error && "border-destructive focus-visible:ring-destructive"
            )}
          />
        </div>

        {error && (
          <p
            id={`${inputId}-error`}
            className="flex items-center gap-1 text-xs text-destructive"
          >
            <AlertCircle className="h-3 w-3" />
            {error}
          </p>
        )}

        {!error && hint && (
          <p id={`${inputId}-hint`} className="text-xs text-muted-foreground">
            {hint}
          </p>
        )}
      </div>
    );
  }
);