"use client";

import { useEffect } from "react";
import { apiFetch } from "@/lib/api";

export function CsrfBootstrap() {
  useEffect(() => {
    void (async () => {
      try {
        const res = await apiFetch<{ csrfToken: string }>("/auth/csrf", { method: "GET" });
        window.__LISTHUB_CSRF__ = res.csrfToken;
      } catch {
        // ignore
      }
    })();
  }, []);

  return null;
}
