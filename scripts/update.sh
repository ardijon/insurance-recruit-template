#!/usr/bin/env bash
# scripts/update.sh — لایه ۳ مرکز به‌روزرسانی (سرور شخصی/VPS)
#
# اجرا روی سرور خریدار:  bash scripts/update.sh
# پیش‌نیاز: git (کلید دسترسی به ریپوی خصوصی), node >= 20, npm
# دیتابیس (data/) و فایل‌های آپلود دست‌نخورده می‌مانند؛ مایگریشن
# اسکیما هنگام بوت بعدی به‌صورت خودکار اجرا می‌شود (lib/db.ts).
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> دریافت آخرین نسخه از مخزن..."
git fetch origin --tags --force
LATEST_TAG=$(git describe --tags "$(git rev-list --tags --max-count=1)" 2>/dev/null || true)

if [ -z "$LATEST_TAG" ]; then
  echo "هیچ تگی پیدا نشد — به‌جای تگ از شاخه اصلی به‌روزرسانی می‌شود"
  git pull --ff-only origin main
else
  CURRENT=$(git describe --tags --always 2>/dev/null || echo "none")
  echo "==> نسخه فعلی: $CURRENT — نسخه مقصد: $LATEST_TAG"
  if [ "$CURRENT" = "$LATEST_TAG" ]; then
    echo "همه‌چیز به‌روز است."
    exit 0
  fi
  echo "==> پشتیبان‌گیری از data/ ..."
  [ -d data ] && cp -r data "data-backup-$(date +%Y%m%d-%H%M%S)"
  git checkout "$LATEST_TAG"
fi

echo "==> نصب وابستگی‌ها..."
npm ci

echo "==> build..."
npm run build

echo "==> راه‌اندازی مجدد..."
if command -v pm2 >/dev/null 2>&1; then
  pm2 restart all
else
  echo "pm2 پیدا نشد — سرویس خود را دستی ری‌استارت کنید (systemd/docker/...)"
fi

echo "✔ به‌روزرسانی کامل شد."
