import type { Metadata } from "next"

import { TreasuryView } from "@/components/demo/treasury-view"
import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"

export async function generateMetadata({ params }: PageProps<"/[locale]/app/treasury">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const m = getDictionary(locale).meta.pages.treasury
  return pageMetadata(locale, "/app/treasury", m.title, m.description)
}

export default function Page() {
  return <TreasuryView />
}
