"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import styles from "@/styles/admin.module.css";

export function ReportActions({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function patchStatus(status: "REVIEWING" | "RESOLVED" | "DISMISSED") {
    setError(null);
    try {
      await apiFetch(`/admin/reports/${reportId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    }
  }

  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      <button className={styles.btn} type="button" onClick={() => void patchStatus("REVIEWING")}>
        Review
      </button>
      <button className={`${styles.btn} ${styles.btnSecondary}`} type="button" onClick={() => void patchStatus("RESOLVED")}>
        Resolve
      </button>
      <button className={`${styles.btn} ${styles.btnSecondary}`} type="button" onClick={() => void patchStatus("DISMISSED")}>
        Dismiss
      </button>
      {error ? <span style={{ color: "var(--danger)", fontSize: 12 }}>{error}</span> : null}
    </div>
  );
}
