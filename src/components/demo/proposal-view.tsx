"use client"

import { ArrowLeftIcon, FastForwardIcon, Loader2Icon, UserPlusIcon } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { InfoTip } from "@/components/ui/info-tip"
import { TokenAmount } from "@/components/ui/token-amount"
import { TxStatus } from "@/components/ui/tx-status"
import { Wallet } from "@/components/ui/wallet"
import { href } from "@/i18n/config"
import { t } from "@/i18n/t"
import { useTx } from "@/lib/demo/chain"
import { castVote, executeProposal, fastForward, scheduleProposalSignatures } from "@/lib/demo/ops"
import { available, isExecutable, stewards, tally } from "@/lib/demo/rules"
import { useDemo } from "@/lib/demo/store"
import type { Choice, Proposal } from "@/lib/demo/types"
import { formatDate, formatDateTime, formatPercent, formatRelative, formatToken } from "@/lib/format"
import { cn } from "@/lib/utils"

import { ActivityFeed } from "./activity-feed"
import { useAppCopy } from "./app-provider"
import { charterValue, dotsFor, memberName, routeRule, StatusBadge, statusText, youIndex } from "./labels"
import { GridLegend, MemberGrid } from "./member-grid"
import { membershipOf } from "./membership"
import { Seals } from "./seals"
import { TxFeedback } from "./tx-feedback"

export function ProposalView({ id }: { id: string }) {
  const demo = useDemo()
  const { app, locale } = useAppCopy()
  const p = demo?.proposals.find((x) => x.id === id)

  // Seeded proposals waiting for the committee get their signatures while you watch.
  useEffect(() => {
    if (p?.status === "committee") scheduleProposalSignatures(p.id)
  }, [p?.id, p?.status])

  if (!demo) return null
  const P = app.proposal

  if (!p) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 py-12 text-center">
        <h1 className="text-3xl font-extrabold tracking-display">{P.notFoundTitle}</h1>
        <p className="text-muted-foreground">{P.notFoundBody}</p>
        <Button asChild variant="outline">
          <Link href={href(locale, "/app/proposals")}>{P.back}</Link>
        </Button>
      </div>
    )
  }

  const c = demo.charter
  const limit = formatToken(c.committeeLimit, locale)
  const why = t(P.routeWhy[p.route], { amount: p.amount ? formatToken(p.amount, locale) : "", limit })

  return (
    <div className="flex flex-col gap-6">
      <Link href={href(locale, "/app/proposals")} className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeftIcon className="size-4" aria-hidden="true" />
        {P.back}
      </Link>

      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge p={p} app={app} />
          <span className="rounded-full border px-2.5 py-0.5 text-xs font-semibold">{app.categories[p.category]}</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-display sm:text-4xl">
          <span className="text-muted-foreground">#{p.number} </span>
          {p.title}
        </h1>
        <p className="max-w-[68ch] text-muted-foreground">{p.summary}</p>
        <dl className="mt-1 flex flex-wrap gap-x-8 gap-y-3 text-sm">
          {p.amount ? (
            <div>
              <dt className="text-xs text-muted-foreground">{P.amount}</dt>
              <dd className="mt-0.5 text-lg font-bold">
                <TokenAmount value={p.amount} decimals={2} fractionDigits={2} symbol="tUSDC" locale={locale === "fr" ? "fr-CA" : "en-CA"} />
              </dd>
            </div>
          ) : null}
          {p.recipient ? (
            <div className="min-w-0">
              <dt className="text-xs text-muted-foreground">{P.recipient}</dt>
              <dd className="mt-0.5">
                <Wallet address={p.recipient.address} name={p.recipient.name} size="sm" className="max-w-[18rem]" />
              </dd>
            </div>
          ) : null}
          <div>
            <dt className="text-xs text-muted-foreground">{P.author}</dt>
            <dd className="mt-0.5 font-semibold">{memberName(demo, p.authorId, app)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">{P.created}</dt>
            <dd className="mt-0.5 font-semibold">{formatDate(p.createdAt, locale)}</dd>
          </div>
        </dl>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-w-0 flex-col gap-6">
          <section aria-labelledby="route-title" className="rounded-2xl border bg-card p-5">
            <h2 id="route-title" className="eyebrow text-muted-foreground">
              {P.routeTitle}
            </h2>
            <p className="mt-2 flex flex-wrap items-center gap-x-1.5 text-lg font-bold">
              <span>
                {app.routes[p.route]} <span className="text-sm font-semibold text-primary-ink">· {routeRule(p.route, c, app, locale)}</span>
              </span>
              <InfoTip label={`${app.info}: ${P.routeTitle}`} className="-my-1">
                {why}
              </InfoTip>
            </p>
            {p.change ? (
              <p className="mt-3 inline-flex flex-wrap items-center gap-2 rounded-xl bg-secondary px-3 py-2 text-sm">
                <span className="font-semibold">{app.charter.rules[p.change.key].name}</span>
                <span className="font-mono">{charterValue(p.change.key, p.change.from, app, locale)}</span>
                <span aria-hidden="true">→</span>
                <span className="font-mono font-bold">{charterValue(p.change.key, p.change.to, app, locale)}</span>
              </p>
            ) : null}
          </section>

          {p.route === "committee" ? <CommitteePanel p={p} /> : <VotePanel p={p} />}
        </div>

        {/* On phones the action comes right after the vote; on desktop it sticks in the right column. */}
        <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <ActionPanel p={p} />
        </aside>

        <section aria-labelledby="history-title" className="min-w-0 lg:col-start-1">
          <h2 id="history-title" className="text-lg font-bold">
            {P.history}
          </h2>
          <div className="mt-2">
            <ActivityFeed demo={demo} proposalId={p.id} limit={20} />
          </div>
        </section>
      </div>
    </div>
  )
}

