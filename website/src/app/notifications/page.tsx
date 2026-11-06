import { redirect } from "next/navigation";
import { serverApiFetch } from "@/lib/server-api";
import { NotificationActions } from "./notification-actions";
import styles from "../home.module.css";

export const dynamic = "force-dynamic";

type Notification = {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
};

type Resp = { notifications: Notification[] };

export default async function NotificationsPage() {
  let notifications: Notification[] = [];
  try {
    const res = await serverApiFetch<Resp>(`/me/notifications`);
    notifications = res.notifications;
  } catch {
    redirect("/login?next=/notifications");
  }

  return (
    <div>
      <div className={styles.gridTitleRow}>
        <div className={styles.gridTitle}>Notifications</div>
        <div className={styles.gridSub}>{notifications.filter((n) => !n.read).length} unread</div>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {notifications.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>You&apos;re all caught up.</p>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              style={{
                border: "1px solid var(--border)",
                borderRadius: 14,
                padding: 12,
                background: n.read ? "var(--surface2)" : "var(--surface)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}>
                <div style={{ fontWeight: 800 }}>{n.title}</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>{new Date(n.createdAt).toLocaleString()}</div>
              </div>
              <div style={{ marginTop: 8, whiteSpace: "pre-wrap", lineHeight: 1.45 }}>{n.body}</div>
              <NotificationActions id={n.id} read={n.read} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
