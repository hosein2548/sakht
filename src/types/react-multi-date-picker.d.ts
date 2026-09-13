// src/types/react-multi-date-picker.d.ts
// ============================================================
// Type augmentation برای react-multi-date-picker
// - این پکیج تایپ‌های React 19 رو به‌درستی export نمی‌کنه
// - این فایل اون کمبودها رو پر می‌کنه
// ============================================================

declare module "react-multi-date-picker" {
  import type { ComponentType, ReactNode } from "react";

  interface DateObject {
    format: (format: string) => string;
    convert: (calendar?: unknown, locale?: unknown) => DateObject;
    toDate: () => Date;
    isValid: boolean;
    year: number;
    month: number;
    day: number;
  }

  interface DatePickerProps {
    value?: string | Date | DateObject | null;
    onChange?: (date: DateObject | null) => void;
    calendar?: unknown;
    locale?: unknown;
    calendarPosition?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
    inputClass?: string;
    containerClassName?: string;
    placeholder?: string;
    disabled?: boolean;
    editable?: boolean;
    inputMode?: string;
    format?: string;
    minDate?: Date | string;
    maxDate?: Date | string;
    render?: ReactNode;
    className?: string;
  }

  const DatePicker: ComponentType<DatePickerProps>;
  export default DatePicker;
}

declare module "react-date-object/calendars/persian" {
  const persian: unknown;
  export default persian;
}

declare module "react-date-object/locales/persian_fa" {
  const persian_fa: unknown;
  export default persian_fa;
}

declare module "react-date-object/calendars/gregorian" {
  const gregorian: unknown;
  export default gregorian;
}