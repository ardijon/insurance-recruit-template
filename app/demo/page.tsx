import { DemoPageClient } from "./demo-client";

const DEMO_PROFILE = {
  name: "دکتر امیر حسینی",
  title: "مدیر فروش ارشد منطقه مرکز کد MGR-107",
  bio: "بیش از ۱۲ سال تجربه مدیریت تیم‌های فروش بیمه عمر و سرمایه‌گذاری. فارغ‌التحصیل MBA از دانشگاه شریف. تخصص اصلی: استراتژی‌های جذب نمایندگان حرفه‌ای و طراحی سیستم‌های انگیزشی. موفق به تشکیل تیم قوی‌ترین تیم فروش منطقه با بیش از ۶۰ نماینده فعال.",
  achievements: [
    "کسب عنوان مدیر فروش برتر کشوری سه سال متوالی (۱۴۰۱-۱۴۰۳)",
    "رشد ۲۳۰ درصدی تیم فروش طی ۳ سال",
    "بیش از ۴۰۰ بیمه‌نامه صادر شده در سال گذشته",
    "دریافت تندیس الماسی نمایندگی برتر از شرکت بیمه",
    "توسعه شبکه نمایندگی در ۸ استان کشور",
  ],
  currentAgentCount: 63,
  growthAgents: 75,
  growthPolicies: 110,
  photoUrl: "",
};

const DEMO_SUCCESS_ENTRIES = [
  { id: 1, agentName: "علی محمدی", quote: "وقتی وارد تیم دکتر حسینی شدم، فقط یک فروشنده بودم. الان بعد از ۱۸ ماه، مدیر تیم ۱۲ نفره‌ام و ماهیانه بیش از ۸۰ میلیون درآمد دارم. آموزش‌های حرفه‌ای و پشتیبانی مداوم، رمز موفقیته.", images_json: JSON.stringify(["/uploads/073356921103447fedc73c712a72a23a.png"]) },
  { id: 2, agentName: "سارا احمدی", quote: "بهترین تصمیم زندگی‌ام بود که به این تیم پیوستم. از یک معلم مدرسه به مدیر فروشی رسیدم که الان ۳۰ نماینده زیرمجموعه دارم. محیط کاری صمیمی و پر از انرژی مثبت واقعاً متفاوت است.", images_json: JSON.stringify(["/uploads/8e4c4baa2c95b706349f80e2d3f717d1.png"]) },
  { id: 3, agentName: "رضا کریمی", quote: "با صفر سابقه شروع کردم و فقط یک تلفن همراه داشتم. امروز بعد از ۲ سال، مدیر بخش هستم. مدیرم بارها دسترسی من ممکنم، حتی وقتی خودم شک داشتم.", images_json: JSON.stringify(["/uploads/cd68e7e5c0cf9761f2533b1f4e03a708.png"]) },
  { id: 4, agentName: "نیلوفر حسینی", quote: "عدم نیاز به سرمایه اولیه و آموزش‌های رایگان باعث شد بدون ریسک شروع کنم. الان تیم ۸ نفره دارم و درآمدم ۵ برابر شده." },
  { id: 5, agentName: "محمد رستمی", quote: "بعد از ۱۵ سال کار اداری، تصمیم گرفتم تغییر بدهم. این تیم بهترین بستر برای شروع بود. الان درآمدم بیشتر از حقوق بازنشستگی پدرم است." },
];

const DEMO_GROWTH_STAGES = [
  { id: 1, title: "بازاریاب", description: "دوره آموزشی جامع و آشنایی کامل با محصولات بیمه عمر، پس‌انداز و سرمایه‌گذاری. در این مرحله با اصول فروش، تکنیک‌های مذاکره و مدیریت زمان آشنا می‌شوید." },
  { id: 2, title: "نماینده فعال", description: "شروع فروش مستقل، ایجاد شبکه ارتباطی قوی و جذب مشتریان وفادار. درآمد پایدار از فروش مستقیم بیمه‌نامه‌ها آغاز می‌شود." },
  { id: 3, title: "راهنمای فروش", description: "افزایش حجم فروش، آموزش و mentorship نمایندگان تازه‌وارد. دریافت پاداش‌های ویژه برای عملکرد برتر و شروع درآمد از زیرمجموعه." },
  { id: 4, title: "مدیر فروش", description: "جذب و مدیریت تیم فروش، درآمد پایدار از زیرمجموعه و پاداش‌های ویژه. دسترسی به دوره‌های پیشرفته مدیریتی و سفرهای آموزشی." },
  { id: 5, title: "مدیر ارشد فروش", description: "هدایت چند تیم فروش، دریافت سهام شرکت و سفرهای خارجی انگیزشی. بالاترین سطح درآمدی و جایگاه سازمانی در شرکت." },
];