function VotePanel({ p }: { p: Proposal }) {
  const demo = useDemo()
  const { app, locale } = useAppCopy()
  if (!demo) return null
  const G = app.proposal.grid
  const tl = tally(p, demo.charter)
  const missing = Math.max(0, tl.quorumNeeded - tl.cast)
  const closed = p.status !== "voting"
  const O = app.proposal.outcome

  let outcomeText = ""
  if (p.status === "noQuorum") outcomeText = t(O.noQuorum, { cast: tl.cast, needed: tl.quorumNeeded })
  else if (p.status === "rejected")
    outcomeText =
      p.route === "supermajority"
        ? t(O.rejectedSuper, { share: formatPercent(tl.forShare, locale) })
        : t(O.rejected, { for: tl.for, against: tl.against })
  else if (closed && p.kind === "charter" && p.change)
    outcomeText = t(O.enacted, { value: charterValue(p.change.key, p.change.to, app, locale) })
  else if (closed) outcomeText = t(O.passed, { for: tl.for, against: tl.against, abstain: tl.abstain })

  const sharePct = Math.round(tl.forShare * 100)
  const needPct = Math.round(tl.majority * 100)

  return (
    <section aria-labelledby="grid-title" className="rounded-2xl border bg-card p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="grid-title" className="text-lg font-bold">
          {G.title}
        </h2>
        <p className="text-sm text-muted-foreground">{t(app.proposals.votes, { cast: tl.cast, electorate: tl.electorate })}</p>
      </div>
      <MemberGrid
        dots={dotsFor(p)}
        quorum={tl.quorumNeeded}
        quorumLabel={t(G.quorum, { needed: tl.quorumNeeded })}
        youIndex={youIndex(p)}
        label={t(G.label, { cast: tl.cast, electorate: tl.electorate, needed: tl.quorumNeeded })}
        className="mt-5"
      />
      <GridLegend labels={{ ...app.choices, none: G.none }} quorum={t(G.quorum, { needed: tl.quorumNeeded })} className="mt-4" />

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-secondary p-3">
          <p className={cn("text-sm font-bold", tl.quorumReached ? "text-success" : "")}>
            {tl.quorumReached ? G.quorumReached : t(G.quorumMissing, { n: missing })}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {app.charter.rules.quorum.name}
            {locale === "fr" ? " : " : ": "}
            {formatPercent(tl.quorumPct / 100, locale)} · {tl.quorumNeeded}/{tl.electorate}
          </p>
        </div>
        <div className="rounded-xl bg-secondary p-3">
          <p className="text-sm font-bold">
            {t(G.forShare, { share: formatPercent(tl.forShare, locale) })}
            <span className="font-normal text-muted-foreground">
              {" "}
              · {tl.for} / {tl.against} / {tl.abstain}
            </span>
          </p>
          <div className="relative mt-2 h-2 rounded-full bg-card" aria-hidden="true">
            <div className="h-full rounded-full bg-primary transition-[width] duration-200 ease-out" style={{ width: `${sharePct}%` }} />
            <span className="absolute -top-1 h-4 w-0.5 rounded-full bg-foreground" style={{ left: `${needPct}%` }} />
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">{p.route === "supermajority" ? G.twoThirds : `${G.majority} > ${formatPercent(0.5, locale)}`}</p>
        </div>
      </div>

      {outcomeText ? (
        <p
          role="status"
          className={cn(
            "cd-rise mt-4 rounded-xl border-l-4 px-4 py-3 text-sm font-semibold",
            p.status === "passed" || p.status === "executed" ? "border-success bg-success/10" : "border-foreground/40 bg-secondary"
          )}
        >
          {outcomeText}
        </p>
      ) : null}
    </section>
  )
}

