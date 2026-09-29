"use client"

import { PlusIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { href } from "@/i18n/config"
import { isExecutable, isOpen } from "@/lib/demo/rules"
import { useDemo } from "@/lib/demo/store"
import type { Proposal } from "@/lib/demo/types"
import { cn } from "@/lib/utils"

import { useAppCopy } from "./app-provider"
import { membershipOf } from "./membership"
import { ProposalCard } from "./proposal-card"

type Filter = "all" | "open" | "toPay" | "closed"

const match: Record<Filter, (p: Proposal) => boolean> = {
  all: () => true,
  open: isOpen,
  toPay: isExecutable,
  closed: (p) => !isOpen(p) && !isExecutable(p),
}

export function ProposalList() {
  const demo = useDemo()
  const { app, locale } = useAppCopy()
  const [filter, setFilter] = useState<Filter>("all")
  if (!demo) return null
  const L = app.proposals
  const member = membershipOf(demo).status === "member"
  const list = [...demo.proposals].sort((a, b) => b.number - a.number).filter(match[filter])
  const filters: Filter[] = ["all", "open", "toPay", "closed"]

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-display">{L.title}</h1>
          <p className="mt-2 text-muted-foreground">{L.sub}</p>
        </div>
        {member ? (
          <Button asChild size="lg" className="shrink-0">
            <Link href={href(locale, "/app/proposals/new")}>
              <PlusIcon aria-hidden="true" />
              {L.new}
            </Link>
          </Button>
        ) : null}
      </header>

      <div role="group" aria-label={L.filters.label} className="no-scrollbar flex gap-2 overflow-x-auto">
        {filters.map((f) => {
          const count = demo.proposals.filter(match[f]).length
          return (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
              className={cn(
                "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-bold transition-colors duration-150",
                filter === f ? "border-foreground bg-foreground text-background" : "border-input hover:bg-muted"
              )}
            >
              {L.filters[f]}
              <span className={cn("text-xs", filter === f ? "text-background/80" : "text-muted-foreground")}>{count}</span>
            </button>
          )
        })}
      </div>

      {list.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed p-10 text-center">
          <p className="text-muted-foreground">{L.empty}</p>
          {member ? (
            <Button asChild variant="outline">
              <Link href={href(locale, "/app/proposals/new")}>{L.emptyCta}</Link>
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {list.map((p) => (
            <ProposalCard key={p.id} p={p} demo={demo} />
          ))}
        </div>
      )}
    </div>
  )
}
