# Prompt برای Claude — پروژه Insurance Recruit SaaS

## خلاصه پروژه

من یک قالب وب‌سایت برای جذب نماینده بیمه عمر ساخته‌ام. الان می‌خوام اون رو به یک پلتفرم SaaS تبدیل کنم که بتونم به چندین مشتری بفروشم.

## وضعیت فعلی

### فایل‌های موجود
```
insurance-recruit-template/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout (Server Component)
│   ├── page.tsx            # صفحه اصلی
│   ├── apply/page.tsx      # فرم درخواست نمایندگی
│   └── api/                # 17 API Route
├── components/             # کامپوننت‌های React
├── lib/
│   ├── db.ts               # لایه دیتابیس دوگانه (Turso + SQLite)
│   ├── seed.ts             # Seed data
│   └── schema.sql          # Schema اولیه
├── scripts/
│   └── setup-db.ts         # Setup در build time
├── public/fonts/           # فونت Vazirmatn
├── netlify.toml            # Config استقرار
└── package.json
```

### تکنولوژی‌ها
- Next.js 16 (App Router, Server Components)
- TypeScript
- Tailwind CSS
- Turso (SQLite cloud) + SQLite (local)
- Zod (validation)
- Netlify (هاست)

### دیتابیس فعلی
- **Turso:** `libsql://insurance-db-ardijon.aws-eu-west-1.turso.io`
- **جدول‌ها:** manager_profile, success_wall_entries, growth_path_stages, faq_items, referral_links, applicants, fit_assessment_results, success_visual_story

---

## هدف

### فاز ۱: تست بازار (الان)
- فروش قالب به مشتریان
- هر مشتری یه نسخه جداگانه داشته باشه
- هزینه کم برای شروع

### فاز ۲: SaaS (اگه بازار خوب بود)
- یک اپ مرکزی برای مدیریت همه مشتری‌ها
- ساب‌دامنه یا ساب‌پوشه برای هر مشتری
- آپدیت مرکزی (یک بار کد رو آپدیت کنی ← همه آپدیت بشن)
- پنل مدیریت مشتری‌ها
- **پشتیبانی از دامنه اختصاصی مشتری**

---

## چی می‌خوام بسازم

### گزینه ۱: SaaS با ساب‌پوشه (ساده‌تر)
```
insurance.ai2apps.com/client1    ← مشتری ۱
insurance.ai2apps.com/client2    ← مشتری ۲
```

### گزینه ۲: SaaS با ساب‌دامنه (حرفه‌ای‌تر)
```
client1.insurance.ai2apps.com    ← مشتری ۱
client2.insurance.ai2apps.com    ← مشتری ۲
```

### گزینه ۳: دامنه اختصاصی مشتری (حرفه‌ای‌ترین)
```
www.client1-domain.com           ← مشتری ۱ (دامنه خودش)
www.client2-domain.com           ← مشتری ۲ (دامنه خودش)
```

---

## 🔑 پشتیبانی از دامنه اختصاصی مشتری

### مشتری چی می‌خواد؟
هر مشتری اصرار داره که سایتش با **دامنه خودش** و **اسم دلخواهش** بالا بیاد. مثلاً:
- `www.bimeh-hayat.com`
- `www.team-rezaei.ir`
- `insurance.client1.com`

### راه‌حل فنی

#### مرحله ۱: DNS Setup توسط مشتری
مشتری باید یک رکورد DNS اضافه کنه:

**گزینه A: CNAME Record (توصیه شده)**
```
نوع: CNAME
نام: @ یا www
مقدار: your-saas-platform.com
TTL: 3600
```

**گزینه B: A Record**
```
نوع: A
نام: @
مقدار: IP_ADDRESS_OF_YOUR_SERVER
TTL: 3600
```

