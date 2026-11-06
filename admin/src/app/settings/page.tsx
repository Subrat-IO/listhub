import Link from "next/link";
import { publicEnv } from "@/lib/env";
import styles from "@/styles/admin.module.css";

export default function AdminSettingsPage() {
  return (
    <div>
      <h1 style={{ fontSize: 20, marginBottom: 10 }}>Settings</h1>
      <div className={styles.panel}>
        <p style={{ color: "var(--muted)", lineHeight: 1.55 }}>
          Configure this deployment using the single environment file at <code>admin/.env</code> (see repo <code>README.md</code>). Admin uses session cookies against{" "}
          <code>{publicEnv.apiUrl}</code>.
        </p>
        <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
          <Link href="/login" className={styles.btn} style={{ display: "inline-block", width: "fit-content" }}>
            Staff login
          </Link>
          <Link href="/dashboard" className={`${styles.btn} ${styles.btnSecondary}`} style={{ display: "inline-block", width: "fit-content" }}>
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
