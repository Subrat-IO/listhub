import { cookies } from "next/headers";
import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import styles from "./app-shell.module.css";

export async function AppShell({ children }: { children: ReactNode }) {
  const jar = await cookies();
  const city = jar.get("listhub_city")?.value ? decodeURIComponent(jar.get("listhub_city")!.value) : "Bengaluru";

  return (
    <div className={styles.shell}>
      <SiteHeader city={city} />
      <main className={styles.main}>{children}</main>
      <SiteFooter />
      <BottomNav />
    </div>
  );
}
