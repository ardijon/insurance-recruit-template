import { redirect } from "next/navigation";

// /walkthrough (تور قدیمی) با /demo ادغام شد — تور تک‌صفحه‌ای جایگزین همه است.
export default function WalkthroughPage() {
  redirect("/demo");
}
