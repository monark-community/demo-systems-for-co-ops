"use client"

import { ChevronRightIcon } from "lucide-react"
import Link from "next/link"

import { href } from "@/i18n/config"
import { t } from "@/i18n/t"
import { tally } from "@/lib/demo/rules"
import type { DemoState, Proposal } from "@/lib/demo/types"
import { formatDate, formatRelative, formatToken } from "@/lib/format"
import { cn } from "@/lib/utils"

import { useAppCopy } from "./app-provider"
import { charterValue, dotsFor, memberName, StatusBadge, youIndex } from "./labels"
import { MemberGrid } from "./member-grid"

export function ProposalCard({ p, demo, className }: { p: Proposal; demo: DemoState; className?: string }) {
  const { app, locale } = useAppCopy()
  const L = app.proposals
  const tl = tally(p, demo.charter)
  const link = href(locale, `/app/proposals/${p.id}`)
  const isVote = p.route !== "committee"
  const mine = p.votes["m-you"]

  return (
    <article className={cn("group relative flex flex-col gap-3 rounded-2xl border bg-card p-4 transition-colors hover:border-input sm:p-5", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge p={p} app={app} />
        <span className="text-xs font-semibold text-muted-foreground">{app.routes[p.route]}</span>
      </div>
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 text-base font-bold leading-snug sm:text-lg">
          <Link href={link} className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none">
            <span className="text-muted-foreground">#{p.number} </span>
            {p.title}
          </Link>
        </h3>
        <ChevronRightIcon className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </div>
      <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
        {p.amount ? <span className="font-mono font-bold tabular-nums">{formatToken(p.amount, locale)}</span> : null}
        {p.change ? (
          <span className="font-semibold">
            {app.charter.rules[p.change.key].name}: {charterValue(p.change.key, p.change.from, app, locale)} → {charterValue(p.change.key, p.change.to, app, locale)}
          </span>
        ) : null}
        <span className="text-muted-foreground">{t(L.by, { name: memberName(demo, p.authorId, app) })}</span>
      </p>
      {isVote ? (
        <div className="flex flex-col gap-2">
          <MemberGrid dots={dotsFor(p)} quorum={tl.quorumNeeded} youIndex={youIndex(p)} size="sm" label={t(app.proposal.grid.label, { cast: tl.cast, electorate: tl.electorate, needed: tl.quorumNeeded })} className="gap-1 sm:gap-1" />
          <p className="flex flex-wrap gap-x-3 text-xs text-muted-foreground">
            <span>{t(L.votes, { cast: tl.cast, electorate: tl.electorate })}</span>
            {p.status === "voting" && p.closesAt ? <span>{t(L.closes, { when: formatRelative(p.closesAt, locale) })}</span> : null}
            {p.status !== "voting" && p.closedAt ? <span>{t(L.closed, { date: formatDate(p.closedAt, locale) })}</span> : null}
            {p.status === "voting" ? (
              <span className={mine ? "font-semibold text-foreground" : ""}>{mine ? t(app.overview.yourVote, { choice: app.choices[mine].toLowerCase() }) : app.overview.notVoted}</span>
            ) : null}
          </p>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          {t(L.signatures, { n: p.signatures.length, m: demo.charter.committeeThreshold })}
        </p>
      )}
    </article>
  )
}
