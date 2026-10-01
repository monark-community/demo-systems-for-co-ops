import { Badge } from "@/components/ui/badge"
import type { Dictionary } from "@/i18n"
import type { Locale } from "@/i18n/config"
import { t } from "@/i18n/t"
import { formatDate, formatPercent, formatToken } from "@/lib/format"
import type { Charter, CharterKey, DemoState, Proposal, Route } from "@/lib/demo/types"

import type { DotKind } from "./member-grid"

type App = Dictionary["app"]

export function statusText(p: Proposal, app: App): string {
  const s = app.status
  if (p.status === "passed") return p.kind === "charter" ? s.enacted : s.passedSpend
  return s[p.status]
}

export function StatusBadge({ p, app }: { p: Proposal; app: App }) {
  const variant =
    p.status === "executed" || (p.status === "passed" && p.kind === "charter")
      ? "success"
      : p.status === "passed" || p.status === "approved"
        ? "warning"
        : p.status === "rejected" || p.status === "noQuorum"
          ? "outline"
          : "secondary"
  return (
    <Badge variant={variant} className={p.status === "voting" || p.status === "committee" ? "border-primary/50" : undefined}>
      {p.status === "voting" || p.status === "committee" ? <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" /> : null}
      {statusText(p, app)}
    </Badge>
  )
}

export function routeRule(route: Route, charter: Charter, app: App, locale: Locale): string {
  const r = app.routes
  if (route === "committee")
    return t(r.committeeRule, { n: charter.committeeThreshold, m: charter.committeeSize, limit: formatToken(charter.committeeLimit, locale) })
  if (route === "vote") return t(r.voteRule, { days: charter.votingDays, quorum: charter.quorum })
  return t(r.supermajorityRule, { days: charter.votingDays, quorum: charter.charterQuorum })
}

/** Value of a charter rule in words ("20 tUSDC", "40%", "5 days"). */
export function charterValue(key: CharterKey, value: number, app: App, locale: Locale): string {
  if (key === "memberShare" || key === "committeeLimit") return formatToken(value, locale)
  if (key === "quorum") return formatPercent(value / 100, locale)
  return t(app.charter.days, { n: value })
}

/** Dots grouped for → against → abstain → not voted, so the grid reads as a tally made of people. */
export function dotsFor(p: Proposal): DotKind[] {
  const votes = Object.values(p.votes)
  const f = votes.filter((v) => v === "for").length
  const a = votes.filter((v) => v === "against").length
  const ab = votes.filter((v) => v === "abstain").length
  const none = Math.max(0, p.electorate - f - a - ab)
  return [
    ...Array<DotKind>(f).fill("for"),
    ...Array<DotKind>(a).fill("against"),
    ...Array<DotKind>(ab).fill("abstain"),
    ...Array<DotKind>(none).fill("none"),
  ]
}

/** Index of the visitor's dot in dotsFor() order, if they voted. */
export function youIndex(p: Proposal): number | undefined {
  const mine = p.votes["m-you"]
  if (!mine) return undefined
  const votes = Object.entries(p.votes)
  const order: DotKind[] = ["for", "against", "abstain"]
  let idx = 0
  for (const kind of order) {
    if (kind === mine) {
      // Visitor's dot is the last of its group (the most recent).
      return idx + votes.filter(([, v]) => v === kind).length - 1
    }
    idx += votes.filter(([, v]) => v === kind).length
  }
  return undefined
}

export function memberName(s: DemoState, id: string, app: App): string {
  const m = s.members.find((x) => x.id === id)
  if (!m) return id ? id : app.activity.someone
  return m.isYou ? `${m.name} (${app.you})` : m.name
}

export function closedText(p: Proposal, app: App, locale: Locale) {
  return p.closedAt ? t(app.proposals.closed, { date: formatDate(p.closedAt, locale) }) : ""
}
