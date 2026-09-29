import type { Metadata } from "next"

import { ProposalList } from "@/components/demo/proposal-list"
import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"

export async function generateMetadata({ params }: PageProps<"/[locale]/app/proposals">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const m = getDictionary(locale).meta.pages.proposals
  return pageMetadata(locale, "/app/proposals", m.title, m.description)
}

export default function Page() {
  return <ProposalList />
}
