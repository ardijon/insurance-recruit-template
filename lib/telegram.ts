export interface ApplicantNotification {
  fullName: string;
  phone: string;
  score: number | null;
  scoreBreakdown: {
    total: number;
    salesBackground: number;
    networkSize: number;
    availability: number;
  } | null;
  fitResult: {
    fitScore: number;
    maxFitScore: number;
    summary: string;
  } | null;
  referralAgentName: string | null;
}

function getBotToken(): string | undefined {
  return process.env.TELEGRAM_BOT_TOKEN;
}

function getChatId(): string | undefined {
  return process.env.TELEGRAM_CHAT_ID;
}

const TELEGRAM_API = "https://api.telegram.org";

export async function notifyManagerOnTelegram(
  applicant: ApplicantNotification
): Promise<void> {
  const token = getBotToken();
  const chatId = getChatId();

  if (!token || !chatId) {
    console.warn(
      "[telegram] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set — skipping notification"
    );
    return;
  }

  const message = buildMessage(applicant);

  const url = `${TELEGRAM_API}/bot${token}/sendMessage`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "HTML",
    }),
  });

  if (!res.ok) {
    console.error(`[telegram] failed to send message: ${res.status} (chat_id redacted)`);
  }
}

function buildMessage(applicant: ApplicantNotification): string {
  const lines: string[] = [];

  lines.push("📋 <b>درخواست نمایندگی جدید</b>");
  lines.push("");

  lines.push(`<b>نام:</b> ${escapeHtml(applicant.fullName)}`);
  lines.push(`<b>تلفن:</b> ${escapeHtml(applicant.phone)}`);

  if (applicant.referralAgentName) {
    lines.push(`<b>معرف:</b> ${escapeHtml(applicant.referralAgentName)}`);
  }

  if (applicant.score !== null) {
    const breakdown = applicant.scoreBreakdown;
    lines.push("");
    lines.push(`<b>امتیاز کل:</b> ${applicant.score}`);
    if (breakdown) {
      lines.push(`  · سابقه فروش: ${breakdown.salesBackground}/40`);
      lines.push(`  · شبکه ارتباطی: ${breakdown.networkSize}/30`);
      lines.push(`  · زمان در دسترس: ${breakdown.availability}/30`);
    }
    if (applicant.fitResult) {
      lines.push(`  · تناسب شغلی: ${applicant.fitResult.fitScore}/${applicant.fitResult.maxFitScore} (${applicant.fitResult.summary})`);
    }
  }

  return lines.join("\n");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
