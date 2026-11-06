import { serverApiFetch } from "@/lib/server-api";
import styles from "@/styles/admin.module.css";
import { CreateCategory } from "./create-category";

export const dynamic = "force-dynamic";

type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
};

type Resp = { categories: Category[] };

export default async function AdminCategoriesPage() {
  let categories: Category[] = [];
  let error: string | null = null;
  try {
    const res = await serverApiFetch<Resp>(`/admin/categories`);
    categories = res.categories;
  } catch {
    error = "Unauthorized or API unavailable.";
  }

  return (
    <div>
      <h1 style={{ fontSize: 20, marginBottom: 10 }}>Categories</h1>
      {error ? (
        <div className={styles.panel} style={{ color: "var(--danger)" }}>
          {error}
        </div>
      ) : (
        <>
          <CreateCategory />
          <div className={styles.panel} style={{ marginTop: 12 }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>
                      <code>{c.slug}</code>
                    </td>
                    <td>{c.description ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
