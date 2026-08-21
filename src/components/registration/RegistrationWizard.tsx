"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { CountrySearchSelect } from "@/components/registration/CountrySearchSelect";
import { PhoneIntlInput } from "@/components/registration/PhoneIntlInput";
import {
  FormDatePicker,
  FormTimePicker,
} from "@/components/registration/FormDateTimePickers";
import { hotelCategories, hotelsData } from "@/lib/hotels";

type FormState = {
  email: string;
  nom: string;
  prenom: string;
  typeInscription: "PARTICIPANT" | "ARTISTE" | "OFFICIEL" | "MEDIA";
  paysCode: string;
  telephone: string;
  fonction: string;
  societe: string;
  lettreInvitation: "OUI" | "NON";
  typeAcces: "AEROPORT" | "BEACH" | "";
  dateArrivee: string;
  heureArrivee: string;
  dateDepart: string;
  heureDepart: string;
  compagnieAerienne: string;
  numeroVol: string;
  hotel: string;
  roomType: string;
};

const initialState: FormState = {
  email: "",
  nom: "",
  prenom: "",
  typeInscription: "PARTICIPANT",
  paysCode: "CD",
  telephone: "",
  fonction: "",
  societe: "",
  lettreInvitation: "NON",
  typeAcces: "",
  dateArrivee: "",
  heureArrivee: "",
  dateDepart: "",
  heureDepart: "",
  compagnieAerienne: "",
  numeroVol: "",
  hotel: "",
  roomType: "",
};

