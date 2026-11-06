"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import styles from "@/styles/admin.module.css";

export default function ModerationPage() {
  const [targetType, setTargetType] = useState("listing");
  const [targetId, setTargetId] = useState("");
  const [action, setAction] = useState("note");
  const [note, setNote] = useState("");
  const [reportStatus, setReportStatus] = useState<"" | "REVIEWING" | "RESOLVED" | "DISMISSED">("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    try {
      const res = await apiFetch<{ moderation: { id: string } }>(`/admin/moderation`, {
        method: "POST",
        body: JSON.stringify({
          action,
          targetType,
          targetId,
          note,
          ...(reportStatus ? { reportStatus } : {}),
        }),
      });
      setResult(`Recorded moderation action: ${res.moderation.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: 20, marginBottom: 10 }}>Moderation</h1>
      <form className={styles.panel} onSubmit={submit}>
        <div style={{ color: "var(--muted)", fontSize: 13, marginBottom: 12 }}>
          This writes an audit-friendly moderation record. For listings/users, prefer the dedicated tables — this is for operational notes and optional
          report status context.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10 }}>
          <input className={styles.input} placeholder="targetType (listing, user, report…)" value={targetType} onChange={(e) => setTargetType(e.target.value)} />
          <input className={styles.input} placeholder="target UUID" value={targetId} onChange={(e) => setTargetId(e.target.value)} />
          <input className={styles.input} placeholder="action label" value={action} onChange={(e) => setAction(e.target.value)} />
        </div>
        <div style={{ marginTop: 10 }}>
          <textarea
            className={styles.input}
            placeholder="Note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{ minHeight: 110, resize: "vertical" }}
          />
        </div>
        <div style={{ marginTop: 10 }}>
          <select className={styles.input} value={reportStatus} onChange={(e) => setReportStatus(e.target.value as typeof reportStatus)}>
            <option value="">(optional) also set report status…</option>
            <option value="REVIEWING">REVIEWING</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="DISMISSED">DISMISSED</option>
          </select>
        </div>
        <div style={{ marginTop: 10 }}>
          <button className={styles.btn} type="submit">
            Record action
          </button>
        </div>
        {result ? <div style={{ marginTop: 10 }}>{result}</div> : null}
        {error ? <div style={{ color: "var(--danger)", marginTop: 10 }}>{error}</div> : null}
      </form>
    </div>
  );
}
