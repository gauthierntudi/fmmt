"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        setError("Email ou mot de passe incorrect");
        return;
      }
      const next = searchParams.get("next") || "/admin/participants";
      router.push(next);
      router.refresh();
    } catch {
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: "1rem" }}>
      {error && <div className="form-error-banner">{error}</div>}
      <label>
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="username"
          style={{
            display: "block",
            width: "100%",
            marginTop: 6,
            padding: "0.75rem",
            borderRadius: 12,
            border: "1px solid #e2d8e6",
          }}
        />
      </label>
      <label>
        Mot de passe
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          style={{
            display: "block",
            width: "100%",
            marginTop: 6,
            padding: "0.75rem",
            borderRadius: 12,
            border: "1px solid #e2d8e6",
          }}
        />
      </label>
      <button type="submit" className="btn btn-primary trapezoid" disabled={loading} style={{ fontSize: "1em" }}>
        {loading ? "…" : "Connexion"}
      </button>
    </form>
  );
}
