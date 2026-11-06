"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import formStyles from "@/styles/forms.module.css";

export default function LoginPage() {
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
      router.push("/account");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  }

  return (
    <div className={formStyles.card} style={{ maxWidth: 520 }}>
      <img src="/listhub-logo.jpg" alt="ListHub" style={{ height: 64, objectFit: "contain", marginBottom: 8 }} />
      <div className={formStyles.title}>Sign in</div>
      <form onSubmit={onSubmit}>
        <div className={formStyles.row}>
          <label className={formStyles.label} htmlFor="email">
            Email
          </label>
          <input id="email" className={formStyles.input} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </div>
        <div className={formStyles.row}>
          <label className={formStyles.label} htmlFor="password">
            Password
          </label>
          <input
            id="password"
            className={formStyles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        <div className={formStyles.actions}>
          <button className={formStyles.btn} type="submit">
            Continue
          </button>
          <Link className={`${formStyles.btn} ${formStyles.btnSecondary}`} href="/register">
            Create an account
          </Link>
        </div>
      </form>
      {error ? <div className={formStyles.error}>{error}</div> : null}
    </div>
  );
}
