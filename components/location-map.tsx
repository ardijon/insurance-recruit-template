"use client";

import { useEffect, useState } from "react";

interface LocationData {
  lat: string;
  lng: string;
  address: string;
}

export function LocationMap() {
  const [location, setLocation] = useState<LocationData | null>(null);

  useEffect(() => {
    fetch("/api/location")
      .then((r) => r.json())
      .then((data: LocationData) => {
        if (data.lat && data.lng) setLocation(data);
      })
      .catch(() => {});
  }, []);

  if (!location) return null;

  const lat = Number(location.lat);
  const lng = Number(location.lng);
  const embedSrc = `https://maps.google.com/maps?q=${lat},${lng}&z=16&hl=fa&output=embed`;

  // گزینه‌های مسیریابی — روی موبایل، لینک‌های وبِ این سرویس‌ها به‌صورت
  // universal link اپ نصب‌شده را باز می‌کنند.
  const navOptions = [
    {
      label: "نشان",
      url: `https://neshan.org/maps/@${lat},${lng},17z`,
    },
    {
      label: "بلد",
      url: `https://balad.ir/location?latitude=${lat}&longitude=${lng}&zoom=17`,
    },
    {
      label: "مسیریابی در گوگل مپ",
      url: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
    },
  ];

  return (
    <section id="location" aria-labelledby="location-heading" className="px-4 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h2 id="location-heading" className="text-2xl font-bold text-brand-emphasis md:text-3xl">
            محل فعالیت ما
          </h2>
          {location.address && (
            <p className="mx-auto mt-3 max-w-xl text-text-secondary">
              {location.address}
            </p>
          )}
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-bg-surface shadow-sm">
          <iframe
            src={embedSrc}
            title="نقشه محل فعالیت"
            className="h-80 w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="border-t border-border p-4">
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <svg className="size-4 shrink-0 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span dir="ltr" className="text-xs">
                {lat.toFixed(4)}, {lng.toFixed(4)}
              </span>
            </div>
            <p className="mt-3 mb-2 text-xs font-medium text-text-secondary">مسیریابی با:</p>
            <div className="flex flex-wrap items-center gap-2">
              {navOptions.map((opt) => (
                <a
                  key={opt.label}
                  href={opt.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium no-underline transition-opacity hover:opacity-90 ${
                    opt.label.startsWith("مسیریابی")
                      ? "bg-brand-cta text-cta-contrast"
                      : "border border-border bg-bg-base text-text-primary"
                  }`}
                >
                  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="3 11 22 2 13 21 11 13 3 11" />
                  </svg>
                  {opt.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
