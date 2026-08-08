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
  const [profileRaw, successEntriesRaw, growthStagesRaw, faqRows, visualStoryRow] = await getCachedData();

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

  let visualStoryImages: string[] = [];
  try { visualStoryImages = JSON.parse((visualStoryRow as { images_json: string } | undefined)?.images_json ?? "[]"); } catch { visualStoryImages = []; }

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
          <VisualStory images={visualStoryImages} />
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
