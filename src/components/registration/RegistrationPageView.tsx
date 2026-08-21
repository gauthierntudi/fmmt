import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { RegistrationWizard } from "@/components/registration/RegistrationWizard";
import { getTurnstileSiteKey, isTurnstileEnabled } from "@/lib/turnstile";

export async function RegistrationPageView() {
  const t = await getTranslations("Register");
  const turnstileEnabled = isTurnstileEnabled();
  const turnstileSiteKey = turnstileEnabled ? getTurnstileSiteKey() : "";

  return (
    <main>
      <div
        className="td-breadcrumb-area"
        style={{ backgroundImage: "url(/img/fest09.jpg)" }}
      >
        <div className="breadcrumb-overlay" />
        <div className="container">
          <div className="td-breadcrumb-title-wrap">
            <h2 className="td-breadcrumb-title">{t("heroTitle")}</h2>
            <div className="td-breadcrumb-list">
              <ul>
                <li className="pages">{t("title")}</li>
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
            <RegistrationWizard
              turnstileEnabled={turnstileEnabled}
              turnstileSiteKey={turnstileSiteKey}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
