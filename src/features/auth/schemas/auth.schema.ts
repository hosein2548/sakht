import { z } from "zod";

export const phoneSchema = z.object({
  mobile: z
    .string()
    .regex(/^09\d{9}$/, "شماره موبایل معتبر نیست"),
});

export const otpSchema = z.object({
  code: z
    .string()
    .min(4, "کد تأیید را وارد کنید")
    .max(6, "کد تأیید معتبر نیست")
    .regex(/^\d+$/, "کد تأیید فقط باید شامل اعداد باشد"),
});

export type PhoneForm = z.infer<typeof phoneSchema>;
export type OtpForm = z.infer<typeof otpSchema>;