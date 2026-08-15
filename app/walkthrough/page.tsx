import { selectOne, selectAll, ensureSchema } from "@/lib/db";
import { unstable_cache } from "next/cache";
import { WalkthroughClient } from "./walkthrough-client";

const getCachedData = unstable_cache(
  async () => {
    await ensureSchema();
    return Promise.all([
      selectOne("SELECT * FROM manager_profile WHERE id = 1"),
      selectAll("SELECT id, agent_name as agentName, quote, images_json FROM success_wall_entries WHERE permission_granted = 1 ORDER BY sort_order"),
      selectAll("SELECT id, title, description FROM growth_path_stages ORDER BY sort_order"),
      selectAll("SELECT id, question, answer FROM faq_items ORDER BY sort_order"),
    ]);
  },
  ["walkthrough-data"],
  { revalidate: 60 }
);

export default async function WalkthroughPage() {
  const [profileRaw, successRaw, growthRaw, faqRaw] = await getCachedData();

  const p = profileRaw as Record<string, unknown> | undefined;
  const profile = {
    name: String(p?.name ?? ""),
    title: String(p?.title ?? ""),
    positionCode: String(p?.position_code ?? ""),
    positionStartDate: String(p?.position_start_date ?? ""),
    bio: String(p?.bio ?? ""),
    achievements: (() => { try { return JSON.parse(String(p?.achievements ?? "[]")) as string[]; } catch { return [] as string[]; } })(),
    currentAgentCount: Number(p?.current_agent_count ?? 0),
    growthAgents6m: p?.growth_agents_6m != null ? Number(p.growth_agents_6m) : null,
    growthAgents1y: p?.growth_agents_1y != null ? Number(p.growth_agents_1y) : null,
    growthAgents2y: p?.growth_agents_2y != null ? Number(p.growth_agents_2y) : null,
    growthPolicies6m: p?.growth_policies_6m != null ? Number(p.growth_policies_6m) : null,
    growthPolicies1y: p?.growth_policies_1y != null ? Number(p.growth_policies_1y) : null,
    growthPolicies2y: p?.growth_policies_2y != null ? Number(p.growth_policies_2y) : null,
    photoUrl: String(p?.photo_url ?? ""),
  };

  const successEntries = successRaw.map(r => ({
    id: Number(r.id), agentName: String(r.agentName), quote: String(r.quote),
    images_json: String(r.images_json ?? "[]"),
  }));

  const growthStages = growthRaw.map(r => ({
    id: Number(r.id), title: String(r.title), description: String(r.description),
  }));

  const faqItems = faqRaw.map(r => ({
    id: Number(r.id), question: String(r.question), answer: String(r.answer),
  }));

  return (
    <WalkthroughClient
      profile={profile}
      successEntries={successEntries}
      growthStages={growthStages}
      faqItems={faqItems}
    />
  );
}
