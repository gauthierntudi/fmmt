import Image from "next/image";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as "fr" | "en")) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <header className="legacy-topnav">
        <Link href="/" className="brand">
          <Image
            src={locale === "en" ? "/img/logo-en-01.png" : "/img/logo-fr-01.png"}
            alt="FMMT"
            width={140}
            height={48}
            style={{ height: 48, width: "auto" }}
            priority
          />
        </Link>
        <div className="topnav-actions">
          <LanguageSwitcher />
        </div>
      </header>
      {children}
    </NextIntlClientProvider>
  );
}
