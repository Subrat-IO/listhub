"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import styles from "@/styles/admin.module.css";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await apiFetch<{ csrfToken: string }>(`/auth/login`, {
        method: "POST",
        body: JSON.stringify({ email, password }),
        skipCsrf: true,
      });
      window.__LISTHUB_CSRF__ = res.csrfToken;
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  }

  return (
    <div className={styles.panel} style={{ maxWidth: 520 }}>
      <img src="/listhub-logo.jpg" alt="ListHub" style={{ height: 64, objectFit: "contain" }} />
      <span className={styles.pill} style={{ display: "inline-block", margin: "8px 0 12px" }}>
        ADMIN
      </span>
      <h1 style={{ fontSize: 18, marginBottom: 10 }}>Admin sign in</h1>
      <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 12 }}>
        Uses the same centralized backend session as the public site. Only staff roles can access admin API routes.
      </p>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
        <input className={styles.input} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        <input
          className={styles.input}
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        <button className={styles.btn} type="submit" style={{ background: "#2563eb", color: "#fff", width: "100%" }}>
          Continue
        </button>
      </form>
      {error ? <div style={{ color: "var(--danger)", marginTop: 10 }}>{error}</div> : null}
    </div>
  );
}
