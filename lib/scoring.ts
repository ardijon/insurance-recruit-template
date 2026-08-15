// Structured, weighted applicant scoring.
//
// All inputs come from explicit structured answers in the application form
// (no free-text parsing, which was previously gameable). The total is
// hard-capped at 100.
//
// Weighting (sums to 100):
//   sales_experience 20   (0..4)
//   sales_result     20   (0..4)
//   leadership       10   (0..4)
//   network_size     15   (0..4)
//   availability     15   (0..4)
//   motivation       10   (0..4)  — derived from text length/quality
//   fit              20   (0..20, carried from fit-assessment)

export interface ScoringInput {
  sales_experience: number; // 0..4
  sales_result: number; // 0..4
  leadership: number; // 0..4
  network_size: number; // 0..4
  availability: number; // 0..4
  motivation: number; // 0..4 (derived)
  fitScore: number; // 0..20
}

export interface ScoreBreakdown {
  total: number; // capped at 100
  salesBackground: number; // 0..40 (experience + result)
  networkSize: number; // 0..15
  availability: number; // 0..15
  motivation: number; // 0..10
  fit: number; // 0..20
}

const W = {
  sales_experience: 20,
  sales_result: 20,
  leadership: 10,
  network_size: 15,
  availability: 15,
  motivation: 10,
};

// Each structured field is on a 0..4 scale.
function scale(value: number, maxTo: number): number {
  const clamped = Math.max(0, Math.min(4, value));
  return Math.round((clamped / 4) * maxTo);
}

export function computeBreakdown(input: ScoringInput): ScoreBreakdown {
  const salesBackground = Math.min(
    40,
    scale(input.sales_experience, W.sales_experience) + scale(input.sales_result, W.sales_result) + scale(input.leadership, W.leadership)
  );
  const networkSize = scale(input.network_size, W.network_size);
  const availability = scale(input.availability, W.availability);
  const motivation = scale(input.motivation, W.motivation);

  const raw = salesBackground + networkSize + availability + motivation + input.fitScore;
  return {
    total: Math.min(100, raw),
    salesBackground,
    networkSize,
    availability,
    motivation,
    fit: input.fitScore,
  };
}

// Derive a 0..4 motivation score from the free-text answer length/quality.
export function deriveMotivationScore(text: string | null | undefined): number {
  const t = (text ?? "").trim();
  if (!t) return 0;
  const len = t.length;
  if (len >= 300) return 4;
  if (len >= 150) return 3;
  if (len >= 60) return 2;
  return 1;
}
