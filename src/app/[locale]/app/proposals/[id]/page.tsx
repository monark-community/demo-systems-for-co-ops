import type { Metadata } from "next"

import { ProposalView } from "@/components/demo/proposal-view"
import { isLocale, locales } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { SEED_PROPOSAL_IDS } from "@/lib/demo/seed"
import { pageMetadata } from "@/lib/metadata"

// Seeded proposals are prerendered; proposals created in the browser render on demand
// (the page is a client shell that reads the proposal from local demo state).
export function generateStaticParams() {
  return locales.flatMap((locale) => SEED_PROPOSAL_IDS.map((id) => ({ locale, id })))
}

export async function generateMetadata({ params }: PageProps<"/[locale]/app/proposals/[id]">): Promise<Metadata> {
  const { locale, id } = await params
  if (!isLocale(locale)) return {}
  const m = getDictionary(locale).meta.pages.proposal
  return { ...pageMetadata(locale, `/app/proposals/${id}`, m.title, m.description), robots: { index: false, follow: true } }
}

export default async function ProposalPage({ params }: PageProps<"/[locale]/app/proposals/[id]">) {
  const { id } = await params
  return <ProposalView id={id} />
}
