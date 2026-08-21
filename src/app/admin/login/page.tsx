import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) {
    redirect("/admin/participants");
  }

  return (
    <div className="admin-shell">
      <main className="panel" style={{ maxWidth: 420, margin: "4rem auto" }}>
        <h1 style={{ marginTop: 0 }}>Admin FMMT</h1>
        <p style={{ color: "#666", marginTop: 0 }}>Connexion email + mot de passe</p>
        <Suspense fallback={<p>…</p>}>
          <AdminLoginForm />
        </Suspense>
      </main>
    </div>
  );
}
