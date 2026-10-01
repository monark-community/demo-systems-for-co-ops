import type { Metadata } from "next"

import { CharterView } from "@/components/demo/charter-view"
import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"

export async function generateMetadata({ params }: PageProps<"/[locale]/app/charter">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const m = getDictionary(locale).meta.pages.charter
  return pageMetadata(locale, "/app/charter", m.title, m.description)
}

export default function Page() {
  return <CharterView />
}
