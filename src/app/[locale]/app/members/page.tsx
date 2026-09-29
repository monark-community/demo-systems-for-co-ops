import type { Metadata } from "next"

import { MembersView } from "@/components/demo/members-view"
import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"

export async function generateMetadata({ params }: PageProps<"/[locale]/app/members">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const m = getDictionary(locale).meta.pages.members
  return pageMetadata(locale, "/app/members", m.title, m.description)
}

export default function Page() {
  return <MembersView />
}
