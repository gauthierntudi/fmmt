import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { Suspense } from "react";
import Image from "next/image";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  return (
    <div className="admin-login-page">
      <main className="admin-login-card">
        <Image src="/img/logo-fr-01.png" alt="FMMT" width={150} height={52} priority />
        <h1>Back-office</h1>
        <p className="lead">FMMT 2e édition 2026 — accès staff</p>
        <Suspense fallback={<p>…</p>}>
          <AdminLoginForm />
        </Suspense>
      </main>
    </div>
  );
}
