/**
 * CoopDAO demo domain. Amounts are integer cents of tUSDC (2 decimals), so no
 * float rounding ever reaches the treasury. Times are ISO strings.
 */

export type Cents = number

export type StewardTitle = "treasurer" | "coordinator" | "secretary"

export interface Member {
  id: string
  name: string
  address: string
  joinedAt: string
  steward?: StewardTitle
  /** Votes taken part in, out of the proposals put to a vote since joining (seeded history). */
  votesCast: number
  votesOpen: number
  proposalsMade: number
  /** Past roles, e.g. "steward 2025". Free text in the seed language. */
  pastRoles: string[]
  isYou?: boolean
}

export type CharterKey = "memberShare" | "quorum" | "votingDays" | "committeeLimit"

export interface Charter {
  /** Refundable member share, in cents. */
  memberShare: Cents
  /** Percentage of members who must take part in an ordinary vote. */
  quorum: number
  votingDays: number
  /** Committee can approve expenses up to this amount (inclusive), in cents. */
  committeeLimit: Cents
  /** Signatures the committee needs (of `committeeSize`). */
  committeeThreshold: number
  committeeSize: number
  /** Charter changes: share of votes cast (for / (for + against)) and quorum. */
  supermajority: number
  charterQuorum: number
  termEndsAt: string
}

export interface CharterChange {
  id: string
  at: string
  key: CharterKey
  from: number
  to: number
  proposalId: string
  hash: string
}

export type Route = "committee" | "vote" | "supermajority"

export type ProposalStatus =
  | "committee" // waiting for committee signatures
  | "voting" // open member vote
  | "approved" // committee approved, not yet paid
  | "passed" // vote passed (spends: not yet paid; charter: enacted)
  | "executed" // paid from the treasury
  | "rejected"
  | "noQuorum"

export type Choice = "for" | "against" | "abstain"

export type Category = "equipment" | "supplies" | "community" | "operations" | "charter"

export interface Proposal {
  id: string
  number: number
  kind: "spend" | "charter"
  title: string
  summary: string
  category: Category
  amount?: Cents
  recipient?: { name: string; address: string }
  change?: { key: CharterKey; from: number; to: number }
  authorId: string
  createdAt: string
  route: Route
  status: ProposalStatus
  closesAt?: string
  closedAt?: string
  /** Member count when the proposal opened (quorum base). */
  electorate: number
  votes: Record<string, Choice>
  signatures: string[]
  /** Share of simulated remaining voters who vote "for", used by fast-forward (0..1). */
  lean: number
  /** Share of the electorate the simulation brings to vote in total (0..1). */
  turnout: number
  createdHash: string
  executedAt?: string
  executedHash?: string
}

export interface LedgerEntry {
  id: string
  at: string
  direction: "in" | "out"
  amount: Cents
  label: string
  counterparty: string
  proposalId?: string
  /** A member share paid in by someone joining (label is their name). */
  kind?: "share"
  hash: string
}

export interface Application {
  id: string
  name: string
  address: string
  note: string
  at: string
  signatures: string[]
  status: "waiting" | "admitted"
  hash: string
  isYou?: boolean
}

export type ActivityKind =
  | "joined"
  | "applied"
  | "proposed"
  | "voted"
  | "signed"
  | "passed"
  | "approved"
  | "rejected"
  | "noQuorum"
  | "executed"
  | "charter"
  | "deposit"

export interface Activity {
  id: string
  at: string
  kind: ActivityKind
  actor: string
  proposalId?: string
  amount?: Cents
  hash?: string
}

export interface WalletState {
  status: "disconnected" | "connecting" | "connected"
  address: string
  name: string
  /** tUSDC in the visitor's own wallet, in cents. */
  balance: Cents
  lastError: "rejected" | null
}

export interface DemoSettings {
  slow: boolean
  failNext: boolean
}

export interface DemoState {
  version: 1
  coopName: string
  treasuryAddress: string
  committeeAddress: string
  charter: Charter
  charterHistory: CharterChange[]
  members: Member[]
  applications: Application[]
  proposals: Proposal[]
  ledger: LedgerEntry[]
  activity: Activity[]
  wallet: WalletState
  settings: DemoSettings
  nextNumber: number
}

export interface TxRow {
  label: string
  value: string
}

export interface TxSummary {
  title: string
  rows?: TxRow[]
  /** Shows the testnet / not-financial-advice notice. */
  movesValue?: boolean
  noFee?: boolean
}

export interface TxState {
  phase: "idle" | "signing" | "pending" | "confirmed" | "failed"
  hash?: string
  error?: "rejected" | "reverted"
}
