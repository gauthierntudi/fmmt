import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FMMT",
  description: "Festival Mondial de la Musique et du Tourisme",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
