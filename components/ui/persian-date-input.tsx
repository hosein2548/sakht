// src/components/ui/persian-date-input.tsx
"use client";

import { forwardRef } from "react";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { toEnglishDigits } from "@/src/shared/date/persian";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

interface PersianDateInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export const PersianDateInput = forwardRef<
  HTMLDivElement,
  PersianDateInputProps
>(function PersianDateInput(
  {
    value,
    onChange,
    label,
    placeholder = "انتخاب تاریخ...",
    error,
    hint,
    disabled = false,
    required = false,
    className,
  },
  ref
) {
  return (
    <div ref={ref} className={cn("space-y-2", className)}>
      {label && (
        <Label>
          {label}
          {required && <span className="text-destructive"> *</span>}
        </Label>
      )}

      <DatePicker
        value={value}
        onChange={(date) => {
  if (!date) {
    onChange("");
    return;
  }
  
  // گرفتن خروجی از picker (احتمالاً با اعداد فارسی)
  const raw = date.format("YYYY/MM/DD");
  
  // نرمال‌سازی به اعداد انگلیسی + جداکننده /
  const formatted = normalizePickerDate(raw);
  
  onChange(formatted);
}}
        calendar={persian}
        locale={persian_fa}
        calendarPosition="bottom-right"
        inputClass={cn(
          "h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
          "ring-offset-background placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-destructive focus-visible:ring-destructive",
          "font-mono"
        )}
        containerClassName="w-full"
        placeholder={placeholder}
        disabled={disabled}
        inputMode="numeric"
        editable={false}
      />

      {error && (
        <p className="flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}

      {!error && hint && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
});

function normalizePickerDate(raw: string): string {
  if (!raw) return "";

  // 1) تبدیل اعداد فارسی/عربی به انگلیسی
  let result = toEnglishDigits(raw);

  // 2) تبدیل هر جداکننده به /
  result = result.replace(/[-._\s]+/g, "/");

  // 3) حذف / اضافه
  result = result.replace(/\/+/g, "/").replace(/^\/|\/$/g, "");

  // 4) اطمینان از فرمت YYYY/MM/DD
  const parts = result.split("/");
  if (parts.length !== 3) return result;

  const [year, month, day] = parts;
  return `${year}/${month.padStart(2, "0")}/${day.padStart(2, "0")}`;
}