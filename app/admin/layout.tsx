"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AdminNav } from "@/components/admin-nav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";
  const [checking, setChecking] = useState(!isLoginPage);
  const router = useRouter();

  useEffect(() => {
    if (isLoginPage) return;

    fetch("/api/admin/verify")
      .then((res) => {
        if (!res.ok) router.push("/admin/login");
      })
      .catch(() => router.push("/admin/login"))
      .finally(() => setChecking(false));
  }, [isLoginPage, router]);

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-bg-base">
        <div className="size-8 animate-spin rounded-full border-2 border-brand-cta border-t-transparent" />
      </main>
    );
  }

  if (isLoginPage) return <>{children}</>;

  return (
    <div className="min-h-screen bg-bg-base">
      <AdminNav />
      <main className="mx-auto max-w-6xl px-4 py-6 pb-24 md:pb-6">
        {children}
      </main>
    </div>
  );
}
