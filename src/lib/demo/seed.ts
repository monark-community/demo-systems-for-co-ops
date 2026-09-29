import { seededAddress, seededHash } from "./ids"
import type {
  Activity,
  Application,
  Charter,
  Choice,
  DemoState,
  LedgerEntry,
  Member,
  Proposal,
  StewardTitle,
} from "./types"

/**
 * Le Grenier, a student food co-op on a Montréal campus: 34 members, three
 * elected stewards, a year of history. Everything is relative to "now" so the
 * demo always looks current. Only the prose comes from the visitor's language.
 */

export const SEED_PROPOSAL_IDS = ["p-19", "p-18", "p-17", "p-16", "p-15", "p-14", "p-13", "p-12", "p-11"] as const
type SeedProposalKey = "p19" | "p18" | "p17" | "p16" | "p15" | "p14" | "p13" | "p12" | "p11"

export interface SeedCopy {
  proposals: Record<SeedProposalKey, { title: string; summary: string }>
  ledger: {
    grant: string
    sharesAutumn: string
    sharesWinter: string
    /** "Counter surplus, {month}" */
    surplus: string
  }
  counterparties: { union: string; members: string; counter: string }
  /** "Steward, {year}" */
  pastSteward: string
  applicantNote: string
}

const DAY = 86_400_000
const now = () => Date.now()
const daysAgo = (d: number, hour = 14) => {
  const t = new Date(now() - d * DAY)
  t.setHours(hour, (d * 37) % 60, 0, 0)
  return t.toISOString()
}
const daysAhead = (d: number) => new Date(now() + d * DAY).toISOString()

const STEWARDS: { name: string; title: StewardTitle }[] = [
  { name: "Amara Diallo", title: "treasurer" },
  { name: "Théo Gagnon", title: "coordinator" },
  { name: "Priya Raman", title: "secretary" },
]

const OTHERS = [
  "Léa Tremblay",
  "Samuel Okafor",
  "Maya Chen",
  "Julien Bouchard",
  "Inès Haddad",
  "Noah Lévesque",
  "Sofia Morales",
  "Karim Benali",
  "Emma Côté",
  "Lucas Nguyen",
  "Chloé Pelletier",
  "Omar Farouk",
  "Zoé Lavoie",
  "Daniel Kim",
  "Aïcha Traoré",
  "Félix Girard",
  "Hannah Weiss",
  "Mateo Rossi",
  "Rosalie Gauthier",
  "Yusuf Demir",
  "Clara Fontaine",
  "Victor Dubois",
  "Mei Tanaka",
  "Élodie Martin",
  "Ravi Patel",
  "Anaïs Bergeron",
  "Gabriel Silva",
  "Nadia Petrova",
  "William Ouellet",
  "Laura Schmidt",
  "Jade Morin",
]

export const YOU = { name: "Camille Roy", address: seededAddress("camille-roy") }

const slug = (name: string) =>
  name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z]+/g, "-")

function buildMembers(copy: SeedCopy): Member[] {
  const all = [...STEWARDS.map((s) => s.name), ...OTHERS]
  return all.map((name, i) => {
    const steward = STEWARDS.find((s) => s.name === name)?.title
    // Founders joined 13 months ago; the rest trickled in since.
    const joinedDays = i < 20 ? 395 - i * 3 : 300 - (i - 20) * 22
    const votesOpen = i < 20 ? 9 : Math.max(2, 9 - Math.ceil((i - 19) * 0.6))
    const reliability = [1, 0.95, 0.9, 0.85, 0.75, 0.6, 0.45, 0.3][i % 8] ?? 0.5
    const votesCast = steward ? votesOpen : Math.max(0, Math.round(votesOpen * reliability))
    const pastRoles = i === 3 || i === 7 ? [copy.pastSteward.replace("{year}", "2025")] : []
    return {
      id: `m-${slug(name)}`,
      name,
      address: seededAddress(name),
      joinedAt: daysAgo(joinedDays, 11),
      steward,
      votesCast,
      votesOpen,
      proposalsMade: steward ? 3 : i % 5 === 0 ? 2 : i % 3 === 0 ? 1 : 0,
      pastRoles,
    }
  })
}

/** Deterministic set of voters for a seeded proposal. */
function votesFor(members: Member[], seed: number, counts: { for: number; against: number; abstain: number }) {
  const votes: Record<string, Choice> = {}
  const order = members
    .map((m, i) => ({ m, k: (i * 7919 + seed * 104729) % 997 }))
    .sort((a, b) => a.k - b.k)
    .map((x) => x.m)
  // Stewards always vote.
  const ordered = [...order.filter((m) => m.steward), ...order.filter((m) => !m.steward)]
  let i = 0
  for (const [choice, n] of [
    ["for", counts.for],
    ["against", counts.against],
    ["abstain", counts.abstain],
  ] as const) {
    for (let k = 0; k < n; k++) {
      const m = ordered[i++]
      if (m) votes[m.id] = choice
    }
  }
  return votes
}

