"use client"

import { BanknoteArrowUpIcon, CheckIcon, RotateCcwIcon, ScrollTextIcon } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

import { GridLegend, MemberGrid, type DotKind } from "@/components/demo/member-grid"
import { cn } from "@/lib/utils"

type Phase = "routing" | "voting" | "quorum" | "passed" | "paid"

// The order in which 24 of the 34 members vote: 18 for, 4 against, 2 abstain.
const ARRIVALS: DotKind[] = "ffaffffbfffaffffafbfffaf".split("").map((c) => (c === "f" ? "for" : c === "a" ? "against" : "abstain"))
const ELECTORATE = 34
const QUORUM = 14

export interface HeroCardCopy {
  label: string
  coop: string
  title: string
  amount: string
  route: string
  members: string
  quorum: string
  replay: string
  states: Record<Phase, string>
  legend: { for: string; against: string; abstain: string; none: string }
}

function dotsAfter(n: number): DotKind[] {
  const got = ARRIVALS.slice(0, n)
  const f = got.filter((d) => d === "for").length
  const a = got.filter((d) => d === "against").length
  const ab = got.filter((d) => d === "abstain").length
  return [
    ...Array<DotKind>(f).fill("for"),
    ...Array<DotKind>(a).fill("against"),
    ...Array<DotKind>(ab).fill("abstain"),
    ...Array<DotKind>(ELECTORATE - n).fill("none"),
  ]
}

/** The hero's live proposal: routed by the charter, voted one member at a time, paid. */
export function HeroVoteCard({ copy }: { copy: HeroCardCopy }) {
  const [phase, setPhase] = useState<Phase>("paid")
  const [count, setCount] = useState(ARRIVALS.length)
  const timers = useRef<number[]>([])

  const play = useCallback(() => {
    for (const t of timers.current) window.clearTimeout(t)
    timers.current = []
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduce) {
      setPhase("paid")
      setCount(ARRIVALS.length)
      return
    }
    setPhase("routing")
    setCount(0)
    const at = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms))
    at(900, () => setPhase("voting"))
    ARRIVALS.forEach((_, i) => {
      at(1100 + i * 110, () => {
        setCount(i + 1)
        if (i + 1 === QUORUM) setPhase("quorum")
      })
    })
    const end = 1100 + ARRIVALS.length * 110
    at(end + 500, () => setPhase("passed"))
    at(end + 1700, () => setPhase("paid"))
  }, [])

  useEffect(() => {
    const id = window.setTimeout(play, 400)
    const list = timers.current
    return () => {
      window.clearTimeout(id)
      for (const t of list) window.clearTimeout(t)
    }
  }, [play])

  const routed = phase !== "routing"
  const done = phase === "passed" || phase === "paid"

  return (
    <figure aria-label={copy.label} className="relative w-full max-w-md rounded-3xl border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <span className="eyebrow text-muted-foreground">{copy.coop}</span>
        <button
          type="button"
          onClick={play}
          aria-label={copy.replay}
          title={copy.replay}
          className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <RotateCcwIcon className="size-4" aria-hidden="true" />
        </button>
      </div>
      <p className="mt-2 text-xl font-extrabold leading-tight">{copy.title}</p>
      <p className="mt-1 font-mono text-lg font-bold tabular-nums">{copy.amount}</p>

      <p
        className={cn(
          "mt-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors duration-200",
          routed ? "border-primary text-foreground" : "border-dashed text-muted-foreground"
        )}
      >
        <ScrollTextIcon className="size-3.5 text-primary" aria-hidden="true" />
        {copy.route}
      </p>

      <div className="mt-5">
        <MemberGrid dots={dotsAfter(count)} quorum={QUORUM} quorumLabel={copy.quorum} label="" className="gap-1.5 sm:gap-1.5" size="md" />
        <p className="mt-3 text-xs text-muted-foreground">{copy.members}</p>
      </div>

      <div aria-live="polite" className="mt-4 flex min-h-10 items-center gap-2 rounded-2xl bg-secondary px-3.5 py-2 text-sm font-bold">
        {phase === "paid" ? (
          <BanknoteArrowUpIcon className="size-4 text-success" aria-hidden="true" />
        ) : done || phase === "quorum" ? (
          <CheckIcon className="size-4 text-success" aria-hidden="true" />
        ) : (
          <span className="size-2 animate-pulse rounded-full bg-primary" aria-hidden="true" />
        )}
        <span key={phase} className="cd-rise">
          {copy.states[phase]}
        </span>
      </div>
      <GridLegend labels={copy.legend} quorum={copy.quorum} className="mt-4" />
    </figure>
  )
}
