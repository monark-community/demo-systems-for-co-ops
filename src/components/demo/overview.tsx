"use client"

import { ArrowRightIcon, PlusIcon, UserPlusIcon } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription } from "@/components/ui/empty"
import { InfoTip } from "@/components/ui/info-tip"
import { Stat, StatGroup, StatHint, StatLabel, StatValue } from "@/components/ui/stat"
import { href } from "@/i18n/config"
import { t } from "@/i18n/t"
import { available, isExecutable, isOpen, treasuryBalance } from "@/lib/demo/rules"
import { useDemo } from "@/lib/demo/store"
import { formatAmount, formatDate, formatPercent, formatToken } from "@/lib/format"

import { ActivityFeed } from "./activity-feed"
import { useAppCopy } from "./app-provider"
import { MembershipChip, membershipOf } from "./membership"
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

  const stats: { label: string; value: string; unit?: string; hint?: string; info?: string }[] = [
    { label: o.balance, value: formatAmount(treasuryBalance(demo), locale), unit: "tUSDC" },
    { label: o.available, value: formatAmount(available(demo), locale), unit: "tUSDC", info: o.availableHint },
    { label: o.members, value: String(demo.members.length) },
    { label: o.openVotes, value: String(votes.length), hint: status === "member" ? `${o.needsYou}: ${waitingForYou}` : undefined },
  ]

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-extrabold tracking-display">{o.title}</h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-muted-foreground">
            {o.sub}
            <MembershipChip />
          </p>
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

      <StatGroup className="grid-cols-2">
        {stats.map((s) => (
          <Stat key={s.label}>
            <StatLabel>
              {s.label}
              {s.info ? <InfoTip label={`${app.info}: ${s.label}`}>{s.info}</InfoTip> : null}
            </StatLabel>
            <StatValue className="items-baseline gap-x-1.5 gap-y-0">
              {s.value}
              {s.unit ? <span className="text-xs font-normal tracking-normal text-muted-foreground">{s.unit}</span> : null}
            </StatValue>
            {s.hint ? <StatHint>{s.hint}</StatHint> : null}
          </Stat>
        ))}
      </StatGroup>

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
            <Empty size="sm">
              <EmptyDescription>{app.proposals.empty}</EmptyDescription>
            </Empty>
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
              <ActivityFeed demo={demo} limit={5} />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
