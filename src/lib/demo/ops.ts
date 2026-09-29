"use client"

import { randomHash, randomHex, seededHex } from "./ids"
import { outcome, routeFor, stewards, tally, you } from "./rules"
import { getDemo, update, updateProposal } from "./store"
import type { Activity, Application, Cents, CharterKey, Choice, DemoState, Member, Proposal } from "./types"

/**
 * Everything that changes the co-op. Each action is what a contract call (or,
 * for the simulated co-members, an event from the chain) would do once
 * confirmed. The UI calls these from the `apply` step of a transaction.
 */

const SIGN_DELAY = 2200
const VOTE_TICK = 140

const nowIso = () => new Date().toISOString()

function activity(kind: Activity["kind"], actor: string, extra: Partial<Activity> = {}): Activity {
  return { id: `ac-${randomHex(8)}`, at: nowIso(), kind, actor, ...extra }
}

function addActivity(s: DemoState, a: Activity): DemoState {
  return { ...s, activity: [a, ...s.activity] }
}

/** Deterministic pseudo-random stream for a proposal, so replays look the same. */
function rng(seed: string) {
  let x = parseInt(seededHex(seed, 8), 16) || 1
  return () => {
    x ^= x << 13
    x >>>= 0
    x ^= x >>> 17
    x ^= x << 5
    x >>>= 0
    return x / 0x100000000
  }
}

/* ---------------------------------------------------------------- joining */

export function applyToJoin(name: string, note: string, hash: string): string {
  const id = `a-${randomHex(8)}`
  update((s) => {
    const app: Application = {
      id,
      name,
      address: s.wallet.address,
      note,
      at: nowIso(),
      signatures: [],
      status: "waiting",
      hash,
      isYou: true,
    }
    const next: DemoState = {
      ...s,
      wallet: { ...s.wallet, balance: s.wallet.balance - s.charter.memberShare },
      applications: [app, ...s.applications],
      ledger: [
        ...s.ledger,
        {
          id: `l-${randomHex(8)}`,
          at: nowIso(),
          direction: "in",
          amount: s.charter.memberShare,
          label: name,
          kind: "share",
          counterparty: name,
          hash,
        },
      ],
    }
    return addActivity(next, activity("applied", name, { hash, amount: s.charter.memberShare }))
  })
  scheduleApplicationSignatures(id)
  return id
}

const scheduled = new Set<string>()

/** The stewards sign one after the other (simulated co-signers). */
export function scheduleApplicationSignatures(appId: string) {
  if (scheduled.has(appId)) return
  scheduled.add(appId)
  const step = () => {
    const s = getDemo()
    const app = s?.applications.find((a) => a.id === appId)
    if (!s || !app || app.status !== "waiting") {
      scheduled.delete(appId)
      return
    }
    const signer = stewards(s).find((m) => !app.signatures.includes(m.id))
    if (!signer) return
    const signatures = [...app.signatures, signer.id]
    const admitted = signatures.length >= s.charter.committeeThreshold
    update((st) => {
      let next: DemoState = {
        ...st,
        applications: st.applications.map((a) =>
          a.id === appId ? { ...a, signatures, status: admitted ? ("admitted" as const) : a.status } : a
        ),
      }
      next = addActivity(next, activity("signed", signer.id, { hash: randomHash() }))
      if (admitted && app.isYou) {
        const member: Member = {
          id: "m-you",
          name: app.name,
          address: app.address,
          joinedAt: nowIso(),
          votesCast: 0,
          votesOpen: 0,
          proposalsMade: 0,
          pastRoles: [],
          isYou: true,
        }
        next = {
          ...next,
          members: [...next.members, member],
          // Open votes count the new member in their electorate.
          proposals: next.proposals.map((p) => (p.status === "voting" ? { ...p, electorate: p.electorate + 1 } : p)),
        }
        next = addActivity(next, activity("joined", member.id))
      }
      return next
    })
    if (admitted) scheduled.delete(appId)
    else window.setTimeout(step, SIGN_DELAY)
  }
  window.setTimeout(step, SIGN_DELAY)
}

/* -------------------------------------------------------------- proposals */

export interface ProposalDraft {
  kind: "spend" | "charter"
  title: string
  summary: string
  category: Proposal["category"]
  amount?: Cents
  recipient?: { name: string; address: string }
  change?: { key: CharterKey; from: number; to: number }
}

export function createProposal(draft: ProposalDraft, hash: string): string {
  const s = getDemo()
  if (!s) return ""
  const me = you(s)
  const number = s.nextNumber
  const id = `p-${number}`
  const route = routeFor(s.charter, draft.kind, draft.amount)
  const created = nowIso()
  const proposal: Proposal = {
    id,
    number,
    ...draft,
    authorId: me?.id ?? "m-you",
    createdAt: created,
    route,
    status: route === "committee" ? "committee" : "voting",
    closesAt: route === "committee" ? undefined : new Date(Date.now() + s.charter.votingDays * 86_400_000).toISOString(),
    electorate: s.members.length,
    votes: {},
    signatures: [],
    lean: draft.kind === "charter" ? 0.8 : 0.76,
    turnout: 0.7,
    createdHash: hash,
  }
  update((st) => {
    const next: DemoState = {
      ...st,
      nextNumber: st.nextNumber + 1,
      proposals: [proposal, ...st.proposals],
      members: st.members.map((m) => (m.isYou ? { ...m, proposalsMade: m.proposalsMade + 1 } : m)),
    }
    return addActivity(next, activity("proposed", proposal.authorId, { proposalId: id, hash }))
  })
  if (route === "committee") scheduleProposalSignatures(id)
  return id
}

