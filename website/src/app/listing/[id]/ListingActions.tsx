"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useMe } from "@/hooks/useMe";
import formStyles from "@/styles/forms.module.css";

export function ListingActions({
  listingId,
  sellerId,
  terms,
}: {
  listingId: string;
  sellerId: string;
  terms: { content: string }[];
}) {
  const { user } = useMe();
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");

  const isSeller = user?.id === sellerId;

  const canExpressInterest = useMemo(() => Boolean(user) && !isSeller, [user, isSeller]);

  async function expressInterest() {
    setError(null);
    try {
      await apiFetch(`/listings/${listingId}/interests`, {
        method: "POST",
        body: JSON.stringify({ message: msg, acceptedTerms: accepted }),
      });
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    }
  }

  async function startMessage() {
    setError(null);
    try {
      const res = await apiFetch<{ conversationId: string }>(`/conversations/start`, {
        method: "POST",
        body: JSON.stringify({
          listingId,
          initialMessage: msg || `Hi — I’m interested in this listing (${listingId}).`,
        }),
      });
      router.push(`/messages?conversationId=${encodeURIComponent(res.conversationId)}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    }
  }

  async function toggleFavorite() {
    setError(null);
    try {
      await apiFetch(`/favorites`, {
        method: "POST",
        body: JSON.stringify({ listingId }),
      });
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    }
  }

  async function submitReport() {
    setError(null);
    try {
      await apiFetch(`/reports`, {
        method: "POST",
        body: JSON.stringify({ listingId, reason: reportReason }),
      });
      setReportReason("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    }
  }

  return (
    <div className={formStyles.card}>
      <div className={formStyles.title}>Take action</div>

      {!user ? <div className={formStyles.muted}>Sign in to message, save favorites, or express interest.</div> : null}

      <div className={formStyles.actions}>
        {user ? (
          <button className={formStyles.btn} type="button" onClick={() => void toggleFavorite()}>
            Save to favorites
          </button>
        ) : null}

        {user && !isSeller ? (
          <button className={`${formStyles.btn} ${formStyles.btnSecondary}`} type="button" onClick={() => void startMessage()}>
            Message seller
          </button>
        ) : null}
      </div>

      <div className={formStyles.row}>
        <label className={formStyles.label} htmlFor="interestMsg">
          Optional message
        </label>
        <textarea
          id="interestMsg"
          className={formStyles.textarea}
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          placeholder="Introduce yourself or ask a question…"
        />
      </div>

      {terms.length > 0 ? (
        <label style={{ display: "flex", gap: 10, alignItems: "flex-start", marginTop: 10 }}>
          <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
          <span style={{ fontSize: 13, color: "var(--muted)" }}>
            I have read and accept the seller&apos;s disclosed terms and additional charges for this listing.
          </span>
        </label>
      ) : (
        <div className={formStyles.muted}>No explicit terms were added for this listing.</div>
      )}

      <div className={formStyles.actions}>
        <button
          className={formStyles.btn}
          type="button"
          disabled={!canExpressInterest || !accepted}
          onClick={() => void expressInterest()}
        >
          Express interest
        </button>
      </div>

      <div style={{ marginTop: 14 }}>
        <div className={formStyles.title} style={{ fontSize: 14 }}>
          Report this listing
        </div>
        <textarea
          className={formStyles.textarea}
          value={reportReason}
          onChange={(e) => setReportReason(e.target.value)}
          placeholder="Describe what looks wrong (min 10 characters)…"
        />
        <div className={formStyles.actions}>
          <button className={`${formStyles.btn} ${formStyles.btnSecondary}`} type="button" onClick={() => void submitReport()}>
            Submit report
          </button>
        </div>
      </div>

      {error ? <div className={formStyles.error}>{error}</div> : null}
    </div>
  );
}
