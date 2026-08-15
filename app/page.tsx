import { selectOne, selectAll, ensureSchema } from "@/lib/db";
import { Header } from "@/components/header";
import { AnimateOnShow } from "@/components/animate-on-show";
import { Footer } from "@/components/footer";
import { ManagerProfile, type GrowthStat } from "@/components/manager-profile";
import { SuccessWall, type SuccessWallEntry } from "@/components/success-wall";
import { GrowthPath, type GrowthPathStage } from "@/components/growth-path";
import { FaqSection, type FaqItem } from "@/components/faq-section";
import { VisualStory } from "@/components/visual-story";
import { unstable_cache } from "next/cache";

function isDemoMode(): boolean {
  return process.env.DEMO_MODE === "true";
}

// Demo data for when database is not available (e.g. Netlify serverless)
const DEMO_DATA = {
  profile: {
    name: "دکتر امیر حسینی",
    title: "مدیر فروش ارشد منطقه مرکز کد MGR-107",
    position_code: "MGR-107",
    position_start_date: "1400/06/01",
    bio: "بیش از ۱۲ سال تجربه مدیریت تیم‌های فروش بیمه عمر و سرمایه‌گذاری. فارغ‌التحصیل MBA از دانشگاه شریف. تخصص اصلی: استراتژی‌های جذب نمایندگان حرفه‌ای و طراحی سیستم‌های انگیزشی.",
    achievements: JSON.stringify([
      "کسب عنوان مدیر فروش برتر کشوری سه سال متوالی",
      "رشد ۲۳۰ درصدی تیم فروش طی ۳ سال",
      "بیش از ۴۰۰ بیمه‌نامه صادر شده در سال گذشته",
      "دریافت تندیس الماسی نمایندگی برتر",
      "توسعه شبکه نمایندگی در ۸ استان کشور",
    ]),
    current_agent_count: 63,
    growth_agents_6m: 75,
    growth_agents_1y: 230,
    growth_agents_2y: null,
    growth_policies_6m: 110,
    growth_policies_1y: 180,
    growth_policies_2y: null,
    photo_url: "",
    site_theme: "warm",
  },
  successEntries: [
    { id: 1, agentName: "علی محمدی", quote: "وقتی وارد تیم دکتر حسینی شدم، فقط یک فروشنده بودم. الان بعد از ۱۸ ماه، مدیر تیم ۱۲ نفره‌ام و ماهیانه بیش از ۸۰ میلیون درآمد دارم.", images_json: "[]" },
    { id: 2, agentName: "سارا احمدی", quote: "بهترین تصمیم زندگی‌ام بود که به این تیم پیوستم. از یک معلم مدرسه به مدیر فروشی رسیدم که الان ۳۰ نماینده زیرمجموعه دارم.", images_json: "[]" },
    { id: 3, agentName: "رضا کریمی", quote: "با صفر سابقه شروع کردم و فقط یک تلفن همراه داشتم. امروز بعد از ۲ سال، مدیر بخش هستم.", images_json: "[]" },
    { id: 4, agentName: "نیلوفر حسینی", quote: "عدم نیاز به سرمایه اولیه و آموزش‌های رایگان باعث شد بدون ریسک شروع کنم. الان تیم ۸ نفره دارم.", images_json: "[]" },
    { id: 5, agentName: "محمد رستمی", quote: "بعد از ۱۵ سال کار اداری، تصمیم گرفتم تغییر بدهم. این تیم بهترین بستر برای شروع بود.", images_json: "[]" },
  ],
  growthStages: [
    { id: 1, title: "بازاریاب", description: "دوره آموزشی جامع و آشنایی کامل با محصولات بیمه عمر، پس‌انداز و سرمایه‌گذاری." },
    { id: 2, title: "نماینده فعال", description: "شروع فروش مستقل، ایجاد شبکه ارتباطی قوی و جذب مشتریان وفادار." },
    { id: 3, title: "راهنمای فروش", description: "افزایش حجم فروش، آموزش و mentorship نمایندگان تازه‌وارد." },
    { id: 4, title: "مدیر فروش", description: "جذب و مدیریت تیم فروش، درآمد پایدار از زیرمجموعه." },
    { id: 5, title: "مدیر ارشد فروش", description: "هدایت چند تیم فروش، دریافت سهام شرکت و سفرهای خارجی." },
  ],
  faqItems: [
    { id: 1, question: "آیا برای شروع کار نیاز به سابقه فروش دارم؟", answer: "خیر، اصلاً نیازی به سابقه فروش نیست. دوره‌های آموزشی جامع و رایگان برای همه نمایندگان جدید برگزار می‌شود." },
    { id: 2, question: "چه مدت طول می‌کشد تا نماینده شوم؟", answer: "پس از ثبت درخواست و مصاحبه حضوری، فرآیند آموزشی حدود ۱۰ روز کاری طول می‌کشد." },
    { id: 3, question: "آیا امکان همکاری پاره‌وقت وجود دارد؟", answer: "بله، همکاری به صورت تمام‌وقت و پاره‌وقت امکان‌پذیر است." },
    { id: 4, question: "درآمد ماهیانه یک نماینده چقدر است؟", answer: "بسته به سطح فروش، درآمد ماهیانه از ۲۰ میلیون تومان شروع می‌شود و بدون سقف ادامه دارد." },
    { id: 5, question: "آیا نیاز به سرمایه اولیه دارم؟", answer: "خیر، هیچ سرمایه اولیه‌ای نیاز نیست." },
  ],
  visualStoryImages: [] as string[],
};

