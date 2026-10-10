import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JIT COFFIE — Make room for focus",
  description: "A little ritual for the work that matters. Plan your day with JIT COFFIE.",
  applicationName: "JIT COFFIE",
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
