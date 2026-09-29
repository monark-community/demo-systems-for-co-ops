"use client"

import { LockIcon, PencilLineIcon } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { href } from "@/i18n/config"
import { t } from "@/i18n/t"
import { useDemo } from "@/lib/demo/store"
import type { CharterKey } from "@/lib/demo/types"
import { formatDate, formatPercent, shortHash } from "@/lib/format"

import { useAppCopy } from "./app-provider"
import { charterValue } from "./labels"
import { membershipOf } from "./membership"

export function CharterView() {
  const demo = useDemo()
  const { app, locale } = useAppCopy()
  if (!demo) return null
  const C = app.charter
  const R = C.rules
  const c = demo.charter
  const member = membershipOf(demo).status === "member"
  const newHref = (key: CharterKey) => href(locale, `/app/proposals/new?kind=charter&rule=${key}`)

  const rows: { key: CharterKey | null; name: string; text: string }[] = [
    { key: "memberShare", name: R.memberShare.name, text: t(R.memberShare.text, { value: charterValue("memberShare", c.memberShare, app, locale) }) },
    { key: "quorum", name: R.quorum.name, text: t(R.quorum.text, { value: charterValue("quorum", c.quorum, app, locale) }) },
    { key: "votingDays", name: R.votingDays.name, text: t(R.votingDays.text, { value: charterValue("votingDays", c.votingDays, app, locale) }) },
    { key: "committeeLimit", name: R.committeeLimit.name, text: t(R.committeeLimit.text, { value: charterValue("committeeLimit", c.committeeLimit, app, locale) }) },
    { key: null, name: R.committee.name, text: t(R.committee.text, { n: c.committeeThreshold, m: c.committeeSize, date: formatDate(c.termEndsAt, locale) }) },
    { key: null, name: R.supermajority.name, text: t(R.supermajority.text, { value: formatPercent(c.charterQuorum / 100, locale) }) },
    { key: null, name: R.oneVote.name, text: R.oneVote.text },
  ]

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-display">{C.title}</h1>
          <p className="mt-2 max-w-[68ch] text-muted-foreground">{C.sub}</p>
        </div>
        {member ? (
          <Button asChild size="lg" className="shrink-0">
            <Link href={newHref("committeeLimit")}>
              <PencilLineIcon aria-hidden="true" />
              {C.propose}
            </Link>
          </Button>
        ) : null}
      </header>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <ol className="flex flex-col overflow-hidden rounded-3xl border bg-card">
          {rows.map((r, i) => (
            <li key={r.name} className="flex flex-col gap-2 border-b p-5 last:border-b-0 sm:flex-row sm:items-center sm:gap-6">
              <span className="font-mono text-sm font-bold text-primary-ink sm:w-8">§{i + 1}</span>
              <div className="min-w-0 flex-1">
                <h2 className="font-bold">{r.name}</h2>
                <p className="mt-0.5 text-muted-foreground">{r.text}</p>
              </div>
              {r.key && member ? (
                <Button asChild size="sm" variant="outline" className="self-start sm:self-center">
                  <Link href={newHref(r.key)} aria-label={`${C.propose}: ${r.name}`}>
                    {C.propose}
                  </Link>
                </Button>
              ) : !r.key ? (
                <span className="inline-flex items-center gap-1 self-start text-xs font-semibold text-muted-foreground sm:self-center">
                  <LockIcon className="size-3.5" aria-hidden="true" />
                  {C.fixed}
                </span>
              ) : null}
            </li>
          ))}
        </ol>

        <section aria-labelledby="hist-title" className="rounded-2xl border bg-card p-5">
          <h2 id="hist-title" className="text-lg font-bold">
            {C.historyTitle}
          </h2>
          {demo.charterHistory.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">{C.noHistory}</p>
          ) : (
            <ol className="mt-3 flex flex-col gap-4">
              {demo.charterHistory.map((h) => {
                const p = demo.proposals.find((x) => x.id === h.proposalId)
                return (
                  <li key={h.id} className="border-l-2 border-primary pl-3">
                    <p className="text-sm font-semibold">
                      {t(C.historyItem, { rule: R[h.key].name, from: charterValue(h.key, h.from, app, locale), to: charterValue(h.key, h.to, app, locale) })}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatDate(h.at, locale)} ·{" "}
                      {p ? (
                        <Link href={href(locale, `/app/proposals/${p.id}`)} className="font-semibold text-primary-ink underline underline-offset-2">
                          {t(C.historyBy, { n: p.number })}
                        </Link>
                      ) : null}
                    </p>
                    <p className="mt-0.5 font-mono text-xs text-muted-foreground" title={h.hash}>
                      {shortHash(h.hash)}
                    </p>
                  </li>
                )
              })}
            </ol>
          )}
        </section>
      </div>
    </div>
  )
}
