"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import formStyles from "@/styles/forms.module.css";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await apiFetch<{ csrfToken: string }>(`/auth/register`, {
        method: "POST",
        body: JSON.stringify({ email, password, displayName }),
        skipCsrf: true,
      });
      window.__LISTHUB_CSRF__ = res.csrfToken;
      router.push("/account");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  }

  return (
    <div className={formStyles.card} style={{ maxWidth: 520 }}>
      <img src="/listhub-logo.jpg" alt="ListHub" style={{ height: 64, objectFit: "contain", marginBottom: 8 }} />
      <div className={formStyles.title}>Create your account</div>
      <form onSubmit={onSubmit}>
        <div className={formStyles.row}>
          <label className={formStyles.label} htmlFor="displayName">
            Display name
          </label>
          <input
            id="displayName"
            className={formStyles.input}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            autoComplete="name"
          />
        </div>
        <div className={formStyles.row}>
          <label className={formStyles.label} htmlFor="email">
            Email
          </label>
          <input id="email" className={formStyles.input} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </div>
        <div className={formStyles.row}>
          <label className={formStyles.label} htmlFor="password">
            Password (min 8 chars)
          </label>
          <input
            id="password"
            className={formStyles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
        </div>
        <div className={formStyles.actions}>
          <button className={formStyles.btn} type="submit">
            Create account
          </button>
          <Link className={`${formStyles.btn} ${formStyles.btnSecondary}`} href="/login">
            I already have an account
          </Link>
        </div>
      </form>
      {error ? <div className={formStyles.error}>{error}</div> : null}
    </div>
  );
}
