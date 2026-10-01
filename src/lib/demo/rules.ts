import type { Cents, Charter, Choice, DemoState, Proposal, ProposalStatus, Route } from "./types"

/**
 * The charter as code. These pure functions are the whole governance model:
 * which route a proposal takes, how votes are tallied, and what the outcome is.
 * A real deployment would read the same parameters from the charter contract.
 */

export function routeFor(charter: Charter, kind: "spend" | "charter", amount: Cents | undefined): Route {
  if (kind === "charter") return "supermajority"
  return (amount ?? 0) <= charter.committeeLimit ? "committee" : "vote"
}

export interface Tally {
  for: number
  against: number
  abstain: number
  cast: number
  electorate: number
  quorumPct: number
  quorumNeeded: number
  quorumReached: boolean
  /** Required share of for / (for + against). 0.5 means strictly more than half. */
  majority: number
  forShare: number
  majorityReached: boolean
}

export function quorumPctFor(charter: Charter, route: Route): number {
  return route === "supermajority" ? charter.charterQuorum : charter.quorum
}

export function tally(p: Proposal, charter: Charter): Tally {
  let f = 0
  let a = 0
  let ab = 0
  for (const c of Object.values(p.votes) as Choice[]) {
    if (c === "for") f++
    else if (c === "against") a++
    else ab++
  }
  const cast = f + a + ab
  const quorumPct = quorumPctFor(charter, p.route)
  const quorumNeeded = Math.ceil((p.electorate * quorumPct) / 100)
  const decided = f + a
  const forShare = decided === 0 ? 0 : f / decided
  const majority = p.route === "supermajority" ? charter.supermajority : 0.5
  const majorityReached = p.route === "supermajority" ? decided > 0 && forShare >= majority - 1e-9 : f > a
  return {
    for: f,
    against: a,
    abstain: ab,
    cast,
    electorate: p.electorate,
    quorumPct,
    quorumNeeded,
    quorumReached: cast >= quorumNeeded,
    majority,
    forShare,
    majorityReached,
  }
}

/** Status once a vote closes. */
export function outcome(p: Proposal, charter: Charter): ProposalStatus {
  const t = tally(p, charter)
  if (!t.quorumReached) return "noQuorum"
  return t.majorityReached ? "passed" : "rejected"
}

export function treasuryBalance(s: DemoState): Cents {
  return s.ledger.reduce((sum, e) => sum + (e.direction === "in" ? e.amount : -e.amount), 0)
}

/** Money already promised: approved or passed spends not yet paid. */
export function committed(s: DemoState): Cents {
  return s.proposals
    .filter((p) => p.kind === "spend" && (p.status === "approved" || p.status === "passed"))
    .reduce((sum, p) => sum + (p.amount ?? 0), 0)
}

export function available(s: DemoState): Cents {
  return treasuryBalance(s) - committed(s)
}

export function isExecutable(p: Proposal): boolean {
  return p.kind === "spend" && (p.status === "approved" || p.status === "passed")
}

export function isOpen(p: Proposal): boolean {
  return p.status === "voting" || p.status === "committee"
}

export function you(s: DemoState) {
  return s.members.find((m) => m.isYou) ?? null
}

export function stewards(s: DemoState) {
  return s.members.filter((m) => m.steward)
}
