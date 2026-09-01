import type { Metadata } from "next";
import { DemoPageClient } from "./demo-client";

// دمو ابزار فروش است، نه صفحه عمومی: ایندکس گوگل لازم نیست و حتی مضر است
// (رقبا راحت تحلیلش می‌کنند). OG card برای پیش‌نمایش لینک در تلگرام/واتساپ مهم است.
export const metadata: Metadata = {
  title: "دموی تعاملی — سیستم جذب نماینده بیمه عمر",
  description:
    "تور تعاملی محصول: پروفایل مدیر، دیوار موفقیت، مسیر رشد، فرم هوشمند با امتیازدهی خودکار و پنل مدیریت",
  robots: { index: false, follow: false },
  openGraph: {
    title: "دموی تعاملی — سیستم جذب نماینده بیمه عمر",
    description:
      "همین حالا ببینید: سایت اختصاصی مدیر + غربالگری هوشمند متقاضیان با امتیاز خودکار",
    type: "website",
    locale: "fa_IR",
  },
};

const DEMO_PROFILE = {
  currentAgentCount: 63,
  growthAgents: 75,
  growthPolicies: 110,
};

const DEMO_APPLICANT_COUNT = 6;

export default function DemoPage() {
  return (
    <DemoPageClient
      stats={{
        currentAgentCount: DEMO_PROFILE.currentAgentCount,
        growthAgents: DEMO_PROFILE.growthAgents,
        growthPolicies: DEMO_PROFILE.growthPolicies,
        applicantsCount: DEMO_APPLICANT_COUNT,
      }}
    />
  );
}
