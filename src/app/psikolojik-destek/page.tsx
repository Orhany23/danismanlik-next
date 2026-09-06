import type { Metadata } from "next";
import SupportPageClient from "@/components/SupportPageClient";

export const metadata: Metadata = {
  title: "Denge — Psikolojik Destek Rehberi | Orhan Yaşlı",
  description:
    "Anlık ruh hali için yargılamayan öneriler, özel bir günlük alanı ve 5-4-3-2-1 farkındalık egzersizi. Genel bilgilendirme amaçlıdır; tanı veya tedavi değildir.",
  alternates: { canonical: "/psikolojik-destek" },
  openGraph: {
    title: "Denge — Psikolojik Destek Rehberi",
    description:
      "Anlık ruh hali için yargılamayan öneriler, özel bir günlük alanı ve 5-4-3-2-1 farkındalık egzersizi.",
    type: "website",
    url: "/psikolojik-destek",
  },
};

export default function PsikolojikDestekPage() {
  return <SupportPageClient />;
}
