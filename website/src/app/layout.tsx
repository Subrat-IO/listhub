import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { publicEnv } from "@/lib/env";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    default: publicEnv.appName,
    template: `%s · ${publicEnv.appName}`,
  },
  description: "ListHub marketplace — sell anything at your own price.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
