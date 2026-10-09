"use client"

import { PlusIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription } from "@/components/ui/empty"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { href } from "@/i18n/config"
import { isExecutable, isOpen } from "@/lib/demo/rules"
import { useDemo } from "@/lib/demo/store"
import type { Proposal } from "@/lib/demo/types"

import { useAppCopy } from "./app-provider"
import { membershipOf } from "./membership"
import { ProposalCard } from "./proposal-card"

type Filter = "all" | "open" | "toPay" | "closed"

/** Proposals shown at a time (long lists are paged: brand guidelines §8, "Restraint"). */
const PAGE = 6

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
  const [shown, setShown] = useState(PAGE)
  if (!demo) return null
  const L = app.proposals
  const member = membershipOf(demo).status === "member"
  const list = [...demo.proposals].sort((a, b) => b.number - a.number).filter(match[filter])
  const filters: Filter[] = ["all", "open", "toPay", "closed"]

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-4xl font-extrabold tracking-display">{L.title}</h1>
        {member ? (
          <Button asChild size="lg" className="shrink-0">
            <Link href={href(locale, "/app/proposals/new")}>
              <PlusIcon aria-hidden="true" />
              {L.new}
            </Link>
          </Button>
        ) : null}
      </header>

      <ToggleGroup
        type="single"
        variant="chip"
        size="sm"
        value={filter}
        onValueChange={(f) => {
          if (!f) return
          setFilter(f as typeof filter)
          setShown(PAGE)
        }}
        aria-label={L.filters.label}
        className="no-scrollbar w-full flex-nowrap overflow-x-auto"
      >
        {filters.map((f) => (
          <ToggleGroupItem key={f} value={f}>
            {L.filters[f]}
            <span className="text-xs text-muted-foreground">{demo.proposals.filter(match[f]).length}</span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {list.length === 0 ? (
        <Empty size="lg" className="text-base">
          <EmptyDescription>{L.empty}</EmptyDescription>
          {member ? (
            <EmptyContent>
              <Button asChild variant="outline">
                <Link href={href(locale, "/app/proposals/new")}>{L.emptyCta}</Link>
              </Button>
            </EmptyContent>
          ) : null}
        </Empty>
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-2">
            {list.slice(0, shown).map((p) => (
              <ProposalCard key={p.id} p={p} demo={demo} />
            ))}
          </div>
          {list.length > shown ? (
            <Button variant="outline" className="self-center" onClick={() => setShown((n) => n + PAGE)}>
              {L.more}
            </Button>
          ) : null}
        </>
      )}
    </div>
  )
}