export function RegistrationWizard() {
  const t = useTranslations("Register");
  const locale = useLocale();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(initialState);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isRDC = form.paysCode === "CD";

  const roomOptions = useMemo(() => {
    if (!form.hotel || !hotelsData[form.hotel]) return [];
    return Object.keys(hotelsData[form.hotel].rooms);
  }, [form.hotel]);

  const hotelInfo = form.hotel ? hotelsData[form.hotel] : null;
  const roomPrice =
    hotelInfo && form.roomType ? hotelInfo.rooms[form.roomType] : null;

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  }

  function validateStep(current: number): boolean {
    if (current === 1) {
      if (
        !form.email ||
        !form.nom ||
        !form.prenom ||
        !form.paysCode ||
        !form.telephone ||
        !form.fonction
      ) {
        setError(t("required"));
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        setError(t("errors.generic"));
        return false;
      }
      if (form.telephone.replace(/\D/g, "").length < 8) {
        setError(t("errors.phoneInvalid"));
        return false;
      }
      return true;
    }

    if (current === 2 && !isRDC) {
      if (
        !form.typeAcces ||
        !form.dateArrivee ||
        !form.heureArrivee ||
        !form.dateDepart ||
        !form.heureDepart
      ) {
        setError(t("errors.TRAVEL_REQUIRED"));
        return false;
      }
    }

    if (current === 3 && !isRDC) {
      if (!form.hotel || !form.roomType) {
        setError(t("errors.HOTEL_REQUIRED"));
        return false;
      }
    }

    return true;
  }

  async function handleSubmit() {
    if (!validateStep(3)) return;
    setSubmitting(true);
    setError(null);

    const payload = {
      email: form.email.trim(),
      nom: form.nom.trim(),
      prenom: form.prenom.trim(),
      typeInscription: form.typeInscription,
      paysCode: form.paysCode,
      telephone: form.telephone.trim(),
      fonction: form.fonction.trim(),
      societe: form.societe.trim() || null,
      lettreInvitation: form.lettreInvitation,
      locale,
      typeAcces: isRDC ? null : form.typeAcces || null,
      dateArrivee: isRDC ? null : form.dateArrivee || null,
      heureArrivee: isRDC ? null : form.heureArrivee || null,
      dateDepart: isRDC ? null : form.dateDepart || null,
      heureDepart: isRDC ? null : form.heureDepart || null,
      compagnieAerienne: isRDC ? null : form.compagnieAerienne || null,
      numeroVol: isRDC ? null : form.numeroVol || null,
      hotel: form.hotel || null,
      roomType: form.roomType || null,
    };

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok) {
        const code = json.error as string;
        if (code === "DUPLICATE_EMAIL") setError(t("errors.DUPLICATE_EMAIL"));
        else if (code === "DUPLICATE_PHONE") setError(t("errors.DUPLICATE_PHONE"));
        else if (code === "TRAVEL_REQUIRED") setError(t("errors.TRAVEL_REQUIRED"));
        else if (code === "HOTEL_REQUIRED") setError(t("errors.HOTEL_REQUIRED"));
        else setError(t("errors.generic"));
        return;
      }

      router.push({
        pathname: "/inscription/success",
        query: {
          prenom: form.prenom,
          emailSent: String(Boolean(json.emailSent)),
        },
      });
    } catch {
      setError(t("errors.generic"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="registration-form">
      <div className="progress-bar-wrapper mb-4">
        <div className="step-progress">
          <div className={`step ${step === 1 ? "active" : step > 1 ? "done" : ""}`}>
            <span className="step-number">1</span>
            <span className="step-text">{t("step1")}</span>
          </div>
          <div className={`step ${step === 2 ? "active" : step > 2 ? "done" : ""}`}>
            <span className="step-number">2</span>
            <span className="step-text">{t("step2")}</span>
          </div>
          <div className={`step ${step === 3 ? "active" : ""}`}>
            <span className="step-number">3</span>
            <span className="step-text">{t("step3")}</span>
          </div>
        </div>
      </div>

      {isRDC && step > 1 && <p className="rdc-hint">{t("rdcHint")}</p>}
      {error && (
        <div className="form-error-banner" role="alert">
          {error}
        </div>
      )}

      {step === 1 && (
        <div className="form-step">
          <h3 className="text-center mb-4">{t("step1")}</h3>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="email">{t("email")} *</label>
              <input
                id="email"
                type="email"
                className="form-control borderradius"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="nom">{t("nom")} *</label>
              <input
                id="nom"
                type="text"
                className="form-control borderradius"
                value={form.nom}
                onChange={(e) => update("nom", e.target.value)}
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="prenom">{t("prenom")} *</label>
              <input
                id="prenom"
                type="text"
                className="form-control borderradius"
                value={form.prenom}
                onChange={(e) => update("prenom", e.target.value)}
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <span className="form-label">{t("typeInscription")} *</span>
              <div>
                {(["OFFICIEL", "PARTICIPANT", "ARTISTE", "MEDIA"] as const).map((type) => (
                  <div key={type} className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="typeInscription"
                      id={`type-${type}`}
                      checked={form.typeInscription === type}
                      onChange={() => update("typeInscription", type)}
                    />
                    <label className="form-check-label" htmlFor={`type-${type}`}>
                      {t(`types.${type}`)}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="pays">{t("pays")} *</label>
              <CountrySearchSelect
                id="pays"
                value={form.paysCode}
                placeholder={t("selectCountry")}
                onChange={(code) => update("paysCode", code)}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="telephone">{t("telephone")} *</label>
              <PhoneIntlInput
                id="telephone"
                countryCode={form.paysCode}
                value={form.telephone}
                onChange={(e164) => update("telephone", e164)}
                onCountryChange={(code) => {
                  if (code !== form.paysCode) update("paysCode", code);
                }}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="fonction">{t("fonction")} *</label>
              <input
                id="fonction"
                type="text"
                className="form-control borderradius"
                value={form.fonction}
                onChange={(e) => update("fonction", e.target.value)}
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="societe">{t("societe")}</label>
              <input
                id="societe"
                type="text"
                className="form-control borderradius"
                value={form.societe}
                onChange={(e) => update("societe", e.target.value)}
              />
            </div>
            <div className="col-12 mb-3">
              <label>{t("lettreInvitation")} *</label>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="lettreInvitation"
                  id="lettreOui"
                  checked={form.lettreInvitation === "OUI"}
                  onChange={() => update("lettreInvitation", "OUI")}
                />
                <label className="form-check-label" htmlFor="lettreOui">
                  {t("yes")}
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="lettreInvitation"
                  id="lettreNon"
                  checked={form.lettreInvitation === "NON"}
                  onChange={() => update("lettreInvitation", "NON")}
                />
                <label className="form-check-label" htmlFor="lettreNon">
                  {t("no")}
                </label>
              </div>
            </div>
          </div>
          <div className="text-center mt-4">
            <button
              type="button"
              className="btn btn-primary trapezoid"
              onClick={() => {
                if (validateStep(1)) setStep(2);
              }}
            >
              {t("next")}
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="form-step">
          <h3 className="text-center mb-4">{t("step2")}</h3>
          <div className="row">
            <div className="col-12 mb-4">
              <label htmlFor="typeAcces">{t("typeAcces")}{!isRDC ? " *" : ""}</label>
              <select
                id="typeAcces"
                className="form-select borderradius"
                value={form.typeAcces}
                onChange={(e) => update("typeAcces", e.target.value as FormState["typeAcces"])}
                required={!isRDC}
              >
                <option value="">{t("selectAccess")}</option>
                <option value="AEROPORT">{t("aeroport")}</option>
                <option value="BEACH">{t("beach")}</option>
              </select>
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="dateArrivee">{t("dateArrivee")}</label>
              <FormDatePicker
                id="dateArrivee"
                value={form.dateArrivee}
                locale={locale}
                placeholder={t("datePlaceholder")}
                onChange={(ymd) => {
                  update("dateArrivee", ymd);
                  if (
                    form.dateDepart &&
                    ymd &&
                    form.dateDepart < ymd
                  ) {
                    update("dateDepart", "");
                  }
                }}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="heureArrivee">{t("heureArrivee")}</label>
              <FormTimePicker
                id="heureArrivee"
                value={form.heureArrivee}
                locale={locale}
                placeholder={t("timePlaceholder")}
                onChange={(hm) => update("heureArrivee", hm)}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="dateDepart">{t("dateDepart")}</label>
              <FormDatePicker
                id="dateDepart"
                value={form.dateDepart}
                locale={locale}
                minDate={form.dateArrivee || undefined}
                placeholder={t("datePlaceholder")}
                onChange={(ymd) => update("dateDepart", ymd)}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="heureDepart">{t("heureDepart")}</label>
              <FormTimePicker
                id="heureDepart"
                value={form.heureDepart}
                locale={locale}
                placeholder={t("timePlaceholder")}
                onChange={(hm) => update("heureDepart", hm)}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="compagnieAerienne">{t("compagnieAerienne")}</label>
              <input
                id="compagnieAerienne"
                type="text"
                className="form-control borderradius"
                placeholder={t("compagniePlaceholder")}
                value={form.compagnieAerienne}
                onChange={(e) => update("compagnieAerienne", e.target.value)}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="numeroVol">{t("numeroVol")}</label>
              <input
                id="numeroVol"
                type="text"
                className="form-control borderradius"
                placeholder={t("volPlaceholder")}
                value={form.numeroVol}
                onChange={(e) => update("numeroVol", e.target.value)}
              />
            </div>
          </div>
          <div className="text-center mt-4">
            <button type="button" className="btn btn-secondary trapezoid" onClick={() => setStep(1)}>
              {t("back")}
            </button>
            <button
              type="button"
              className="btn btn-primary trapezoid"
              onClick={() => {
                if (validateStep(2)) setStep(3);
              }}
            >
              {t("next")}
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="form-step">
          <h3 className="text-center mb-4">{t("step3")}</h3>
          <div className="row">
            <div className="col-12 mb-3">
              <label htmlFor="hotel">{t("hotel")}{!isRDC ? " *" : ""}</label>
              <select
                id="hotel"
                className="form-select borderradius"
                value={form.hotel}
                onChange={(e) => {
                  update("hotel", e.target.value);
                  update("roomType", "");
                }}
                required={!isRDC}
              >
                <option value="">{t("selectHotel")}</option>
                {Object.entries(hotelCategories).map(([category, hotels]) => (
                  <optgroup key={category} label={category}>
                    {hotels.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div className="col-12 mb-3">
              <label htmlFor="room-type">{t("roomType")}{!isRDC ? " *" : ""}</label>
              <select
                id="room-type"
                className="form-select borderradius"
                value={form.roomType}
                onChange={(e) => update("roomType", e.target.value)}
                disabled={!form.hotel}
                required={!isRDC}
              >
                <option value="">{t("selectRoom")}</option>
                {roomOptions.map((room) => (
                  <option key={room} value={room}>
                    {room}
                  </option>
                ))}
              </select>
            </div>

            {hotelInfo && (
              <div className="col-12">
                <div className="hotel-details trapezoid-info">
                  <h5 className="text-white text-center">
                    <span className="icon-details" aria-hidden>
                      ✦
                    </span>
                    <span>{form.hotel}</span>
                  </h5>
                  <div className="hotel-details-grid text-white">
                    <p>
                      <strong>
                        <span className="icon-details" aria-hidden>
                          ★
                        </span>
                        {t("category")} :
                      </strong>{" "}
                      {hotelInfo.category}
                    </p>
                    <p>
                      <strong>
                        <span className="icon-details" aria-hidden>
                          ▤
                        </span>
                        {t("roomType")} :
                      </strong>{" "}
                      {form.roomType || "—"}
                    </p>
                    <p>
                      <strong>
                        <span className="icon-details" aria-hidden>
                          →
                        </span>
                        {t("distance")} :
                      </strong>{" "}
                      <span className="distance-pill">{hotelInfo.distance}</span>
                    </p>
                    <p>
                      <strong>
                        <span className="icon-details" aria-hidden>
                          $
                        </span>
                        {t("price")} :
                      </strong>{" "}
                      {roomPrice ? `${roomPrice} USD` : "—"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="text-center mt-4">
            <button type="button" className="btn btn-secondary trapezoid" onClick={() => setStep(2)}>
              {t("back")}
            </button>
            <button
              type="button"
              className="btn btn-success-2 trapezoid"
              disabled={submitting}
              onClick={handleSubmit}
            >
              {submitting ? t("submitting") : t("submit")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
