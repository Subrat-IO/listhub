"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import formStyles from "@/styles/forms.module.css";

export function SellerInterestActions({
  listingId,
  interestId,
  status,
}: {
  listingId: string;
  interestId: string;
  status: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function patch(next: "ACCEPTED" | "DECLINED") {
    setError(null);
    try {
      await apiFetch(`/listings/${listingId}/interests/${interestId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: next }),
      });
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    }
  }

  if (status !== "PENDING") {
    return <div style={{ marginTop: 6, fontSize: 12, color: "var(--muted)" }}>No further action available.</div>;
  }

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button className={formStyles.btn} type="button" onClick={() => void patch("ACCEPTED")}>
          Accept buyer
        </button>
        <button className={`${formStyles.btn} ${formStyles.btnSecondary}`} type="button" onClick={() => void patch("DECLINED")}>
          Decline
        </button>
      </div>
      {error ? <div className={formStyles.error}>{error}</div> : null}
    </div>
  );
}
