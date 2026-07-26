import { ShieldIcon } from "@/components/icons";

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-8 text-center text-sm text-text-secondary md:flex-row md:justify-between">
        <div className="flex items-center gap-2">
          <ShieldIcon className="size-4 text-accent" />
          <span>سایت اختصاصی مدیر فروش بیمه عمر</span>
        </div>
        <p>تمامی حقوق محفوظ است &copy; {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}
