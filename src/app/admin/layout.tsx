import { Inter } from "next/font/google";
import "./admin.css";

const adminSans = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-admin-sans",
});

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`admin-root ${adminSans.variable} ${adminSans.className}`}>
      {children}
    </div>
  );
}
