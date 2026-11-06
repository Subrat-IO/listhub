import { redirect } from "next/navigation";
import { serverApiFetch } from "@/lib/server-api";
import type { Category } from "@/lib/types";
import { SellListingForm } from "./sell-form";

export const dynamic = "force-dynamic";

type Resp = { categories: Category[] };

export default async function SellPage() {
  let categories: Category[] = [];
  try {
    await serverApiFetch(`/auth/me`);
  } catch {
    redirect("/login?next=/sell");
  }

  try {
    const c = await serverApiFetch<Resp>(`/categories`);
    categories = c.categories;
  } catch {
    categories = [];
  }

  return (
    <div>
      <SellListingForm categories={categories} />
    </div>
  );
}