const DEMO_FAQ_ITEMS = [
  { id: 1, question: "آیا برای شروع کار نیاز به سابقه فروش دارم؟", answer: "خیر، اصلاً نیازی به سابقه فروش نیست. دوره‌های آموزشی جامع و رایگان برای همه نمایندگان جدید برگزار می‌شود و تا زمانی که به درآمد برسید، کنارتان هستیم." },
  { id: 2, question: "چه مدت طول می‌کشد تا نماینده شوم؟", answer: "پس از ثبت درخواست و مصاحبه حضوری، فرآیند آموزشی حدود ۱۰ روز کاری طول می‌کشد. بعد از امتحان پایان دوره، مجوز رسمی نمایندگی دریافت می‌کنید." },
  { id: 3, question: "آیا امکان همکاری پاره‌وقت وجود دارد؟", answer: "بله، همکاری به صورت تمام‌وقت و پاره‌وقت امکان‌پذیر است. بسیاری از نمایندگان ما در کنار شغل اصلی‌شان فعالیت می‌کنند." },
  { id: 4, question: "درآمد ماهیانه یک نماینده چقدر است؟", answer: "بسته به سطح فروش و تعداد بیمه‌نامه‌های صادر شده، درآمد ماهیانه از ۲۰ میلیون تومان شروع می‌شود و بدون سقف ادامه دارد. نمایندگان برتر ما ماهیانه بالای ۱۰۰ میلیون درآمد دارند." },
  { id: 5, question: "آیا نیاز به سرمایه اولیه دارم؟", answer: "خیر، هیچ سرمایه اولیه‌ای نیاز نیست. فقط کافیست وقت و انرژی بگذارید و آموزش‌ها را جدی بگیرید." },
];

const DEMO_VISUAL_STORY_IMAGES = [
  "/uploads/073356921103447fedc73c712a72a23a.png",
  "/uploads/8e4c4baa2c95b706349f80e2d3f717d1.png",
  "/uploads/cd68e7e5c0cf9761f2533b1f4e03a708.png",
  "/uploads/manager_1784865740887.png",
  "/uploads/manager_1785077723821.png",
  "/uploads/manager_1785077863714.png",
];

const DEMO_APPLICANTS = [
  { full_name: "حسین رجبی", city: "تهران", score: 95, status: "interviewed", created_at: "2024-01-15" },
  { full_name: "امیر سلطانی", city: "شیراز", score: 92, status: "hired", created_at: "2024-01-10" },
  { full_name: "زهرا کاظمی", city: "مشهد", score: 78, status: "interviewed", created_at: "2024-01-12" },
  { full_name: "مریم اکبری", city: "تبریز", score: 45, status: "contacted", created_at: "2024-01-08" },
  { full_name: "رضا حیدری", city: "تهران", score: 28, status: "new", created_at: "2024-01-20" },
  { full_name: "سارا بهرامی", city: "کرمان", score: 35, status: "rejected", created_at: "2024-01-05" },
];

export default function DemoPage() {
  return (
    <DemoPageClient
      profile={{
        name: DEMO_PROFILE.name,
        title: DEMO_PROFILE.title,
        bio: DEMO_PROFILE.bio,
        achievements: DEMO_PROFILE.achievements,
        currentAgentCount: DEMO_PROFILE.currentAgentCount,
        growthAgents: DEMO_PROFILE.growthAgents,
        growthPolicies: DEMO_PROFILE.growthPolicies,
        photoUrl: DEMO_PROFILE.photoUrl,
      }}
      successEntries={DEMO_SUCCESS_ENTRIES}
      visualStoryImages={DEMO_VISUAL_STORY_IMAGES}
      growthStages={DEMO_GROWTH_STAGES}
      faqItems={DEMO_FAQ_ITEMS}
      applicants={DEMO_APPLICANTS}
    />
  );
}
