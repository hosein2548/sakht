// src/features/welcome/api/welcome.api.ts
import { buildWelcomeImageUrl } from "@/src/core/config/env";
import type { WelcomeSlide } from "../types/welcome.types";

// نام فایل‌های تصاویر اسلایدر
const SLIDE_FILES = [
  "1.png",
  "2.png",
  "3.png",
  "4.png",
  "5.png",
  "6.png",
  "7.png",
  "8.png",
] as const;

export const welcomeApi = {
  async getSlides(): Promise<WelcomeSlide[]> {
    // فعلاً از فایل‌های ثابت استفاده می‌کنیم
    // بعداً اگر API اضافه شد، فقط این تابع عوض می‌شه
    return SLIDE_FILES.map((filename, index) => ({
      id: index + 1,
      image: buildWelcomeImageUrl(filename),
    }));
  },
};