export function createSeed(copy: SeedCopy, locale: "en" | "fr"): DemoState {
  const members = buildMembers(copy)
  const byName = (n: string) => members.find((m) => m.name === n)?.id ?? members[0]!.id
  const amara = byName("Amara Diallo")
  const theo = byName("Théo Gagnon")
  const priya = byName("Priya Raman")

  const charter: Charter = {
    memberShare: 2000,
    quorum: 40,
    votingDays: 5,
    committeeLimit: 50000,
    committeeThreshold: 2,
    committeeSize: 3,
    supermajority: 2 / 3,
    charterQuorum: 50,
    termEndsAt: daysAhead(77),
  }

  const P = copy.proposals
  const base = (id: string, n: number) => ({
    id,
    number: n,
    createdHash: seededHash(`create:${id}`),
    signatures: [] as string[],
    votes: {} as Record<string, Choice>,
    lean: 0.7,
    turnout: 0.65,
  })

  const proposals: Proposal[] = [
    {
      ...base("p-19", 19),
      kind: "spend",
      ...P.p19,
      category: "community",
      amount: 64000,
      recipient: { name: "Marché Jean-Talon — Les Jardins Lefort", address: seededAddress("jardins-lefort") },
      authorId: byName("Léa Tremblay"),
      createdAt: daysAgo(2, 10),
      route: "vote",
      status: "voting",
      closesAt: daysAhead(3),
      electorate: 34,
      votes: votesFor(members, 19, { for: 5, against: 0, abstain: 1 }),
      lean: 0.85,
      turnout: 0.35,
    },
    {
      ...base("p-18", 18),
      kind: "spend",
      ...P.p18,
      category: "equipment",
      amount: 148000,
      recipient: { name: "Réfrigération Laval", address: seededAddress("refrigeration-laval") },
      authorId: theo,
      createdAt: daysAgo(3, 9),
      route: "vote",
      status: "voting",
      closesAt: daysAhead(2),
      electorate: 34,
      votes: votesFor(members, 18, { for: 8, against: 2, abstain: 1 }),
      lean: 0.78,
      turnout: 0.72,
    },
    {
      ...base("p-17", 17),
      kind: "spend",
      ...P.p17,
      category: "supplies",
      amount: 82000,
      recipient: { name: "Verrerie Saint-Laurent", address: seededAddress("verrerie-saint-laurent") },
      authorId: byName("Maya Chen"),
      createdAt: daysAgo(7, 16),
      route: "vote",
      status: "passed",
      closesAt: daysAgo(2, 16),
      closedAt: daysAgo(2, 16),
      electorate: 34,
      votes: votesFor(members, 17, { for: 17, against: 3, abstain: 2 }),
    },
    {
      ...base("p-16", 16),
      kind: "spend",
      ...P.p16,
      category: "supplies",
      amount: 42000,
      recipient: { name: "Ferme des Quatre-Temps", address: seededAddress("ferme-quatre-temps") },
      authorId: priya,
      createdAt: daysAgo(1, 9),
      route: "committee",
      status: "committee",
      electorate: 34,
      signatures: [amara],
    },
    {
      ...base("p-15", 15),
      kind: "charter",
      ...P.p15,
      category: "charter",
      change: { key: "memberShare", from: 2000, to: 3000 },
      authorId: byName("Julien Bouchard"),
      createdAt: daysAgo(24, 18),
      route: "supermajority",
      status: "rejected",
      closesAt: daysAgo(19, 18),
      closedAt: daysAgo(19, 18),
      electorate: 34,
      votes: votesFor(members, 15, { for: 13, against: 10, abstain: 1 }),
    },
    {
      ...base("p-14", 14),
      kind: "spend",
      ...P.p14,
      category: "equipment",
      amount: 28900,
      recipient: { name: "Boutique Caisse+ Montréal", address: seededAddress("caisse-plus") },
      authorId: amara,
      createdAt: daysAgo(34, 13),
      route: "committee",
      status: "executed",
      electorate: 33,
      signatures: [amara, theo],
      executedAt: daysAgo(33, 15),
      executedHash: seededHash("exec:p-14"),
    },
    {
      ...base("p-13", 13),
      kind: "spend",
      ...P.p13,
      category: "community",
      amount: 35000,
      recipient: { name: "Pavillon communautaire Mile-Ex", address: seededAddress("pavillon-mile-ex") },
      authorId: priya,
      createdAt: daysAgo(51, 12),
      route: "committee",
      status: "executed",
      electorate: 33,
      signatures: [priya, amara],
      executedAt: daysAgo(50, 10),
      executedHash: seededHash("exec:p-13"),
    },
    {
      ...base("p-12", 12),
      kind: "spend",
      ...P.p12,
      category: "operations",
      amount: 240000,
      recipient: { name: "Stock coordinator (payroll wallet)", address: seededAddress("payroll") },
      authorId: byName("Samuel Okafor"),
      createdAt: daysAgo(58, 17),
      route: "vote",
      status: "noQuorum",
      closesAt: daysAgo(53, 17),
      closedAt: daysAgo(53, 17),
      electorate: 33,
      votes: votesFor(members, 12, { for: 7, against: 3, abstain: 1 }),
    },
    {
      ...base("p-11", 11),
      kind: "charter",
      ...P.p11,
      category: "charter",
      change: { key: "committeeLimit", from: 30000, to: 50000 },
      authorId: amara,
      createdAt: daysAgo(67, 15),
      route: "supermajority",
      status: "passed",
      closesAt: daysAgo(62, 15),
      closedAt: daysAgo(62, 15),
      electorate: 33,
      votes: votesFor(members, 11, { for: 18, against: 3, abstain: 1 }),
    },
  ]
  // Seeded p-12 recipient label is prose; keep it in the visitor's language.
  const p12 = proposals.find((p) => p.id === "p-12")
  if (p12?.recipient && locale === "fr") p12.recipient.name = "Coordination des stocks (portefeuille de paie)"

  const monthName = (daysBack: number) =>
    new Intl.DateTimeFormat(locale === "fr" ? "fr-CA" : "en-CA", { month: "long", year: "numeric" }).format(
      new Date(now() - daysBack * DAY)
    )
  const C = copy.counterparties
  const entry = (id: string, d: number, direction: "in" | "out", amount: number, label: string, counterparty: string, proposalId?: string): LedgerEntry => ({
    id,
    at: daysAgo(d, 10),
    direction,
    amount,
    label,
    counterparty,
    proposalId,
    hash: seededHash(`ledger:${id}`),
  })
  const surplus = (id: string, d: number, amount: number) =>
    entry(id, d, "in", amount, copy.ledger.surplus.replace("{month}", monthName(d + 10)), C.counter)

  const ledger: LedgerEntry[] = [
    entry("l-01", 392, "in", 50000, copy.ledger.sharesAutumn, C.members),
    entry("l-02", 257, "in", 300000, copy.ledger.grant, C.union),
    entry("l-03", 240, "in", 18000, copy.ledger.sharesWinter, C.members),
    surplus("l-04", 238, 112040),
    surplus("l-05", 208, 126480),
    surplus("l-06", 178, 141015),
    surplus("l-07", 148, 98060),
    surplus("l-08", 118, 64000),
    entry("l-09", 50, "out", 35000, P.p13.title, "Pavillon communautaire Mile-Ex", "p-13"),
    surplus("l-10", 88, 59025),
    entry("l-11", 33, "out", 28900, P.p14.title, "Boutique Caisse+ Montréal", "p-14"),
    surplus("l-12", 58, 118890),
    surplus("l-13", 28, 143675),
  ]
  // Match the executed proposals' hashes.
  for (const e of ledger) if (e.proposalId) e.hash = seededHash(`exec:${e.proposalId}`)
  ledger.sort((a, b) => a.at.localeCompare(b.at))

  const applications: Application[] = [
    {
      id: "a-jonas",
      name: "Jonas Weber",
      address: seededAddress("Jonas Weber"),
      note: copy.applicantNote,
      at: daysAgo(1, 19),
      signatures: [priya],
      status: "waiting",
      hash: seededHash("apply:jonas"),
    },
  ]

  const act = (id: string, at: string, kind: Activity["kind"], actor: string, extra: Partial<Activity> = {}): Activity => ({
    id,
    at,
    kind,
    actor,
    ...extra,
  })
  const activity: Activity[] = [
    act("ac-01", daysAgo(1, 9), "proposed", priya, { proposalId: "p-16", hash: seededHash("create:p-16") }),
    act("ac-02", daysAgo(1, 11), "signed", amara, { proposalId: "p-16" }),
    act("ac-03", daysAgo(1, 19), "applied", "Jonas Weber"),
    act("ac-04", daysAgo(2, 16), "passed", "", { proposalId: "p-17" }),
    act("ac-05", daysAgo(2, 10), "proposed", byName("Léa Tremblay"), { proposalId: "p-19" }),
    act("ac-06", daysAgo(3, 9), "proposed", theo, { proposalId: "p-18" }),
    act("ac-07", daysAgo(19, 18), "rejected", "", { proposalId: "p-15" }),
    act("ac-08", daysAgo(28, 10), "deposit", "", { amount: 143675, hash: seededHash("ledger:l-13") }),
    act("ac-09", daysAgo(33, 15), "executed", theo, { proposalId: "p-14", amount: 28900, hash: seededHash("exec:p-14") }),
    act("ac-10", daysAgo(62, 15), "charter", "", { proposalId: "p-11" }),
  ]

  return {
    version: 1,
    coopName: "Le Grenier",
    treasuryAddress: seededAddress("le-grenier-treasury"),
    committeeAddress: seededAddress("le-grenier-committee-safe"),
    charter,
    charterHistory: [
      {
        id: "ch-1",
        at: daysAgo(62, 15),
        key: "committeeLimit",
        from: 30000,
        to: 50000,
        proposalId: "p-11",
        hash: seededHash("charter:p-11"),
      },
    ],
    members,
    applications,
    proposals,
    ledger,
    activity,
    wallet: { status: "disconnected", address: YOU.address, name: YOU.name, balance: 25000, lastError: null },
    settings: { slow: false, failNext: false },
    nextNumber: 20,
  }
}
