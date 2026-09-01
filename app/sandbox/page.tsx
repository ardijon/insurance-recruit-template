import { redirect } from "next/navigation";

// /sandbox (دموی کاربردی مستقل) به‌عنوان گام ۴ تور /demo ادغام شد.
export default function SandboxPage() {
  redirect("/demo#try");
}
