"use client";

// hooks/use-referral.ts
//
// Parses ?ref= from the URL and looks up the referrer name via the API.
// Returns the code and agent name so the button/label can be rendered.

import { useEffect, useState } from "react";

export function useReferral() {
  const [referralCode, setReferralCode] = useState("");
  const [referralAgentName, setReferralAgentName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (!ref) {
      queueMicrotask(() => setLoading(false));
      return;
    }
    fetch(`/api/referrals/${encodeURIComponent(ref)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        // Only keep codes that actually exist — otherwise the applicant
        // would be stored with a junk code nobody can trace back.
        if (data?.agentName) {
          setReferralCode(ref);
          setReferralAgentName(data.agentName);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { referralCode, referralAgentName, referralLoading: loading } as const;
}
