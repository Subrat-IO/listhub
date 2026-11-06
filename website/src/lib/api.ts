"use client";

import { publicEnv } from "./env";

async function parseJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit & { skipCsrf?: boolean } = {}
): Promise<T> {
  const url = `${publicEnv.apiUrl}${path.startsWith("/") ? "" : "/"}${path}`;
  const headers = new Headers(init.headers);

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const method = (init.method ?? "GET").toUpperCase();
  if (!["GET", "HEAD", "OPTIONS"].includes(method) && !init.skipCsrf) {
    const csrf = window.__LISTHUB_CSRF__;
    if (csrf) {
      headers.set("x-csrf-token", csrf);
    }
  }

  const res = await fetch(url, {
    ...init,
    headers,
    credentials: "include",
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

declare global {
  interface Window {
    __LISTHUB_CSRF__?: string;
  }
}
