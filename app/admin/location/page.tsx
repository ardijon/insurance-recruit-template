"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/api-client";

function parseCoords(input: string): { lat: number; lng: number } | null {
  if (!input) return null;
  const decoded = (() => {
    try { return decodeURIComponent(input); } catch { return input; }
  })();
  // Google Maps: !3dLAT!4dLNG (place marker format)
  let m = decoded.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  if (m) return { lat: Number(m[1]), lng: Number(m[2]) };
  // Google Maps: @LAT,LNG zoom
  m = decoded.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (m) return { lat: Number(m[1]), lng: Number(m[2]) };
  // Google Maps: ?q=LAT,LNG
  m = decoded.match(/[?&]q=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (m) return { lat: Number(m[1]), lng: Number(m[2]) };
  // Plain "LAT,LNG"
  m = decoded.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
  if (m) return { lat: Number(m[1]), lng: Number(m[2]) };
  return null;
}

function isValidLat(v: number): boolean { return Number.isFinite(v) && v >= -90 && v <= 90; }
function isValidLng(v: number): boolean { return Number.isFinite(v) && v >= -180 && v <= 180; }

export default function LocationPage() {
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [address, setAddress] = useState("");
  const [mapUrl, setMapUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminFetch("/api/admin/location")
      .then((r) => r.json())
      .then((data) => {
        setLat(data.MAP_LAT ?? "");
        setLng(data.MAP_LNG ?? "");
        setAddress(data.MAP_ADDRESS ?? "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const latNum = Number(lat);
  const lngNum = Number(lng);
  const hasValidCoords = lat !== "" && lng !== "" && isValidLat(latNum) && isValidLng(lngNum);

  const embedSrc = hasValidCoords
    ? `https://maps.google.com/maps?q=${latNum},${lngNum}&z=16&hl=fa&output=embed`
    : "";
  const parsedPreview = mapUrl ? parseCoords(mapUrl) : null;
  const previewSrc =
    parsedPreview && isValidLat(parsedPreview.lat) && isValidLng(parsedPreview.lng)
      ? `https://maps.google.com/maps?q=${parsedPreview.lat},${parsedPreview.lng}&z=16&hl=fa&output=embed`
      : embedSrc;

  function applyParsed() {
    setError(null);
    const parsed = parseCoords(mapUrl);
    if (!parsed) {
      setError("لینک یا مختصات وارد شده قابل خواندن نیست");
      return;
    }
    if (!isValidLat(parsed.lat) || !isValidLng(parsed.lng)) {
      setError("مختصات خارج از محدوده مجاز است");
      return;
    }
    setLat(String(parsed.lat));
    setLng(String(parsed.lng));
    setMapUrl("");
  }

  function useCurrentLocation() {
    setError(null);
    if (!navigator.geolocation) {
      setError("مرورگر شما از موقعیت‌یابی پشتیبانی نمی‌کند");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
      },
      () => setError("دسترسی به موقعیت مکانی رد شد"),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await adminFetch("/api/admin/location", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: hasValidCoords ? latNum : null,
          lng: hasValidCoords ? lngNum : null,
          address,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "خطا در ذخیره موقعیت مکانی");
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("خطا در اتصال به سرور");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="size-8 animate-spin rounded-full border-2 border-brand-cta border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-text-primary mb-2">موقعیت مکانی</h1>
      <p className="text-sm text-text-secondary mb-6">
        محل فعالیت خود را مشخص کنید تا در صفحه اصلی سایت روی نقشه گوگل نمایش داده شود.
      </p>

      {/* Google Maps URL / coords paste */}
      <div className="rounded-2xl border border-border bg-bg-surface p-5 space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            درج از لینک گوگل مپ یا مختصات
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={mapUrl}
              onChange={(e) => setMapUrl(e.target.value)}
              placeholder="https://maps.google.com/... یا 35.6892,51.3890"
              className="flex-1 rounded-xl border border-border bg-bg-base px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/70 focus:border-brand-cta focus:outline-none focus:ring-1 focus:ring-brand-cta/30 ltr text-left"
              dir="ltr"
            />
            <button
              type="button"
              onClick={applyParsed}
              disabled={!mapUrl.trim()}
              className="rounded-xl border border-border px-4 text-sm font-medium text-text-primary transition-colors hover:bg-bg-base disabled:opacity-50 shrink-0"
            >
              اعمال
            </button>
          </div>
          <p className="mt-1 text-[11px] text-text-secondary">
            در گوگل مپ روی مکان مورد نظر راست‌کلیک کنید و مختصات را کپی کنید، یا لینک اشتراک‌گذاری را بچسبانید.
          </p>
        </div>

        <button
          type="button"
          onClick={useCurrentLocation}
          className="flex items-center gap-2 text-sm font-medium text-brand-cta transition-opacity hover:opacity-80"
        >
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="3" />
            <line x1="12" y1="2" x2="12" y2="5" />
            <line x1="12" y1="19" x2="12" y2="22" />
            <line x1="2" y1="12" x2="5" y2="12" />
            <line x1="19" y1="12" x2="22" y2="12" />
          </svg>
          استفاده از موقعیت فعلی من
        </button>
      </div>

      {/* Manual inputs */}
      <div className="rounded-2xl border border-border bg-bg-surface p-5 space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">عرض جغرافیایی (Lat)</label>
            <input
              type="text"
              value={lat}
              onChange={(e) => { setLat(e.target.value); setSaved(false); }}
              placeholder="35.6892"
              className="w-full rounded-xl border border-border bg-bg-base px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/70 focus:border-brand-cta focus:outline-none focus:ring-1 focus:ring-brand-cta/30 ltr text-left"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">طول جغرافیایی (Lng)</label>
            <input
              type="text"
              value={lng}
              onChange={(e) => { setLng(e.target.value); setSaved(false); }}
              placeholder="51.3890"
              className="w-full rounded-xl border border-border bg-bg-base px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/70 focus:border-brand-cta focus:outline-none focus:ring-1 focus:ring-brand-cta/30 ltr text-left"
              dir="ltr"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">آدرس متنی (اختیاری)</label>
          <input
            type="text"
            value={address}
            onChange={(e) => { setAddress(e.target.value); setSaved(false); }}
            placeholder="تهران، خیابان ولیعصر، پلاک ۱۲۰"
            className="w-full rounded-xl border border-border bg-bg-base px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/70 focus:border-brand-cta focus:outline-none focus:ring-1 focus:ring-brand-cta/30"
          />
        </div>
      </div>

      {/* Live preview */}
      {previewSrc && (
        <div className="mb-6">
          <p className="text-sm font-medium text-text-primary mb-2">پیش‌نمایش نقشه</p>
          <div className="overflow-hidden rounded-2xl border border-border">
            <iframe
              key={previewSrc}
              src={previewSrc}
              title="پیش‌نمایش موقعیت"
              className="h-72 w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || (!!lat || !!lng) && !hasValidCoords}
          className="flex-1 rounded-xl bg-brand-cta px-4 py-3 text-sm font-medium text-cta-contrast transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "در حال ذخیره..." : saved ? "ذخیره شد ✓" : "ذخیره موقعیت"}
        </button>
        {(lat || lng || address) && (
          <button
            type="button"
            onClick={() => { setLat(""); setLng(""); setAddress(""); setSaved(false); }}
            className="rounded-xl border border-border px-4 py-3 text-sm font-medium text-text-primary transition-colors hover:bg-bg-surface"
          >
            پاک کردن
          </button>
        )}
      </div>
    </div>
  );
}
