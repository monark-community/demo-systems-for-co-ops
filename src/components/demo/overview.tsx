"use client"

import { ArrowRightIcon, PlusIcon, UserPlusIcon } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { href } from "@/i18n/config"
import { t } from "@/i18n/t"
import { available, isExecutable, isOpen, treasuryBalance } from "@/lib/demo/rules"
import { useDemo } from "@/lib/demo/store"
import { formatAmount, formatDate, formatPercent, formatToken } from "@/lib/format"

import { ActivityFeed } from "./activity-feed"
import { useAppCopy } from "./app-provider"
import { membershipOf } from "./membership"
import { ProposalCard } from "./proposal-card"

export function Overview() {
  const demo = useDemo()
  const { app, locale } = useAppCopy()
  if (!demo) return null
  const o = app.overview
  const { status } = membershipOf(demo)
  const open = demo.proposals.filter((p) => isOpen(p) || isExecutable(p))
  const votes = demo.proposals.filter((p) => p.status === "voting")
  const waitingForYou = status === "member" ? votes.filter((p) => !p.votes["m-you"]).length : 0
  const c = demo.charter
  const rules = app.charter.rules

  const stats = [
    { label: o.balance, value: formatAmount(treasuryBalance(demo), locale), unit: "tUSDC" },
    { label: o.available, value: formatAmount(available(demo), locale), unit: "tUSDC", hint: o.availableHint },
    { label: o.members, value: String(demo.members.length) },
    { label: o.openVotes, value: String(votes.length), hint: status === "member" ? `${o.needsYou}: ${waitingForYou}` : undefined },
  ]

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="eyebrow text-primary-ink">{o.eyebrow}</p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-display">{o.title}</h1>
          <p className="mt-2 text-muted-foreground">{o.sub}</p>
        </div>
        {status === "member" ? (
          <Button asChild size="lg" className="shrink-0">
            <Link href={href(locale, "/app/proposals/new")}>
              <PlusIcon aria-hidden="true" />
              {o.newProposal}
            </Link>
          </Button>
        ) : status === "visitor" ? (
          <Button asChild size="lg" className="shrink-0">
            <Link href={href(locale, "/app/members#join")}>
              <UserPlusIcon aria-hidden="true" />
              {app.membership.join}
            </Link>
          </Button>
        ) : null}
      </header>

      {status !== "member" ? (
        <p className="rounded-2xl border border-dashed px-4 py-3 text-sm">
          {status === "visitor" ? app.membership.visitorBody : app.proposal.vote.applying}
        </p>
      ) : null}

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border bg-card p-4">
            <dt className="text-xs font-semibold text-muted-foreground">{s.label}</dt>
            <dd className="mt-1 flex flex-wrap items-baseline gap-x-1.5">
              <span className="font-mono text-xl font-bold tabular-nums tracking-tight sm:text-2xl">{s.value}</span>
              {s.unit ? <span className="text-xs text-muted-foreground">{s.unit}</span> : null}
            </dd>
            {s.hint ? <dd className="mt-1 text-xs text-muted-foreground">{s.hint}</dd> : null}
          </div>
        ))}
      </dl>

      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <section aria-labelledby="open-title" className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <h2 id="open-title" className="text-xl font-bold">
              {o.openTitle}
            </h2>
            <Link href={href(locale, "/app/proposals")} className="inline-flex items-center gap-1 text-sm font-bold text-primary-ink underline underline-offset-4">
              {o.allProposals}
              <ArrowRightIcon className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
          {open.length === 0 ? (
            <p className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">{app.proposals.empty}</p>
          ) : (
            <div className="flex flex-col gap-3">
              {open.map((p) => (
                <ProposalCard key={p.id} p={p} demo={demo} />
              ))}
            </div>
          )}
        </section>

        <div className="flex flex-col gap-8">
          <section aria-labelledby="rules-title" className="rounded-2xl border bg-card p-5">
            <h2 id="rules-title" className="text-lg font-bold">
              {o.charterTitle}
            </h2>
            <ul className="mt-3 flex flex-col divide-y text-sm">
              <li className="flex justify-between gap-3 py-2">
                <span className="text-muted-foreground">{rules.oneVote.name}</span>
                <span className="text-right font-semibold">{app.charter.rules.oneVote.text}</span>
              </li>
              <li className="flex justify-between gap-3 py-2">
                <span className="text-muted-foreground">{rules.committeeLimit.name}</span>
                <span className="font-mono font-semibold">{formatToken(c.committeeLimit, locale)}</span>
              </li>
              <li className="flex justify-between gap-3 py-2">
                <span className="text-muted-foreground">{rules.quorum.name}</span>
                <span className="font-semibold">{formatPercent(c.quorum / 100, locale)}</span>
              </li>
              <li className="flex justify-between gap-3 py-2">
                <span className="text-muted-foreground">{rules.votingDays.name}</span>
                <span className="font-semibold">{t(app.charter.days, { n: c.votingDays })}</span>
              </li>
              <li className="flex justify-between gap-3 py-2">
                <span className="text-muted-foreground">{rules.memberShare.name}</span>
                <span className="font-mono font-semibold">{formatToken(c.memberShare, locale)}</span>
              </li>
              <li className="flex justify-between gap-3 py-2">
                <span className="text-muted-foreground">{rules.committee.name}</span>
                <span className="text-right font-semibold">
                  {c.committeeThreshold}/{c.committeeSize} · {formatDate(c.termEndsAt, locale)}
                </span>
              </li>
            </ul>
            <Link href={href(locale, "/app/charter")} className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-primary-ink underline underline-offset-4">
              {o.charterLink}
              <ArrowRightIcon className="size-3.5" aria-hidden="true" />
            </Link>
          </section>

          <section aria-labelledby="activity-title">
            <h2 id="activity-title" className="text-lg font-bold">
              {o.activityTitle}
            </h2>
            <div className="mt-2">
              <ActivityFeed demo={demo} limit={7} />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
