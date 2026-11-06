"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import styles from "@/styles/admin.module.css";

export function CreateCategory() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await apiFetch(`/admin/categories`, {
        method: "POST",
        body: JSON.stringify({ name, slug, description }),
      });
      setName("");
      setSlug("");
      setDescription("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  }

  return (
    <form className={styles.panel} onSubmit={submit}>
      <div style={{ fontWeight: 800, marginBottom: 10 }}>Create category</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10 }}>
        <input className={styles.input} placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className={styles.input} placeholder="slug-like-this" value={slug} onChange={(e) => setSlug(e.target.value)} />
        <input className={styles.input} placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div style={{ marginTop: 10 }}>
        <button className={styles.btn} type="submit">
          Create
        </button>
      </div>
      {error ? <div style={{ color: "var(--danger)", marginTop: 10 }}>{error}</div> : null}
    </form>
  );
}