function CommitteePanel({ p }: { p: Proposal }) {
  const demo = useDemo()
  const { app } = useAppCopy()
  if (!demo) return null
  const C = app.proposal.committee
  const items = stewards(demo).map((m) => ({
    id: m.id,
    name: m.name,
    title: m.steward ? app.stewardTitles[m.steward] : "",
    signed: p.signatures.includes(m.id),
  }))
  const done = p.status !== "committee"
  return (
    <section aria-labelledby="seals-title" className="rounded-2xl border bg-card p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="seals-title" className="text-lg font-bold">
          {C.title}
        </h2>
        <p className="text-sm font-semibold" aria-live="polite">
          {t(C.label, { n: p.signatures.length, m: demo.charter.committeeThreshold })}
        </p>
      </div>
      <Seals items={items} signedLabel={C.signed} notSignedLabel={C.notSigned} className="mt-5" />
      <p role="status" className={cn("mt-5 flex items-center gap-2 text-sm", done ? "font-semibold text-success" : "text-muted-foreground")}>
        {!done ? <Loader2Icon className="size-4 animate-spin text-primary" aria-hidden="true" /> : null}
        {done ? C.done : C.waiting}
      </p>
    </section>
  )
}

function ActionPanel({ p }: { p: Proposal }) {
  const demo = useDemo()
  const { app, locale } = useAppCopy()
  if (!demo) return null
  const P = app.proposal
  const { status } = membershipOf(demo)

  if (p.status === "voting") {
    if (status !== "member") {
      return (
        <section className="rounded-2xl border bg-card p-5">
          <h2 className="text-lg font-bold">{P.vote.joinToVote}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{status === "applying" ? P.vote.applying : P.vote.joinBody}</p>
          {status === "visitor" ? (
            <Button asChild className="mt-4 w-full">
              <Link href={href(locale, "/app/members#join")}>
                <UserPlusIcon aria-hidden="true" />
                {app.membership.join}
              </Link>
            </Button>
          ) : null}
          <ForwardControl p={p} />
        </section>
      )
    }
    return <VoteBox p={p} />
  }

  if (isExecutable(p)) return <ExecuteBox p={p} />

  if (p.status === "executed" && p.executedHash) {
    return (
      <section className="rounded-2xl border bg-card p-5">
        <h2 className="text-lg font-bold">{P.execute.title}</h2>
        <p className="mt-2 text-sm font-semibold text-success">{t(P.execute.paid, { date: formatDateTime(p.executedAt ?? p.createdAt, locale) })}</p>
        <TxStatus status="confirmed" hash={p.executedHash} label={P.execute.confirmed} className="mt-3" />
        <Link href={href(locale, "/app/treasury")} className="mt-4 inline-flex text-sm font-bold text-primary-ink underline underline-offset-4">
          {P.execute.view}
        </Link>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border bg-card p-5">
      <h2 className="text-lg font-bold">{statusText(p, app)}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{p.closedAt ? t(app.proposals.closed, { date: formatDate(p.closedAt, locale) }) : null}</p>
    </section>
  )
}

function VoteBox({ p }: { p: Proposal }) {
  const demo = useDemo()
  const { app, locale } = useAppCopy()
  const mine = p.votes["m-you"]
  const [choice, setChoice] = useState<Choice | null>(null)
  const [error, setError] = useState(false)
  const tx = useTx()
  if (!demo) return null
  const V = app.proposal.vote
  const S = app.summaries
  const selected = choice ?? mine ?? null

  const submit = () => {
    if (!selected) {
      setError(true)
      return
    }
    setError(false)
    void tx
      .run(
        {
          title: S.vote,
          rows: [
            { label: S.voteOn, value: `#${p.number} ${p.title}` },
            { label: S.voteChoice, value: app.choices[selected] },
          ],
        },
        // No toast: the grid, the tally and "Vote recorded" below already confirm it.
        (hash) => castVote(p.id, selected, hash)
      )
      .then((ok) => ok && setChoice(null))
  }

  return (
    <section aria-labelledby="vote-title" className="rounded-2xl border-2 border-primary bg-card p-5">
      <h2 id="vote-title" className="text-lg font-bold">
        {V.title}
      </h2>
      {p.closesAt ? <p className="mt-1 text-xs text-muted-foreground">{t(app.proposals.closes, { when: formatRelative(p.closesAt, locale) })}</p> : null}
      {mine ? <p className="mt-2 text-sm font-semibold">{t(V.yours, { choice: app.choices[mine].toLowerCase() })}</p> : null}
      <fieldset className="mt-4">
        <legend className="sr-only">{V.title}</legend>
        <div className="grid grid-cols-3 gap-2">
          {(["for", "against", "abstain"] as const).map((c) => (
            <label
              key={c}
              className={cn(
                "flex h-11 cursor-pointer items-center justify-center rounded-full border text-sm font-bold transition-colors duration-150 has-focus-visible:outline-2 has-focus-visible:outline-ring",
                selected === c
                  ? c === "for"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-foreground bg-foreground text-background"
                  : "border-input hover:bg-muted"
              )}
            >
              <input
                type="radio"
                name={`vote-${p.id}`}
                value={c}
                checked={selected === c}
                onChange={() => {
                  setChoice(c)
                  setError(false)
                }}
                className="sr-only"
                disabled={tx.busy}
              />
              {app.choices[c]}
            </label>
          ))}
        </div>
      </fieldset>
      {error ? (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {V.pickFirst}
        </p>
      ) : null}
      <Button className="mt-4 w-full" size="lg" onClick={submit} disabled={tx.busy || (!!mine && (choice === null || choice === mine))}>
        {tx.busy ? <Loader2Icon className="animate-spin" aria-hidden="true" /> : null}
        {mine ? V.change : V.cast}
      </Button>
      <TxFeedback state={tx.state} pendingLabel={V.pending} confirmedLabel={V.confirmed} onRetry={submit} onDismiss={tx.reset} className="mt-4" />
      <ForwardControl p={p} />
    </section>
  )
}

/** Demo shortcut: the other members' votes arrive, then the charter decides (the outcome line says the result, no toast). */
function ForwardControl({ p }: { p: Proposal }) {
  const { app } = useAppCopy()
  const [running, setRunning] = useState(false)
  const F = app.proposal.forward
  return (
    <div className="mt-5 border-t pt-4">
      <Button
        variant="outline"
        className="w-full"
        disabled={running}
        onClick={() => {
          setRunning(true)
          void fastForward(p.id).then(() => setRunning(false))
        }}
      >
        {running ? <Loader2Icon className="animate-spin" aria-hidden="true" /> : <FastForwardIcon aria-hidden="true" />}
        {running ? F.running : F.button}
      </Button>
    </div>
  )
}

function ExecuteBox({ p }: { p: Proposal }) {
  const demo = useDemo()
  const { app, locale } = useAppCopy()
  const tx = useTx()
  if (!demo) return null
  const E = app.proposal.execute
  const S = app.summaries
  const member = membershipOf(demo).status === "member"
  // `available` already reserves this proposal's amount, so add it back.
  const enough = available(demo) + (p.amount ?? 0) >= (p.amount ?? 0)

  const run = () =>
    void tx.run(
      {
        title: S.execute,
        rows: [
          { label: S.proposeAmount, value: formatToken(p.amount ?? 0, locale) },
          { label: S.executeTo, value: p.recipient?.name ?? "" },
          { label: S.executeFrom, value: S.treasury },
        ],
        movesValue: true,
      },
      // No toast: the panel switches to "Paid on …" with the transaction.
      (hash) => executeProposal(p.id, hash)
    )

  return (
    <section aria-labelledby="exec-title" className="rounded-2xl border-2 border-primary bg-card p-5">
      <h2 id="exec-title" className="flex items-center gap-1 text-lg font-bold">
        {E.title}
        <InfoTip label={`${app.info}: ${E.title}`} className="-my-1.5">
          {E.ready}
        </InfoTip>
      </h2>
      <p className="mt-2 font-mono text-2xl font-bold tabular-nums">{formatToken(p.amount ?? 0, locale)}</p>
      {!member ? <p className="mt-3 text-sm text-muted-foreground">{E.memberOnly}</p> : null}
      {!enough ? (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {E.notEnough}
        </p>
      ) : null}
      <Button className="mt-4 w-full" size="lg" onClick={run} disabled={!member || !enough || tx.busy || tx.state.phase === "confirmed"}>
        {tx.busy ? <Loader2Icon className="animate-spin" aria-hidden="true" /> : null}
        {E.button}
      </Button>
      <TxFeedback state={tx.state} pendingLabel={E.pending} confirmedLabel={E.confirmed} onRetry={run} onDismiss={tx.reset} className="mt-4" />
    </section>
  )
}
