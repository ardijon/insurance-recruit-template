# Insurance Recruit Template — وضعیت پروژه

## تاریخ آخرین آپدیت: ۱۴۰۵/۰۵/۰۵

## ✅ انجام شده

### طراحی و UI
- قالب HTML با ساختار کامل: Hero، پروفایل مدیر، دیوار موفقیت، مسیر رشد، FAQ، فرم درخواست
- فونت Vazirmatn (خودمیزبان، ۴ وزن)
- تم warm/dark با سوئیچر
- ریسپانسیو برای موبایل و دسکتاپ

### بک‌اند و دیتابیس
- لایه دیتابیس دوگانه: Turso (cloud) + SQLite (local)
- توابع async: `execute`, `executeInsert`, `selectOne`, `selectAll`
- Migration system برای Turso و local SQLite
- Seed data: پروفایل مدیر، دیوار موفقیت، مسیر رشد، FAQ

### API Routes (۱۷ مسیر)
- `/api/applications` — ثبت درخواست نمایندگی
- `/api/admin/*` — احراز هویت، آپلود فایل، مدیریت محتوا
- `/api/apply/*` — فرآیند درخواست

### فرانت‌اند
- فرم درخواست نمایندگی با اعتبارسنجی Zod
- پنل مدیریت با احراز هویت ساده (رمز عبور)
- صفحه اصلی (Server Component)

### استقرار
- **Netlify:** سایت لایو با Turso database
- **GitHub:** ریپو `ardijon/insurance-recruit-template`
- **Turso:** دیتابیس `insurance-db` روی `aws-eu-west-1`
- Build script: `npm install && npx tsx scripts/setup-db.ts && npm run build`
- فایل `scripts/setup-db.ts` برای ساخت جدول‌ها و seed data در build time

## ⚠️ موارد باقی‌مانده

### اولویت بالا
- [ ] تست کامل فرم ثبت‌نام از گوشی (submit موفق)
- [ ] تست پنل مدیریت از گوشی (آپلود عکس، ویرایش محتوا)
- [ ] بررسی عملکرد Telegram Bot API (ارسال نوتیفیکی션)
- [ ] بهینه‌سازی سرعت لود صفحه

### اولویت متوسط
- [ ] صفحه لندینگ اختصاصی برای نمایندگان
- [ ] سیستم ارجاع (referral) با لینک اختصاصی
- [ ] صفحه دیوار موفقیت با امکان آپلود عکس
- [ ] بهبود UI/UX پنل مدیریت

### اولویت پایین
- [ ] چندزبانه (فارسی/انگلیسی)
- [ ] سئو و متا تگ‌ها
- [ ] analytics و tracking
- [ ] PWA برای نصب روی گوشی

## 📁 ساختار فایل‌های کلیدی

```
├── app/
│   ├── layout.tsx          # Root layout (Server Component)
│   ├── page.tsx            # صفحه اصلی
│   ├── apply/page.tsx      # فرم درخواست
│   └── api/                # API Routes
├── components/
│   ├── application-form.tsx
│   ├── theme-toggle.tsx
│   └── ...
├── lib/
│   ├── db.ts               # لایه دیتابیس دوگانه
│   ├── seed.ts             # Seed data
│   └── schema.sql          # Schema اولیه
├── scripts/
│   └── setup-db.ts         # Setup در build time
├── public/
│   └── fonts/              # فونت Vazirmatn
├── netlify.toml            # Config استقرار
└── package.json
```

## 🔑 اطلاعات مهم

| آیتم | مقدار |
|------|-------|
| پلتفرم هاست | Netlify |
| دیتابیس | Turso (aws-eu-west-1) |
| رمز پنل مدیریت | admin123 |
| ریپو GitHub | ardijon/insurance-recruit-template |
| Turso DB | insurance-db |
