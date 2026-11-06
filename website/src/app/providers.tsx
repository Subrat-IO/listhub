"use client";

import type { ReactNode } from "react";
import { CsrfBootstrap } from "@/components/CsrfBootstrap";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <>
      <CsrfBootstrap />
      {children}
    </>
  );
}
