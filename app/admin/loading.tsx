export default function AdminLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="size-10 animate-spin rounded-full border-2 border-brand-cta border-t-transparent" />
      <p className="mt-4 text-sm text-text-secondary">در حال بارگذاری...</p>
    </div>
  );
}
