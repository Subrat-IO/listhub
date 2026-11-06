import { cookies, headers } from "next/headers";
import { serverEnv } from "./env";

async function parseJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export async function serverApiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const url = `${serverEnv.apiInternalUrl}${path.startsWith("/") ? "" : "/"}${path}`;
  const headerList = await headers();
  const cookieStore = await cookies();

  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const forwardHeaders = new Headers(init.headers);
  if (!forwardHeaders.has("cookie") && cookieHeader) forwardHeaders.set("cookie", cookieHeader);

  const xf = headerList.get("x-forwarded-for");
  if (xf && !forwardHeaders.has("x-forwarded-for")) forwardHeaders.set("x-forwarded-for", xf);

  const res = await fetch(url, {
    ...init,
    headers: forwardHeaders,
    cache: "no-store",
  });

  const data = (await parseJson(res)) as T;
  if (!res.ok) {
    const err = new Error(`API error (${res.status})`);
    (err as Error & { status?: number; body?: unknown }).status = res.status;
    (err as Error & { status?: number; body?: unknown }).body = data;
    throw err;
  }

  return data as T;
}
