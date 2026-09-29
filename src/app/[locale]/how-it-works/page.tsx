import { ArrowRightIcon, BoxesIcon } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { GridLegend, MemberGrid, type DotKind } from "@/components/demo/member-grid"
import { Seals } from "@/components/demo/seals"
import { LifecycleDiagram } from "@/components/diagrams/lifecycle-diagram"
import { SectionDivider } from "@/components/site/section-divider"
import { Button } from "@/components/ui/button"
import { href, isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { formatPercent } from "@/lib/format"
import { pageMetadata } from "@/lib/metadata"

export async function generateMetadata({ params }: PageProps<"/[locale]/how-it-works">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const m = getDictionary(locale).meta.pages.how
  return pageMetadata(locale, "/how-it-works", m.title, m.description)
}

// 34 members, 16 voted (11 for, 3 against, 2 abstain), quorum 14: reached.
const GRID: DotKind[] = [
  ...Array<DotKind>(11).fill("for"),
  ...Array<DotKind>(3).fill("against"),
  ...Array<DotKind>(2).fill("abstain"),
  ...Array<DotKind>(18).fill("none"),
]

export default async function HowItWorksPage({ params }: PageProps<"/[locale]/how-it-works">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = getDictionary(locale)
  const h = dict.how
  const card = dict.home.card
  const app = dict.app
  const seals = [
    { id: "a", name: "Amara", title: app.stewardTitles.treasurer, signed: true },
    { id: "t", name: "Théo", title: app.stewardTitles.coordinator, signed: true },
    { id: "p", name: "Priya", title: app.stewardTitles.secretary, signed: false },
  ]

  return (
    <div className="flex flex-col">
      <header className="mx-auto w-full max-w-6xl px-4 pt-12 pb-10 sm:px-6 lg:pt-16">
        <p className="eyebrow text-primary-ink">{h.eyebrow}</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-display sm:text-5xl">{h.title}</h1>
        <p className="mt-4 max-w-[68ch] text-lg text-muted-foreground">{h.intro}</p>
      </header>

      <section aria-labelledby="life-title" className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
        <div className="rounded-3xl border bg-card p-6 sm:p-8">
          <h2 id="life-title" className="text-2xl font-bold">
            {h.lifecycle.title}
          </h2>
          <div className="mt-8">
            <LifecycleDiagram steps={h.lifecycle.steps} label={h.lifecycle.label} />
          </div>
        </div>
      </section>

      <SectionDivider />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 py-16 sm:px-6 lg:py-20">
        {h.sections.map((s) => (
          <section key={s.id} id={s.id} aria-labelledby={`${s.id}-title`} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-16">
            <div>
              <h2 id={`${s.id}-title`} className="text-3xl font-bold tracking-display">
                {s.title}
              </h2>
              <div className="mt-4 flex max-w-[68ch] flex-col gap-4 text-muted-foreground">
                {s.body.map((para) => (
                  <p key={para}>{para}</p>
                ))}
              </div>
            </div>
            {s.id === "one-member" ? (
              <div className="self-start rounded-3xl border bg-card p-6">
                <MemberGrid dots={GRID} quorum={14} quorumLabel={card.quorum} label={card.members} />
                <p className="mt-4 text-xs text-muted-foreground">{card.members}</p>
                <GridLegend labels={card.legend} quorum={card.quorum} className="mt-3" />
              </div>
            ) : s.id === "committee" ? (
              <div className="self-start rounded-3xl border bg-card p-6">
                <Seals items={seals} signedLabel={app.proposal.committee.signed} notSignedLabel={app.proposal.committee.notSigned} />
                <p className="mt-5 text-sm font-semibold text-success">{app.proposal.committee.done}</p>
              </div>
            ) : s.id === "charter" ? (
              <div className="self-start rounded-3xl border bg-card p-6 text-sm">
                <p className="eyebrow text-muted-foreground">{app.charter.historyTitle}</p>
                <p className="mt-3 font-semibold">{app.charter.rules.committeeLimit.name}</p>
                <p className="mt-1 font-mono">
                  300 tUSDC <span aria-hidden="true">→</span> <span className="font-bold text-primary-ink">500 tUSDC</span>
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {app.status.enacted} · {formatPercent(0.86, locale)}
                </p>
              </div>
            ) : (
              <div aria-hidden="true" className="hidden lg:block" />
            )}
          </section>
        ))}
      </div>

      <section aria-labelledby="dev-title" className="bg-secondary/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <h2 id="dev-title" className="flex items-center gap-3 text-3xl font-bold tracking-display">
            <BoxesIcon className="size-7 text-primary" aria-hidden="true" />
            {h.dev.title}
          </h2>
          <p className="mt-3 max-w-[68ch] text-muted-foreground">{h.dev.body}</p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {h.dev.modules.map((m) => (
              <li key={m.name} className="rounded-2xl border bg-card p-5">
                <p className="font-mono text-sm font-bold">{m.name}</p>
                <p className="mt-2 text-sm text-muted-foreground">{m.body}</p>
              </li>
            ))}
          </ul>
          <p className="mt-6 rounded-2xl border border-dashed bg-card px-4 py-3 font-mono text-xs text-muted-foreground sm:text-sm">{h.dev.code}</p>
        </div>
      </section>

      <section aria-labelledby="how-cta" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex flex-col items-start gap-6 rounded-3xl border bg-card p-8 sm:p-10 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 id="how-cta" className="text-2xl font-bold tracking-display sm:text-3xl">
              {h.cta.title}
            </h2>
            <p className="mt-2 text-muted-foreground">{h.cta.body}</p>
          </div>
          <Button asChild size="lg" className="shrink-0">
            <Link href={href(locale, "/app")}>
              {h.cta.button}
              <ArrowRightIcon aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
