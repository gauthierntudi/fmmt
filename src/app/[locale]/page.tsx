import { setRequestLocale } from "next-intl/server";
import { RegistrationPageView } from "@/components/registration/RegistrationPageView";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <RegistrationPageView />;
}
