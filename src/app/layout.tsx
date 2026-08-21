import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FMMT",
  description: "Festival Mondial de la Musique et du Tourisme",
  icons: {
    icon: [{ url: "/img/icon01.png", type: "image/png" }],
    apple: [{ url: "/img/icon01.png", type: "image/png" }],
    shortcut: "/img/icon01.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
