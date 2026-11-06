import { serverApiFetch } from "@/lib/server-api";
import styles from "@/styles/admin.module.css";
import { UserActions } from "./user-actions";

export const dynamic = "force-dynamic";

type User = {
  id: string;
  email: string;
  status: string;
  profile?: { displayName?: string | null } | null;
  userRoles: { role: { name: string } }[];
};

type Resp = { users: User[]; total: number };

export default async function UsersPage() {
  let rows: User[] = [];
  let error: string | null = null;
  try {
    const res = await serverApiFetch<Resp>(`/admin/users?pageSize=50`);
    rows = res.users;
  } catch {
    error = "Unauthorized or API unavailable.";
  }

  return (
    <div>
      <h1 style={{ fontSize: 20, marginBottom: 10 }}>Users</h1>
      {error ? (
        <div className={styles.panel} style={{ color: "var(--danger)" }}>
          {error}
        </div>
      ) : (
        <div className={styles.panel}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Roles</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id}>
                  <td>{u.profile?.displayName ?? "—"}</td>
                  <td>{u.email}</td>
                  <td>{u.userRoles.map((r) => r.role.name).join(", ")}</td>
                  <td>{u.status}</td>
                  <td>
                    <UserActions userId={u.id} status={u.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
