import Link from "next/link";
import { redirect } from "next/navigation";
import { serverApiFetch } from "@/lib/server-api";
import type { MeUser } from "@/lib/types";
import formStyles from "@/styles/forms.module.css";

export const dynamic = "force-dynamic";

type MeResponse = { user: MeUser };

export default async function AccountPage() {
  let user: MeUser | null = null;
  try {
    const res = await serverApiFetch<MeResponse>(`/auth/me`);
    user = res.user;
  } catch {
    redirect("/login?next=/account");
  }

  return (
    <div className={formStyles.card}>
      <div className={formStyles.title}>Account</div>
      <div className={formStyles.muted}>
        Signed in as <strong>{user.displayName ?? user.email}</strong>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginTop: 12 }}>
        <Link className={formStyles.btn} href="/my-listings">
          My listings
        </Link>
        <Link className={formStyles.btn} href="/interests">
          Interests
        </Link>
        <Link className={formStyles.btn} href="/favorites">
          Favorites
        </Link>
        <Link className={formStyles.btn} href="/messages">
          Messages
        </Link>
        <Link className={formStyles.btn} href="/notifications">
          Notifications
        </Link>
        <Link className={`${formStyles.btn} ${formStyles.btnSecondary}`} href="/settings">
          Settings
        </Link>
      </div>

      <div style={{ marginTop: 14, fontSize: 13, color: "var(--muted)" }}>
        Roles: {user.roles.join(", ")}
      </div>
    </div>
  );
}
