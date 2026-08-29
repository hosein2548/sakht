# ساختمان‌نت — نسخه یکپارچه

این نسخه بر اساس آخرین ZIP ارسالی پروژه اصلاح شده است.

## موارد اعمال‌شده

- احراز هویت مرکزی با Session امن HttpOnly
- محافظت یکپارچه Routeهای برنامه از طریق `middleware.ts`
- Login و OTP به‌عنوان Route عمومی
- جلوگیری از ایجاد Session بدون تأیید OTP در Backend
- Logout و حذف Session
- حفظ مسیر مقصد بعد از ورود
- انتقال تأیید OTP به Route سروری برای جلوگیری از اعتماد به localStorage
- Design System مرکزی در `src/app/globals.css`
- توکن مرکزی رنگ، radius، اندازه Button و Input
- Button و Input از توکن‌های Design System استفاده می‌کنند
- حذف پیکربندی قدیمی Tailwind 3 و استفاده از Tailwind 4/PostCSS
- حذف UI و utilityهای تکراری و یکسان‌سازی importها
- تنظیم مسیر CSS در `components.json`
- حذف وابستگی Layout به فونت Geist و استفاده از فونت برنامه
- جلوگیری از race condition اولیه Zustand با `isLoading`
- حذف Auth Checkهای تکراری از Layout و Dashboard؛ Middleware مرجع اصلی Route protection است.

## تنظیمات محیط

فایل `.env.local` بسازید:

```env
AUTH_SESSION_SECRET=یک-رشته-تصادفی-طولانی
PHP_API_BASE_URL=https://web120.ir/apartment/app_ver1
```

برای ساخت secret در PowerShell:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

## اجرا

```powershell
npm install
npm run build
npm run dev
```

اگر PowerShell اجازه اجرای `npm.ps1` نداد:

```powershell
npm.cmd install
npm.cmd run build
npm.cmd run dev
```

## محل کنترل ظاهر کلی

تمام توکن‌های اصلی Design System در این فایل هستند:

`src/app/globals.css`

در بخش `:root` می‌توانید رنگ‌ها، radius، ارتفاع Button/Input و سایر مقادیر مرکزی را تغییر دهید.