const getCachedData = unstable_cache(
  async () => {
    await ensureSchema();
    return Promise.all([
      selectOne("SELECT * FROM manager_profile WHERE id = 1"),
      selectAll("SELECT id, agent_name as agentName, quote, images_json FROM success_wall_entries WHERE permission_granted = 1 ORDER BY sort_order"),
      selectAll("SELECT id, title, description FROM growth_path_stages ORDER BY sort_order"),
      selectAll("SELECT id, question, answer FROM faq_items ORDER BY sort_order"),
      selectOne("SELECT images_json FROM success_visual_story WHERE id = 1"),
    ]);
  },
  ["home-page-data"],
  { revalidate: 60, tags: ["home"] }
);

export default async function HomePage() {
  const demo = isDemoMode();

  let profileRaw: Record<string, unknown> | undefined;
  let successEntriesRaw: Record<string, unknown>[] = [];
  let growthStagesRaw: Record<string, unknown>[] = [];
  let faqRows: Record<string, unknown>[] = [];
  let visualStoryImages: string[] = [];

  if (demo) {
    // Use hardcoded demo data — no database needed
    profileRaw = DEMO_DATA.profile;
    successEntriesRaw = DEMO_DATA.successEntries;
    growthStagesRaw = DEMO_DATA.growthStages;
    faqRows = DEMO_DATA.faqItems;
    visualStoryImages = DEMO_DATA.visualStoryImages;
  } else {
    // Production: fetch from database
    const [profileResult, successResult, growthResult, faqResult, visualResult] = await getCachedData();
    profileRaw = profileResult as Record<string, unknown> | undefined;
    successEntriesRaw = successResult;
    growthStagesRaw = growthResult;
    faqRows = faqResult;
    try { visualStoryImages = JSON.parse((visualResult as { images_json: string } | undefined)?.images_json ?? "[]"); } catch { visualStoryImages = []; }
  }

  const profile = profileRaw as
    | {
        name: string;
        title: string;
        position_code: string;
        position_start_date: string;
        bio: string;
        achievements: string;
        current_agent_count: number;
        growth_agents_6m: number | null;
        growth_agents_1y: number | null;
        growth_agents_2y: number | null;
        growth_policies_6m: number | null;
        growth_policies_1y: number | null;
        growth_policies_2y: number | null;
        photo_url: string;
      }
    | undefined;

  const successEntries: SuccessWallEntry[] = successEntriesRaw.map((row) => ({
    id: Number(row.id),
    agentName: String(row.agentName),
    quote: String(row.quote),
    images_json: String(row.images_json ?? "[]"),
  }));

  const growthStages: GrowthPathStage[] = growthStagesRaw.map((r) => ({
    id: Number(r.id),
    title: String(r.title),
    description: String(r.description),
  }));

  const faqItems: FaqItem[] = faqRows.map(
    (r) => ({ id: Number(r.id), question: String(r.question), answer: String(r.answer) })
  );

  let visualStoryImagesFinal: string[] = visualStoryImages;

  const growthStats: GrowthStat[] = [];
  if (profile?.growth_agents_6m != null) growthStats.push({ value: profile.growth_agents_6m, label: "نمایندگان", period: "شش ماه" });
  if (profile?.growth_agents_1y != null) growthStats.push({ value: profile.growth_agents_1y, label: "نمایندگان", period: "یک سال" });
  if (profile?.growth_agents_2y != null) growthStats.push({ value: profile.growth_agents_2y, label: "نمایندگان", period: "دو سال" });
  if (profile?.growth_policies_6m != null) growthStats.push({ value: profile.growth_policies_6m, label: "بیمه‌نامه", period: "شش ماه" });
  if (profile?.growth_policies_1y != null) growthStats.push({ value: profile.growth_policies_1y, label: "بیمه‌نامه", period: "یک سال" });
  if (profile?.growth_policies_2y != null) growthStats.push({ value: profile.growth_policies_2y, label: "بیمه‌نامه", period: "دو سال" });

  let achievementsList: string[] = [];
  if (profile?.achievements) {
    try {
      const parsed = JSON.parse(profile.achievements);
      if (Array.isArray(parsed)) achievementsList = parsed;
      else if (typeof parsed === "string") achievementsList = [parsed];
    } catch {
      achievementsList = [profile.achievements];
    }
  }

  return (
    <>
      <Header />
      <main>
        <AnimateOnShow>
          <ManagerProfile
            name={profile?.name ?? ""}
            title={profile?.title ?? ""}
            positionCode={profile?.position_code ?? ""}
            positionStartDate={profile?.position_start_date ?? ""}
            bio={profile?.bio ?? ""}
            achievements={achievementsList}
            currentAgentCount={profile?.current_agent_count ?? 0}
            growthStats={growthStats}
            photoUrl={profile?.photo_url ?? ""}
          />
        </AnimateOnShow>

        <AnimateOnShow>
          <SuccessWall entries={successEntries} />
        </AnimateOnShow>

        <AnimateOnShow>
          <VisualStory images={visualStoryImagesFinal} />
        </AnimateOnShow>

        <AnimateOnShow>
          <GrowthPath stages={growthStages} />
        </AnimateOnShow>

        <AnimateOnShow>
          <FaqSection items={faqItems} />
        </AnimateOnShow>
      </main>
      <Footer />
    </>
  );
}
