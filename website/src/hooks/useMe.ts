"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { MeUser } from "@/lib/types";

type MeResponse = { user: MeUser };

export function useMe() {
  const [user, setUser] = useState<MeUser | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const res = await apiFetch<MeResponse>("/auth/me");
        setUser(res.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { user, loading, setUser };
}
