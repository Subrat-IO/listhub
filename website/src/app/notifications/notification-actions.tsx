"use client";

import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import formStyles from "@/styles/forms.module.css";

export function NotificationActions({ id, read }: { id: string; read: boolean }) {
  const router = useRouter();

  async function mark(next: boolean) {
    await apiFetch(`/me/notifications/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ read: next }),
    });
    router.refresh();
  }

  return (
    <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
      {!read ? (
        <button className={formStyles.btn} type="button" onClick={() => void mark(true)}>
          Mark read
        </button>
      ) : (
        <button className={`${formStyles.btn} ${formStyles.btnSecondary}`} type="button" onClick={() => void mark(false)}>
          Mark unread
        </button>
      )}
    </div>
  );
}
