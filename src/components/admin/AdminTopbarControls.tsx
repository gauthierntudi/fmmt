"use client";

import { useEffect, useRef, useState } from "react";

export type AdminTheme = "light" | "dark";

const STORAGE_KEY = "fmmt-admin-theme";

export function useAdminTheme() {
  const [theme, setThemeState] = useState<AdminTheme>("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const preferred =
      stored === "dark" || stored === "light"
        ? stored
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    setThemeState(preferred);
    document.querySelector(".admin-root")?.setAttribute("data-theme", preferred);
    setReady(true);
  }, []);

  function setTheme(next: AdminTheme) {
    setThemeState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    document.querySelector(".admin-root")?.setAttribute("data-theme", next);
  }

  function toggleTheme() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  return { theme, setTheme, toggleTheme, ready };
}

export function AdminTopbarControls({ userName }: { userName: string }) {
  const { theme, toggleTheme } = useAdminTheme();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!notifRef.current?.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div className="admin-icon-actions">
      <button
        type="button"
        className="admin-icon-btn"
        aria-label={theme === "dark" ? "Passer en mode clair" : "Passer en mode sombre"}
        title={theme === "dark" ? "Mode clair" : "Mode sombre"}
        onClick={toggleTheme}
      >
        {theme === "dark" ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
            <path d="M21 14.5A8.5 8.5 0 1 1 9.5 3a7 7 0 0 0 11.5 11.5z" />
          </svg>
        )}
      </button>

      <div className="admin-notif" ref={notifRef}>
        <button
          type="button"
          className="admin-icon-btn"
          aria-label="Notifications"
          aria-expanded={notifOpen}
          title="Notifications"
          onClick={() => setNotifOpen((v) => !v)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
            <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.7 21a2 2 0 0 1-3.4 0" />
          </svg>
          <span className="admin-notif-dot" aria-hidden />
        </button>

        {notifOpen && (
          <div className="admin-notif-panel" role="dialog" aria-label="Notifications">
            <div className="admin-notif-head">
              <strong>Notifications</strong>
              <span>0 nouvelle</span>
            </div>
            <div className="admin-notif-empty">
              <p>Bonjour {userName.split(" ")[0]}.</p>
              <p>Aucune notification pour le moment.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
