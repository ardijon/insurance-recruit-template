"use client";

import { useMemo, useState, useEffect } from "react";

interface Props {
  path: string;
  size?: number;
}

export function QrCode({ path, size = 160 }: Props) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    const fullUrl = `${window.location.origin}${path}`;
    queueMicrotask(() => setUrl(fullUrl));
  }, [path]);

  const qrUrl = useMemo(
    () => url ? `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(url)}&size=${size}x${size}&format=svg&margin=8&color=111827&bgcolor=F8F9FA` : "",
    [url, size],
  );

  if (!qrUrl) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="rounded-2xl border-2 border-dashed border-border bg-bg-surface p-4 shadow-sm">
          <div className="size-[160px] animate-pulse bg-bg-base rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="rounded-2xl border-2 border-dashed border-border bg-bg-surface p-4 shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrUrl}
          alt="QR Code فرم درخواست"
          width={size}
          height={size}
          className="block"
        />
      </div>
    </div>
  );
}