#### مرحله ۲: ثبت دامنه در پلتفرم
مشتری از پنل مدیریت:
1. دامنه خودش رو وارد می‌کنه (`www.client1-domain.com`)
2. سیستم DNS رو چک می‌کنه (آیا به سرور شما وصل شده؟)
3. اگر وصل بود، دامنه رو فعال می‌کنه
4. SSL certificate به صورت خودکار صادر می‌شه (Let's Encrypt)

#### مرحله ۳: روتینگ در سرور
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  
  // چک کن آیا این دامنه متعلق به یک مشتری هست
  const tenant = await getTenantByDomain(host);
  
  if (tenant) {
    // rewrite به صفحه مشتری
    return NextResponse.rewrite(new URL(`/${tenant.id}${request.nextUrl.pathname}`, request.url));
  }
  
  // اگر دامنه مشتری نبود، صفحه عادی نشون بده
  return NextResponse.next();
}
```

#### مرحله ۴: SSL Certificate خودکار
```typescript
// scripts/setup-ssl.ts
async function setupSSL(domain: string) {
  // استفاده از Let's Encrypt
  const cert = await letsencrypt.getCertificate(domain);
  
  // ذخیره در دیتابیس
  await db.update('tenants', { 
    ssl_cert: cert.certificate, 
    ssl_key: cert.privateKey 
  });
}
```

### مزایای این روش
- ✅ مشتری دامنه خودش رو داره
- ✅ SSL خودکار (امنیت)
- ✅ مدیریت مرکزی
- ✅ آپدیت خودکار

### چالش‌ها و راه‌حل‌ها

| چالش | راه‌حل |
|------|--------|
| SSL Certificate برای دامنه‌های مختلف | استفاده از Let's Encrypt + Certbot |
| روتینگ بر اساس Host header | Next.js Middleware |
| DNS propagation | چک خودکار + راهنمای مشتری |
| CDN برای دامنه‌های مختلف | Cloudflare (رایگان) |

---

## الزامات فنی

### Tenant Isolation
- هر مشتری دیتابیس جداگانه
- فایل‌های آپلود شده جداگانه (یا S3)
- تنظیمات جداگانه

### Auto-provisioning
- مشتری جدید = یک کلیک
- ساخت دیتابیس + seed data + تنظیمات اولیه

### Central Updates
- آپدیت کد ← اعمال خودکار روی همه مشتری‌ها
- Versioning (آپدیت بدون downtime)

### Custom Domain Support
- ثبت دامنه مشتری در سیستم
- چک DNS و فعال‌سازی خودکار
- SSL certificate خودکار

### Admin Panel
- لیست مشتری‌ها
- اضافه/حذف مشتری
- آپدیت مرکزی
- مانیتورینگ

---

## ساختار پیشنهادی

### ۱. Database Schema (مرکزی)

```sql
-- جدول مشتری‌ها
CREATE TABLE tenants (
  id TEXT PRIMARY KEY,              -- 'client1', 'client2'
  name TEXT NOT NULL,               -- نام مشتری
  slug TEXT NOT NULL UNIQUE,        -- 'client1' (برای ساب‌پوشه)
  custom_domain TEXT UNIQUE,        -- 'www.client1-domain.com'
  turso_url TEXT NOT NULL,          -- URL دیتابیس Turso
  turso_token TEXT NOT NULL,        -- Token دیتابیس Turso
  status TEXT DEFAULT 'active',     -- 'active', 'suspended', 'deleted'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- جدول تنظیمات هر مشتری
CREATE TABLE tenant_configs (
  tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT,
  PRIMARY KEY (tenant_id, key)
);

-- جدول فایل‌های آپلود شده
CREATE TABLE tenant_files (
  id SERIAL PRIMARY KEY,
  tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,          -- 'photo', 'document', 'image'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- جدول لاگ فعالیت‌ها
CREATE TABLE tenant_activity_logs (
  id SERIAL PRIMARY KEY,
  tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE,
  action TEXT NOT NULL,             -- 'created', 'updated', 'login'
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### ۲. Tenant Middleware

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  
  // ۱. چک کن آیا ساب‌دامنه هست
  const subdomainMatch = host.match(/^([a-z0-9-]+)\.insurance\.ai2apps\.com$/);
  if (subdomainMatch) {
    const tenantSlug = subdomainMatch[1];
    return handleTenantRequest(request, tenantSlug);
  }
  
  // ۲. چک کن آیا دامنه اختصاصی مشتری هست
  const customTenant = await getTenantByDomain(host);
  if (customTenant) {
    return handleTenantRequest(request, customTenant.id);
  }
  
  // ۳. اگر هیچکدام نبود، صفحه عادی
  return NextResponse.next();
}

async function handleTenantRequest(request: NextRequest, tenantId: string) {
  // rewrite به صفحه مشتری
  const url = request.nextUrl.clone();
  url.pathname = `/${tenantId}${url.pathname}`;
  
  return NextResponse.rewrite(url);
}
```

### ۳. Auto-provisioning Script

```typescript
// scripts/provision-tenant.ts
import { createClient } from '@libsql/client';

interface ProvisionResult {
  tenantId: string;
  tursoUrl: string;
  customDomain?: string;
}

async function provisionTenant(
  id: string, 
  name: string, 
  customDomain?: string
): Promise<ProvisionResult> {
  console.log(`Provisioning tenant: ${id}`);
  
  // ۱. ساخت دیتابیس Turso
  const db = await turso.databases.create(`insurance-${id}`);
  console.log(`Database created: ${db.name}`);
  
  // ۲. ساخت جدول‌ها
  await db.executeMultiple(schema);
  console.log('Tables created');
  
  // ۳. Seed data
  await seedDatabase(db);
  console.log('Data seeded');
  
  // ۴. ذخیره در دیتابیس مرکزی
  await centralDb.insert('tenants', {
    id,
    name,
    slug: id,
    custom_domain: customDomain,
    turso_url: db.url,
    turso_token: db.token,
    status: 'active'
  });
  
  // ۵. تنظیمات اولیه
  await centralDb.insert('tenant_configs', [
    { tenant_id: id, key: 'theme', value: 'warm' },
    { tenant_id: id, key: 'language', value: 'fa' },
    { tenant_id: id, key: 'rtl', value: 'true' }
  ]);
  
  console.log(`Tenant ${id} provisioned successfully!`);
  
  return {
    tenantId: id,
    tursoUrl: db.url,
    customDomain
  };
}
```

### ۴. Custom Domain Setup API

```typescript
// app/api/admin/tenants/[id]/domain/route.ts
export async function POST(request: NextRequest) {
  const { tenantId, domain } = await request.json();
  
  // ۱. چک کن آیا دامنه قبلاً استفاده شده
  const existing = await db.selectOne(
    'SELECT id FROM tenants WHERE custom_domain = ?', 
    [domain]
  );
  if (existing) {
    return NextResponse.json({ error: 'Domain already in use' }, { status: 400 });
  }
  
  // ۲. DNS رو چک کن
  const dnsValid = await checkDNS(domain);
  if (!dnsValid) {
    return NextResponse.json({ 
      error: 'DNS not configured',
      instructions: {
        type: 'CNAME',
        name: '@',
        value: 'your-saas-platform.com'
      }
    }, { status: 400 });
  }
  
  // ۳. SSL certificate بساز
  const sslCert = await setupSSL(domain);
  
  // ۴. دامنه رو فعال کن
  await db.update('tenants', {
    custom_domain: domain,
    ssl_cert: sslCert.certificate,
    ssl_key: sslCert.privateKey
  });
  
  return NextResponse.json({ success: true, domain });
}
```

### ۵. DNS Checker Utility

```typescript
// lib/dns-checker.ts
import dns from 'dns';

export async function checkDNS(domain: string): Promise<boolean> {
  return new Promise((resolve) => {
    dns.resolveCname(domain, (err, addresses) => {
      if (err) {
        // CNAME پیدا نشد، A record رو چک کن
        dns.resolve4(domain, (err2, aRecords) => {
          if (err2) {
            resolve(false);
          } else {
            // چک کن آیا IP مال ماست
            resolve(aRecords.includes(YOUR_SERVER_IP));
          }
        });
      } else {
        // چک کن آیا CNAME به سرور ماست
        resolve(addresses.some(addr => addr.includes('your-saas-platform.com')));
      }
    });
  });
}
```

---

## تسک‌ها

### مرحله ۱: آماده‌سازی (۱-۲ روز)
- [ ] ساختار پروژه رو بررسی کن و فایل‌های کلیدی رو بخون
- [ ] Database schema مرکزی (tenants, tenant_configs, tenant_files, tenant_activity_logs) طراحی کن
- [ ] Auto-provisioning script بنویس
- [ ] Tenant middleware پیاده‌سازی کن
- [ ] Custom domain support اضافه کن

### مرحله ۲: SaaS Core (۲-۳ روز)
- [ ] Tenant middleware بنویس (تشخیص مشتری از URL و دامنه)
- [ ] Database connection pool برای هر مشتری
- [ ] Admin panel برای مدیریت مشتری‌ها
- [ ] API endpoint برای provisioning
- [ ] Custom domain setup API
- [ ] DNS checker utility
- [ ] SSL certificate automation

### مرحله ۳: پنل مشتری (۱-۲ روز)
- [ ] Dashboard برای هر مشتری
- [ ] Settings (نام، تم، محتوا)
- [ ] Custom domain setup wizard
- [ ] Analytics ساده

### مرحله ۴: استقرار (۱ روز)
- [ ] Deploy روی Vercel یا Railway
- [ ] DNS setup برای ساب‌دامنه‌ها
- [ ] Wildcard SSL certificate
- [ ] Monitoring و logging

### مرحله ۵: تست و بهینه‌سازی (۱-۲ روز)
- [ ] تست multi-tenant isolation
- [ ] تست custom domain setup
- [ ] تست auto-provisioning
- [ ] بهینه‌سازی عملکرد
- [ ] تست load و stress

---

## نکات مهم

### انتخاب پلتفرم هاست
| پلتفرم | مزیت | عیب | هزینه ماهانه |
|---------|------|-----|-------------|
| **Vercel** | رایگان، ساده، Next.js native | محدودیت serverless | رایگان - $20 |
| **Railway** | ارزان، Docker support | پیچیده‌تر | $5 - $20 |
| **Fly.io** | ارزان، edge computing | یادگیری بیشتر | $5 - $15 |
| **DigitalOcean** | کنترل کامل | مدیریت سرور | $10 - $25 |

### انتخاب دیتابیس
| گزینه | مزیت | عیب | هزینه |
|-------|------|-----|-------|
| **Turso** (مرکزی) | رایگان، SQLite compatible | محدودیت free tier | رایگان - $10 |
| **PostgreSQL** (مرکزی) | حرفه‌ای، رایگان روی Supabase | نیاز به migration | رایگان - $25 |
| **SQLite per tenant** | ساده، ارزان | سختی مدیریت | رایگان |

### هزینه‌ها
- **Turso Free:** ۵۰۰ دیتابیس، ۹ گیگابایت storage
- **Netlify Free:** ۱۰۰ گیگابایت bandwidth
- **Vercel Free:** ۱۰۰ گیگابایت bandwidth
- **Let's Encrypt:** رایگان (SSL certificates)

---

## فایل‌های مهم برای مطالعه

```
lib/db.ts               ← لایه دیتابیس فعلی
lib/seed.ts             ← Seed data
lib/schema.sql          ← Schema اولیه
scripts/setup-db.ts     ← Setup script
app/api/                ← API Routes
app/layout.tsx          ← Root layout
app/page.tsx            ← صفحه اصلی
netlify.toml            ← Config استقرار
package.json            ← وابستگی‌ها
```

---

## سوالات مهم قبل از شروع

1. **آیا Turso برای SaaS مناسبه یا PostgreSQL بهتره؟**
2. **Vercel یا Railway یا گزینه دیگه؟**
3. **ساب‌پوشه یا ساب‌دامنه یا دامنه اختصاصی؟**
4. **هزینه ماهانه هر مشتری چقدر باشه؟**
5. **آیا نیاز به payment gateway داریم؟**
6. **آیا نیاز به multi-language support داریم؟**
7. **آیا نیاز به analytics و reporting داریم؟**

---

## خلاصه

من یک قالب آماده دارم. می‌خوام اون رو به یک پلتفرم SaaS تبدیل کنم که:
- بتونم به چندین مشتری بفروشم
- هر مشتری ساب‌دامنه یا ساب‌پوشه یا **دامنه اختصاصی** داشته باشه
- آپدیت‌ها مرکزی باشه
- مدیریت مشتری‌ها آسان باشه
- **مشتری بتونه دامنه خودش رو وصل کنه**

لطفاً بر اساس فایل‌های موجود در پروژه، یک نقشه راه دقیق و قابل اجرا بده.
