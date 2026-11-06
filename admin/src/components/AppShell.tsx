import Link from "next/link";
import type { ReactNode } from "react";
import styles from "@/styles/admin.module.css";

const LINKS = [
  ["/dashboard", "Dashboard"],
  ["/users", "Users"],
  ["/listings", "Listings"],
  ["/categories", "Categories"],
  ["/reports", "Reports"],
  ["/moderation", "Moderation"],
  ["/featured", "Featured"],
  ["/analytics", "Analytics"],
  ["/audit-logs", "Audit logs"],
  ["/settings", "Settings"],
  ["/login", "Login"],
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <aside className={styles.side}>
        <Link href="/dashboard" className={styles.brandRow}>
          <img src="/listhub-logo.jpg" alt="ListHub" />
          <span className={styles.pill}>ADMIN</span>
        </Link>
        <nav className={styles.nav}>
          {LINKS.map(([href, label]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
