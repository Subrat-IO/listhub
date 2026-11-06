"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import styles from "@/styles/admin.module.css";

export function ListingActions({
  listingId,
  status,
  featured,
}: {
  listingId: string;
  status: string;
  featured: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function patchStatus(next: "ACTIVE" | "PAUSED" | "REJECTED" | "REMOVED") {
    setError(null);
    try {
      await apiFetch(`/admin/listings/${listingId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: next }),
      });
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    }
  }

  async function patchFeatured(next: boolean) {
    setError(null);
    try {
      await apiFetch(`/admin/listings/${listingId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ featured: next }),
      });
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    }
  }

  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      <button className={styles.btn} type="button" disabled={status === "ACTIVE"} onClick={() => void patchStatus("ACTIVE")}>
        Active
      </button>
      <button className={`${styles.btn} ${styles.btnSecondary}`} type="button" onClick={() => void patchStatus("PAUSED")}>
        Pause
      </button>
      <button className={`${styles.btn} ${styles.btnSecondary}`} type="button" onClick={() => void patchStatus("REJECTED")}>
        Reject
      </button>
      <button className={`${styles.btn} ${styles.btnSecondary}`} type="button" onClick={() => void patchFeatured(!featured)}>
        {featured ? "Unfeature" : "Feature"}
      </button>
      {error ? <span style={{ color: "var(--danger)", fontSize: 12 }}>{error}</span> : null}
    </div>
  );
}
