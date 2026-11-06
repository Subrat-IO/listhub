"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import styles from "@/styles/admin.module.css";

export function UserActions({ userId, status }: { userId: string; status: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function patch(next: "ACTIVE" | "SUSPENDED" | "BANNED") {
    setError(null);
    try {
      await apiFetch(`/admin/users/${userId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: next }),
      });
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    }
  }

  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      <button className={styles.btn} type="button" disabled={status === "ACTIVE"} onClick={() => void patch("ACTIVE")}>
        Activate
      </button>
      <button
        className={`${styles.btn} ${styles.btnSecondary}`}
        type="button"
        disabled={status === "SUSPENDED"}
        onClick={() => void patch("SUSPENDED")}
      >
        Suspend
      </button>
      <button className={`${styles.btn} ${styles.btnSecondary}`} type="button" disabled={status === "BANNED"} onClick={() => void patch("BANNED")}>
        Ban
      </button>
      {error ? <span style={{ color: "var(--danger)", fontSize: 12 }}>{error}</span> : null}
    </div>
  );
}
