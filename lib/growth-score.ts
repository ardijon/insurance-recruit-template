export function toPersianNumbers(num: number): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (d) => persianDigits[parseInt(d)]);
}

export interface GrowthScoreInput {
  position_start_date: string;
  current_agent_count: number;
  growth_agents_6m: number | null;
  growth_agents_1y: number | null;
  growth_agents_2y: number | null;
  growth_policies_6m: number | null;
  growth_policies_1y: number | null;
  growth_policies_2y: number | null;
}

export interface GrowthScoreResult {
  total: number;
  tenure: number;
  agents: number;
  agentGrowth: number;
  policyGrowth: number;
  grade: string;
  gradeColor: string;
  summary: string;
}

function monthsSince(dateStr: string): number {
  if (!dateStr) return 0;
  const parts = dateStr.split("/").map(Number);
  if (parts.length < 3) return 0;
  const [y, m, d] = parts;
  const start = new Date(y > 1500 ? y - 621 : y + 621, m - 1, d);
  const now = new Date();
  return (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
}

function pickBest(
  v6m: number | null,
  v1y: number | null,
  v2y: number | null,
): number | null {
  if (v1y != null) return v1y;
  if (v6m != null) return v6m;
  if (v2y != null) return v2y;
  return null;
}

function tenureScore(months: number): number {
  if (months < 3) return 5;
  if (months < 6) return 10;
  if (months < 12) return 15;
  if (months < 24) return 20;
  if (months < 36) return 22;
  return 25;
}

function agentCountScore(count: number): number {
  if (count === 0) return 0;
  if (count <= 3) return 5;
  if (count <= 10) return 10;
  if (count <= 25) return 15;
  if (count <= 50) return 20;
  return 25;
}

function growthPercentScore(pct: number | null): number {
  if (pct == null || pct < 0) return 0;
  if (pct <= 10) return 5;
  if (pct <= 25) return 10;
  if (pct <= 50) return 15;
  if (pct <= 100) return 20;
  return 25;
}

function gradeFromScore(score: number): { grade: string; color: string; summary: string } {
  if (score >= 85) return { grade: "عالی", color: "text-green-600", summary: "عملکرد عالی" };
  if (score >= 70) return { grade: "بسیار خوب", color: "text-green-600", summary: "عملکرد بسیار خوب" };
  if (score >= 55) return { grade: "خوب", color: "text-accent", summary: "عملکرد خوب" };
  if (score >= 40) return { grade: "متوسط", color: "text-accent", summary: "عملکرد متوسط" };
  if (score >= 25) return { grade: "نیاز به بهبود", color: "text-orange-500", summary: "نیاز به بهبود" };
  return { grade: "ضعیف", color: "text-red-500", summary: "ضعیف" };
}

export function calculateGrowthScore(input: GrowthScoreInput): GrowthScoreResult {
  const months = monthsSince(input.position_start_date);
  const bestAgentGrowth = pickBest(input.growth_agents_6m, input.growth_agents_1y, input.growth_agents_2y);
  const bestPolicyGrowth = pickBest(input.growth_policies_6m, input.growth_policies_1y, input.growth_policies_2y);

  const tenure = tenureScore(months);
  const agents = agentCountScore(input.current_agent_count);
  const agentGrowth = growthPercentScore(bestAgentGrowth);
  const policyGrowth = growthPercentScore(bestPolicyGrowth);
  const total = tenure + agents + agentGrowth + policyGrowth;
  const { grade, color, summary } = gradeFromScore(total);

  return { total, tenure, agents, agentGrowth, policyGrowth, grade, gradeColor: color, summary };
}
