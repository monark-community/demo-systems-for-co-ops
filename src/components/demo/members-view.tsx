"use client"

import { BadgeCheckIcon, Loader2Icon, SearchIcon } from "lucide-react"
import Link from "next/link"
import { useId, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { WalletAddress, WalletAvatar } from "@/components/ui/wallet"
import { href } from "@/i18n/config"
import { t } from "@/i18n/t"
import { useTx } from "@/lib/demo/chain"
import { applyToJoin } from "@/lib/demo/ops"
import { stewards } from "@/lib/demo/rules"
import { useDemo } from "@/lib/demo/store"
import type { Application, DemoState, Member } from "@/lib/demo/types"
import { formatDate, formatPercent, formatToken } from "@/lib/format"
import { cn } from "@/lib/utils"

import { useAppCopy } from "./app-provider"
import { Disclaimer } from "./disclaimer"
import { membershipOf } from "./membership"
import { Seals } from "./seals"
import { TxFeedback } from "./tx-feedback"

export function MembersView() {
  const demo = useDemo()
  const { app, locale } = useAppCopy()
  const [q, setQ] = useState("")
  const searchId = useId()
  if (!demo) return null
  const M = app.members
  const query = q.trim().toLowerCase()
  const list = [...demo.members]
    .sort((a, b) => Number(!!b.isYou) - Number(!!a.isYou) || Number(!!b.steward) - Number(!!a.steward) || a.name.localeCompare(b.name))
    .filter((m) => !query || m.name.toLowerCase().includes(query) || m.address.toLowerCase().includes(query))
  const waiting = demo.applications.filter((a) => a.status === "waiting" && !a.isYou)

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-4xl font-extrabold tracking-display">{M.title}</h1>
        <p className="mt-2 max-w-[68ch] text-muted-foreground">{M.sub}</p>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <section aria-labelledby="committee-title" className="rounded-2xl border bg-card p-5">
          <h2 id="committee-title" className="text-xl font-bold">
            {M.committeeTitle}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{t(M.committeeBody, { date: formatDate(demo.charter.termEndsAt, locale) })}</p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">
            {stewards(demo).map((m) => (
              <li key={m.id} className="flex items-center gap-3 rounded-xl bg-secondary p-3 sm:flex-col sm:items-start">
                <WalletAvatar address={m.address} size={36} />
                <div className="min-w-0 leading-tight">
                  <p className="truncate font-bold">{m.name}</p>
                  <p className="text-xs font-semibold text-primary-ink">{m.steward ? app.stewardTitles[m.steward] : ""}</p>
                  <WalletAddress address={m.address} className="text-xs text-muted-foreground" />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <JoinPanel />
      </div>

      <section aria-labelledby="apps-title">
        <h2 id="apps-title" className="text-xl font-bold">
          {M.applications}
        </h2>
        {waiting.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">{M.noApplications}</p>
        ) : (
          <ul className="mt-3 grid gap-3 md:grid-cols-2">
            {waiting.map((a) => (
              <ApplicationRow key={a.id} a={a} demo={demo} />
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="dir-title" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="dir-title" className="text-xl font-bold">
              {M.directory}
            </h2>
            <p className="text-sm text-muted-foreground">{t(M.count, { n: demo.members.length })}</p>
          </div>
          <div className="relative w-full sm:w-72">
            <label htmlFor={searchId} className="sr-only">
              {M.search}
            </label>
            <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input id={searchId} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={M.searchPh} className="pl-10" />
          </div>
        </div>
        {list.length === 0 ? (
          <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">{t(M.noMatch, { q })}</p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {list.map((m) => (
              <MemberRow key={m.id} m={m} />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function MemberRow({ m }: { m: Member }) {
  const { app, locale } = useAppCopy()
  const M = app.members
  const share = m.votesOpen ? m.votesCast / m.votesOpen : 0
  const proposals = m.proposalsMade === 0 ? M.proposals0 : m.proposalsMade === 1 ? M.proposals1 : t(M.proposals, { n: m.proposalsMade })
  return (
    <li className={cn("flex gap-3 rounded-2xl border bg-card p-3.5", m.isYou && "border-2 border-primary")}>
      <WalletAvatar address={m.address} size={36} />
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-x-2 leading-tight">
          <span className="truncate font-bold">
            {m.name}
            {m.isYou ? <span className="font-semibold text-muted-foreground"> ({app.you})</span> : null}
          </span>
          {m.steward ? <span className="text-xs font-semibold text-primary-ink">{app.stewardTitles[m.steward]}</span> : null}
        </p>
        <WalletAddress address={m.address} className="text-xs text-muted-foreground" />
        <div className="mt-2 flex items-center gap-2" title={M.participation}>
          <span className="h-1.5 flex-1 rounded-full bg-secondary" aria-hidden="true">
            <span className="block h-full rounded-full bg-foreground/70" style={{ width: `${Math.round(share * 100)}%` }} />
          </span>
          <span className="text-xs text-muted-foreground">
            <span className="sr-only">{M.participation}: </span>
            {m.votesOpen ? `${t(M.participationValue, { cast: m.votesCast, open: m.votesOpen })} · ${formatPercent(share, locale)}` : "—"}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {proposals} · {t(M.since, { date: formatDate(m.joinedAt, locale) })}
          {m.pastRoles.length ? ` · ${m.pastRoles.join(", ")}` : ""}
        </p>
      </div>
    </li>
  )
}

function ApplicationRow({ a, demo }: { a: Application; demo: DemoState }) {
  const { app } = useAppCopy()
  return (
    <li className="flex flex-col gap-2 rounded-2xl border bg-card p-4">
      <div className="flex items-center gap-3">
        <WalletAvatar address={a.address} size={32} />
        <div className="min-w-0 leading-tight">
          <p className="font-bold">{a.name}</p>
          <WalletAddress address={a.address} className="text-xs text-muted-foreground" />
        </div>
        <span className="ml-auto shrink-0 rounded-full bg-secondary px-2.5 py-1 text-xs font-bold">
          {t(app.members.waiting, { n: a.signatures.length, m: demo.charter.committeeThreshold })}
        </span>
      </div>
      {a.note ? <p className="text-sm text-muted-foreground">“{a.note}”</p> : null}
    </li>
  )
}

function JoinPanel() {
  const demo = useDemo()
  const { app, locale, disclaimer } = useAppCopy()
  const [name, setName] = useState("")
  const [note, setNote] = useState("")
  const [error, setError] = useState<string | null>(null)
  const tx = useTx()
  const uid = useId()
  if (!demo) return null
  const J = app.members.join
  const S = app.summaries
  const { status, me, application } = membershipOf(demo)
  const share = demo.charter.memberShare
  const displayName = name || demo.wallet.name

  if (status === "member" && me) {
    const n = demo.members.findIndex((m) => m.isYou) + 1
    const firstOpen = demo.proposals.find((p) => p.status === "voting" && !p.votes["m-you"])
    return (
      <section id="join" aria-labelledby="welcome-title" className="cd-rise scroll-mt-28 rounded-2xl border-2 border-success bg-card p-5">
        <BadgeCheckIcon className="size-7 text-success" aria-hidden="true" />
        <h2 id="welcome-title" className="mt-2 text-xl font-bold">
          {t(J.welcome, { n })}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {J.welcomeBody} {t(app.membership.memberSince, { date: formatDate(me.joinedAt, locale) })}.
        </p>
        {firstOpen ? (
          <Button asChild className="mt-4 w-full">
            <Link href={href(locale, `/app/proposals/${firstOpen.id}`)}>{J.goVote}</Link>
          </Button>
        ) : null}
      </section>
    )
  }

  if (status === "applying" && application) {
    const items = stewards(demo).map((m) => ({
      id: m.id,
      name: m.name.split(" ")[0] ?? m.name,
      title: m.steward ? app.stewardTitles[m.steward] : "",
      signed: application.signatures.includes(m.id),
    }))
    return (
      <section id="join" aria-labelledby="wait-title" className="scroll-mt-28 rounded-2xl border-2 border-primary bg-card p-5">
        <h2 id="wait-title" className="text-xl font-bold">
          {J.waitingTitle}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{J.waitingBody}</p>
        <p className="mt-3 text-sm font-semibold" aria-live="polite">
          {t(app.members.waiting, { n: application.signatures.length, m: demo.charter.committeeThreshold })}
        </p>
        <Seals items={items} signedLabel={app.proposal.committee.signed} notSignedLabel={app.proposal.committee.notSigned} className="mt-4" />
        <TxFeedback state={tx.state} confirmedLabel={J.confirmed} className="mt-4" />
      </section>
    )
  }

  const insufficient = demo.wallet.balance < share
  const submit = () => {
    const n = displayName.trim()
    if (n.length < 2) {
      setError(J.nameError)
      return
    }
    if (insufficient) {
      setError(J.funds)
      return
    }
    setError(null)
    void tx.run(
      {
        title: S.join,
        rows: [
          { label: S.joinShare, value: formatToken(share, locale) },
          { label: S.joinTo, value: S.treasury },
        ],
        movesValue: true,
      },
      (hash) => {
        applyToJoin(n, note.trim(), hash)
        toast.success(app.toasts.applied)
      }
    )
  }

  return (
    <section id="join" aria-labelledby="join-title" className="scroll-mt-28 rounded-2xl border-2 border-primary bg-card p-5">
      <h2 id="join-title" className="text-xl font-bold">
        {J.title}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{J.body}</p>
      <form
        noValidate
        className="mt-4 flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
      >
        <div>
          <label htmlFor={`${uid}-name`} className="text-sm font-bold">
            {J.name}
          </label>
          <Input
            id={`${uid}-name`}
            value={displayName}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={error === J.nameError || undefined}
            className="mt-1.5"
            autoComplete="name"
          />
        </div>
        <div>
          <label htmlFor={`${uid}-note`} className="text-sm font-bold">
            {J.note}
          </label>
          <textarea
            id={`${uid}-note`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={J.notePh}
            rows={2}
            className="mt-1.5 w-full rounded-2xl border border-input bg-card px-4 py-2.5 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 md:text-sm"
          />
        </div>
        <dl className="divide-y rounded-xl border text-sm">
          <div className="flex items-center justify-between gap-3 px-3.5 py-2.5">
            <dt>
              <span className="font-semibold">{J.share}</span>
              <span className="block text-xs text-muted-foreground">{J.refundable}</span>
            </dt>
            <dd className="font-mono font-bold">{formatToken(share, locale)}</dd>
          </div>
          <div className="flex items-center justify-between gap-3 px-3.5 py-2 text-xs text-muted-foreground">
            <dt>{J.balance}</dt>
            <dd className="font-mono">{formatToken(demo.wallet.balance, locale)}</dd>
          </div>
        </dl>
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <Button type="submit" size="lg" disabled={tx.busy}>
          {tx.busy ? <Loader2Icon className="animate-spin" aria-hidden="true" /> : null}
          {tx.busy ? J.pending : J.submit}
        </Button>
        <Disclaimer text={disclaimer} />
        <TxFeedback state={tx.state} pendingLabel={J.pending} confirmedLabel={J.confirmed} onRetry={submit} onDismiss={tx.reset} />
      </form>
    </section>
  )
}
