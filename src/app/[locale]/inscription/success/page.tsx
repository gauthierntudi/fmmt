import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ prenom?: string; emailSent?: string }>;
};

export default async function SuccessPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { prenom = "", emailSent } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("Success");
  const name = prenom.trim() || "—";
  const mailOk = emailSent !== "false";

  return (
    <main>
      <div
        className="td-breadcrumb-area"
        style={{ backgroundImage: "url(/img/fest09.jpg)" }}
      >
        <div className="breadcrumb-overlay" />
        <div className="container">
          <div className="td-breadcrumb-title-wrap">
            <h2 className="td-breadcrumb-title">{t("title")}</h2>
            <div className="td-breadcrumb-list">
              <ul>
                <li className="pages">{t("crumb")}</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="gif-mask-2" aria-hidden>
          <Image
            src="/img/mask-about.gif"
            alt=""
            width={1920}
            height={80}
            unoptimized
            style={{ width: "100%", height: "auto", display: "block" }}
          />
        </div>
      </div>

      <div className="container register-form-wrap">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <section className="success-panel" aria-labelledby="success-heading">
              <div className="success-mark" aria-hidden>
                <svg viewBox="0 0 48 48" width="48" height="48" fill="none">
                  <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2.5" />
                  <path
                    d="M14 24.5L21 31.5L34 17"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <h1 id="success-heading" className="success-heading">
                {t("heading", { prenom: name })}
              </h1>
              <p className="success-lead">{t("lead")}</p>

              <ul className="success-steps">
                <li>
                  <span className="success-step-label">{t("stepRegistered")}</span>
                  <span className="success-step-status ok">{t("done")}</span>
                </li>
                <li>
                  <span className="success-step-label">{t("stepEmail")}</span>
                  <span className={`success-step-status ${mailOk ? "ok" : "warn"}`}>
                    {mailOk ? t("emailSent") : t("emailPendingStatus")}
                  </span>
                </li>
                <li>
                  <span className="success-step-label">{t("stepContact")}</span>
                  <span className="success-step-status soon">{t("upcoming")}</span>
                </li>
              </ul>

              {!mailOk && <p className="success-note">{t("emailNote")}</p>}

              <div className="success-actions">
                <Link href="/" className="btn btn-success-2 trapezoid">
                  {t("newRegistration")}
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
