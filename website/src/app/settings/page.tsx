"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import type { MeUser } from "@/lib/types";
import formStyles from "@/styles/forms.module.css";

type MeResponse = { user: MeUser };

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<MeUser | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await apiFetch<MeResponse>(`/auth/me`);
        setUser(res.user);
        setDisplayName(res.user.displayName ?? "");
        setBio(res.user.bio ?? "");
        setLocation(res.user.location ?? "");
      } catch {
        router.replace("/login?next=/settings");
      }
    })();
  }, [router]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await apiFetch(`/me/profile`, {
        method: "PATCH",
        body: JSON.stringify({
          displayName,
          bio: bio || null,
          location: location || null,
        }),
      });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    }
  }

  async function logout() {
    setError(null);
    try {
      await apiFetch(`/auth/logout`, { method: "POST" });
      window.__LISTHUB_CSRF__ = undefined;
      router.replace("/login");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Logout failed");
    }
  }

  if (!user) {
    return <div style={{ color: "var(--muted)" }}>Loading…</div>;
  }

  return (
    <div className={formStyles.card}>
      <div className={formStyles.title}>Settings</div>
      <form onSubmit={save}>
        <div className={formStyles.row}>
          <label className={formStyles.label}>Email</label>
          <input className={formStyles.input} value={user.email} disabled />
        </div>
        <div className={formStyles.row}>
          <label className={formStyles.label}>Display name</label>
          <input className={formStyles.input} value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        </div>
        <div className={formStyles.row}>
          <label className={formStyles.label}>Bio</label>
          <textarea className={formStyles.textarea} value={bio} onChange={(e) => setBio(e.target.value)} />
        </div>
        <div className={formStyles.row}>
          <label className={formStyles.label}>Location</label>
          <input className={formStyles.input} value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
        <div className={formStyles.actions}>
          <button className={formStyles.btn} type="submit">
            Save changes
          </button>
          <button className={`${formStyles.btn} ${formStyles.btnSecondary}`} type="button" onClick={() => void logout()}>
            Sign out
          </button>
        </div>
      </form>
      {error ? <div className={formStyles.error}>{error}</div> : null}
    </div>
  );
}
