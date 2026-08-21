"use client";

import { useEffect, useRef, useState } from "react";
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css";
import type { AdminSession } from "@/lib/auth";
import { AdminAvatar } from "@/components/admin/AdminAvatar";

type Props = {
  user: AdminSession;
  open: boolean;
  onClose: () => void;
  onSaved: (user: AdminSession) => void;
};

export function AdminProfileModal({ user, open, onClose, onSaved }: Props) {
  const [name, setName] = useState(user.name);
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [cropping, setCropping] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const cropperRef = useRef<Cropper | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(user.name);
    setCurrentPassword("");
    setPassword("");
    setError(null);
    setPhotoDataUrl(null);
    setRemovePhoto(false);
    setCropping(false);
    setPreviewUrl(null);
  }, [open, user.name, user.photoUrl]);

  useEffect(() => {
    if (!cropping || !previewUrl || !imgRef.current) return;

    const cropper = new Cropper(imgRef.current, {
      aspectRatio: 1,
      viewMode: 1,
      dragMode: "move",
      autoCropArea: 1,
      responsive: true,
      background: false,
      guides: true,
      center: true,
      highlight: false,
      cropBoxMovable: true,
      cropBoxResizable: true,
      toggleDragModeOnDblclick: false,
    });
    cropperRef.current = cropper;

    return () => {
      cropper.destroy();
      cropperRef.current = null;
    };
  }, [cropping, previewUrl]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !busy) {
        if (cropping) cancelCrop();
        else onClose();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, busy, cropping, onClose]);

  function revokePreview() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  }

  function onPickFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Choisissez une image (JPG, PNG, WebP)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image trop lourde (max 5 Mo)");
      return;
    }
    setError(null);
    revokePreview();
    setPreviewUrl(URL.createObjectURL(file));
    setCropping(true);
  }

  function cancelCrop() {
    cropperRef.current?.destroy();
    cropperRef.current = null;
    setCropping(false);
    revokePreview();
    if (fileRef.current) fileRef.current.value = "";
  }

  function applyCrop() {
    const cropper = cropperRef.current;
    if (!cropper) return;
    const canvas = cropper.getCroppedCanvas({
      width: 512,
      height: 512,
      imageSmoothingEnabled: true,
      imageSmoothingQuality: "high",
    });
    if (!canvas) {
      setError("Recadrage impossible");
      return;
    }
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setPhotoDataUrl(dataUrl);
    setRemovePhoto(false);
    cancelCrop();
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const body: Record<string, unknown> = { name: name.trim() };
      if (password) {
        body.password = password;
        body.currentPassword = currentPassword;
      }
      if (removePhoto) body.removePhoto = true;
      if (photoDataUrl) body.photoDataUrl = photoDataUrl;

      const res = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) {
        const map: Record<string, string> = {
          INVALID_NAME: "Nom trop court",
          WEAK_PASSWORD: "Mot de passe ≥ 8 caractères",
          CURRENT_PASSWORD_REQUIRED: "Mot de passe actuel requis",
          BAD_CURRENT_PASSWORD: "Mot de passe actuel incorrect",
          INVALID_IMAGE: "Image invalide",
        };
        setError(map[json.error] || "Enregistrement impossible");
        return;
      }
      onSaved(json.user as AdminSession);
      onClose();
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  const displayPhoto = removePhoto
    ? null
    : photoDataUrl || user.photoUrl;

  return (
    <div className="modal-backdrop" onClick={() => !busy && !cropping && onClose()}>
      <div
        className="modal admin-profile-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-profile-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="admin-profile-title">Mon profil</h2>
        <p className="admin-panel-sub">Mettez à jour votre nom, mot de passe et photo.</p>

        {error && <div className="admin-form-error">{error}</div>}

        {cropping && previewUrl ? (
          <div className="admin-cropper-wrap">
            <div className="admin-cropper-stage">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img ref={imgRef} src={previewUrl} alt="À recadrer" />
            </div>
            <div className="admin-modal-actions">
              <button type="button" className="admin-btn admin-btn-secondary" onClick={cancelCrop}>
                Annuler
              </button>
              <button type="button" className="admin-btn admin-btn-primary" onClick={applyCrop}>
                Valider le recadrage
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={(e) => void save(e)} className="admin-user-form admin-user-form-modal">
            <div className="admin-profile-photo-block">
              <AdminAvatar
                name={name || user.name}
                userId={user.id}
                photoUrl={displayPhoto}
                className="admin-profile-avatar"
                size={88}
              />
              <div className="admin-profile-photo-actions">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  hidden
                  onChange={(e) => onPickFile(e.target.files?.[0])}
                />
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => fileRef.current?.click()}
                >
                  Changer la photo
                </button>
                {(displayPhoto || user.photoUrl) && !removePhoto && (
                  <button
                    type="button"
                    className="admin-btn admin-btn-danger"
                    onClick={() => {
                      setPhotoDataUrl(null);
                      setRemovePhoto(true);
                    }}
                  >
                    Retirer
                  </button>
                )}
              </div>
            </div>

            <label className="admin-field">
              <span>Nom</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
              />
            </label>

            <label className="admin-field">
              <span>Email</span>
              <input value={user.email} disabled readOnly />
            </label>

            <label className="admin-field">
              <span>Rôle</span>
              <input
                value={user.role === "SUPER_ADMIN" ? "Super admin" : "Staff"}
                disabled
                readOnly
              />
            </label>

            <label className="admin-field">
              <span>Nouveau mot de passe (optionnel)</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                placeholder="Laisser vide pour ne pas changer"
                autoComplete="new-password"
              />
            </label>

            {password.length > 0 && (
              <label className="admin-field">
                <span>Mot de passe actuel</span>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </label>
            )}

            <div className="admin-modal-actions">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={onClose}
                disabled={busy}
              >
                Annuler
              </button>
              <button type="submit" className="admin-btn admin-btn-primary" disabled={busy}>
                {busy ? "Enregistrement…" : "Enregistrer"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