export function scheduleProposalSignatures(pid: string) {
  const key = `p:${pid}`
  if (scheduled.has(key)) return
  scheduled.add(key)
  const step = () => {
    const s = getDemo()
    const p = s?.proposals.find((x) => x.id === pid)
    if (!s || !p || p.status !== "committee") {
      scheduled.delete(key)
      return
    }
    const signer = stewards(s).find((m) => !p.signatures.includes(m.id))
    if (!signer) return
    const signatures = [...p.signatures, signer.id]
    const approved = signatures.length >= s.charter.committeeThreshold
    update((st) => {
      let next: DemoState = {
        ...st,
        proposals: st.proposals.map((x) =>
          x.id === pid ? { ...x, signatures, status: approved ? ("approved" as const) : x.status, closedAt: approved ? nowIso() : x.closedAt } : x
        ),
      }
      next = addActivity(next, activity("signed", signer.id, { proposalId: pid, hash: randomHash() }))
      if (approved) next = addActivity(next, activity("approved", "", { proposalId: pid }))
      return next
    })
    if (approved) scheduled.delete(key)
    else window.setTimeout(step, SIGN_DELAY)
  }
  window.setTimeout(step, SIGN_DELAY)
}

export function castVote(pid: string, choice: Choice, hash: string) {
  update((s) => {
    const me = you(s)
    if (!me) return s
    const first = !s.proposals.find((p) => p.id === pid)?.votes[me.id]
    const next: DemoState = {
      ...s,
      proposals: s.proposals.map((p) => (p.id === pid ? { ...p, votes: { ...p.votes, [me.id]: choice } } : p)),
      members: first
        ? s.members.map((m) => (m.isYou ? { ...m, votesCast: m.votesCast + 1, votesOpen: m.votesOpen + 1 } : m))
        : s.members,
    }
    return addActivity(next, activity("voted", me.id, { proposalId: pid, hash }))
  })
}

const forwarding = new Set<string>()

export function isForwarding(pid: string) {
  return forwarding.has(pid)
}

/**
 * Demo shortcut: jump to the end of the voting period. The remaining members'
 * votes arrive one by one, then the charter decides the outcome.
 */
export async function fastForward(pid: string): Promise<void> {
  if (forwarding.has(pid)) return
  const s0 = getDemo()
  const p0 = s0?.proposals.find((p) => p.id === pid)
  if (!s0 || !p0 || p0.status !== "voting") return
  forwarding.add(pid)
  try {
    const rand = rng(`ff:${pid}`)
    const target = Math.round(p0.turnout * p0.electorate)
    const pool = s0.members.filter((m) => !m.isYou && !p0.votes[m.id]).sort(() => rand() - 0.5)
    const toAdd = Math.max(0, target - Object.keys(p0.votes).length)
    for (let i = 0; i < toAdd && i < pool.length; i++) {
      const m = pool[i]!
      const r = rand()
      const choice: Choice = r < 0.07 ? "abstain" : r < 0.07 + p0.lean * 0.93 ? "for" : "against"
      updateProposal(pid, (p) => ({ ...p, votes: { ...p.votes, [m.id]: choice } }))
      await new Promise((res) => setTimeout(res, VOTE_TICK))
    }
    await new Promise((res) => setTimeout(res, 500))
    closeVote(pid)
  } finally {
    forwarding.delete(pid)
  }
}

function closeVote(pid: string) {
  update((s) => {
    const p = s.proposals.find((x) => x.id === pid)
    if (!p || p.status !== "voting") return s
    const status = outcome(p, s.charter)
    const closedAt = nowIso()
    let next: DemoState = {
      ...s,
      proposals: s.proposals.map((x) => (x.id === pid ? { ...x, status, closedAt, closesAt: closedAt } : x)),
    }
    next = addActivity(next, activity(status === "passed" ? "passed" : status === "rejected" ? "rejected" : "noQuorum", "", { proposalId: pid }))
    if (status === "passed" && p.kind === "charter" && p.change) {
      const hash = randomHash()
      next = {
        ...next,
        charter: { ...next.charter, [p.change.key]: p.change.to },
        charterHistory: [
          { id: `ch-${randomHex(6)}`, at: closedAt, key: p.change.key, from: p.change.from, to: p.change.to, proposalId: pid, hash },
          ...next.charterHistory,
        ],
      }
      next = addActivity(next, activity("charter", "", { proposalId: pid, hash }))
    }
    return next
  })
}

export function executeProposal(pid: string, hash: string) {
  update((s) => {
    const p = s.proposals.find((x) => x.id === pid)
    const me = you(s)
    if (!p || !p.amount) return s
    const at = nowIso()
    let next: DemoState = {
      ...s,
      proposals: s.proposals.map((x) => (x.id === pid ? { ...x, status: "executed" as const, executedAt: at, executedHash: hash } : x)),
      ledger: [
        ...s.ledger,
        {
          id: `l-${randomHex(8)}`,
          at,
          direction: "out",
          amount: p.amount,
          label: p.title,
          counterparty: p.recipient?.name ?? "",
          proposalId: pid,
          hash,
        },
      ],
    }
    next = addActivity(next, activity("executed", me?.id ?? "", { proposalId: pid, amount: p.amount, hash }))
    return next
  })
}

/** Current tally for a proposal id (convenience for components). */
export function tallyOf(s: DemoState, pid: string) {
  const p = s.proposals.find((x) => x.id === pid)
  return p ? tally(p, s.charter) : null
}
