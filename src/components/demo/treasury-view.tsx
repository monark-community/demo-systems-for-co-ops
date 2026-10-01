"use client"

import { ArrowDownLeftIcon, ArrowUpRightIcon, DownloadIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { InfoTip } from "@/components/ui/info-tip"
import { Wallet } from "@/components/ui/wallet"
import { href } from "@/i18n/config"
import { t } from "@/i18n/t"
import { available, committed, treasuryBalance } from "@/lib/demo/rules"
import { useDemo } from "@/lib/demo/store"
import type { LedgerEntry } from "@/lib/demo/types"
import { formatAmount, formatDate, shortHash } from "@/lib/format"
import { cn } from "@/lib/utils"

import { useAppCopy } from "./app-provider"

type Filter = "all" | "in" | "out"

/** Ledger rows shown at a time; the CSV export always has them all. */
const PAGE = 8

export function TreasuryView() {
  const demo = useDemo()
  const { app, locale } = useAppCopy()
  const [filter, setFilter] = useState<Filter>("all")
  const [shown, setShown] = useState(PAGE)
  if (!demo) return null
  const T = app.treasury

  const label = (e: LedgerEntry) => (e.kind === "share" ? t(T.share, { name: e.label }) : e.label)
  const rows = [...demo.ledger].sort((a, b) => b.at.localeCompare(a.at)).filter((e) => filter === "all" || e.direction === filter)
  const proposalNumber = (id?: string) => demo.proposals.find((p) => p.id === id)?.number

  const exportCsv = () => {
    const header = ["date", "direction", "amount_tUSDC", "what", "counterparty", "proposal", "tx_hash"]
    const lines = [...demo.ledger]
      .sort((a, b) => a.at.localeCompare(b.at))
      .map((e) =>
        [e.at, e.direction, (e.amount / 100).toFixed(2), label(e), e.counterparty, e.proposalId ? `#${proposalNumber(e.proposalId)}` : "", e.hash]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(",")
      )
    const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "le-grenier-ledger.csv"
    a.click()
    URL.revokeObjectURL(url)
    toast.success(T.exported)
  }

  const stats = [
    { label: T.balance, value: treasuryBalance(demo) },
    { label: T.committed, value: committed(demo) },
    { label: T.available, value: available(demo), strong: true },
  ]

  return (
    <div className="flex flex-col gap-8">
      <h1 className="flex items-center gap-1.5 text-4xl font-extrabold tracking-display">
        {T.title}
        <InfoTip label={`${app.info}: ${T.title}`}>{T.sub}</InfoTip>
      </h1>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <dl className="grid gap-3 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className={cn("rounded-2xl border bg-card p-4", s.strong && "border-2 border-primary")}>
              <dt className="text-xs font-semibold text-muted-foreground">{s.label}</dt>
              <dd className="mt-1 flex items-baseline gap-1.5">
                <span className="font-mono text-2xl font-bold tabular-nums tracking-tight">{formatAmount(s.value, locale)}</span>
                <span className="text-xs text-muted-foreground">tUSDC</span>
              </dd>
            </div>
          ))}
        </dl>
        <div className="flex flex-col gap-3 rounded-2xl border bg-card p-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-muted-foreground">{T.address}</span>
            <Wallet address={demo.treasuryAddress} size="sm" className="w-fit" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-muted-foreground">{T.committee}</span>
            <Wallet address={demo.committeeAddress} size="sm" className="w-fit" />
          </div>
        </div>
      </div>

      <section aria-labelledby="ledger-title" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="ledger-title" className="text-xl font-bold">
            {T.ledger}
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <div role="group" aria-label={T.filters.label} className="flex gap-1 rounded-full border p-1">
              {(["all", "in", "out"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  aria-pressed={filter === f}
                  onClick={() => {
                    setFilter(f)
                    setShown(PAGE)
                  }}
                  className={cn(
                    "h-8 rounded-full px-3 text-xs font-bold transition-colors duration-150",
                    filter === f ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {T.filters[f]}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <DownloadIcon aria-hidden="true" />
              {T.export}
            </Button>
          </div>
        </div>

        {rows.length === 0 ? (
          <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">{T.empty}</p>
        ) : (
          <div className="overflow-hidden rounded-2xl border bg-card">
            <table className="w-full text-sm">
              <caption className="sr-only">{T.ledger}</caption>
              <thead className="hidden border-b bg-secondary/60 text-left text-xs text-muted-foreground md:table-header-group">
                <tr>
                  <th scope="col" className="px-4 py-2.5 font-semibold">{T.cols.date}</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">{T.cols.what}</th>
                  <th scope="col" className="px-4 py-2.5 text-right font-semibold">{T.cols.amount}</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">{T.cols.tx}</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, shown).map((e) => {
                  const n = proposalNumber(e.proposalId)
                  const Icon = e.direction === "in" ? ArrowDownLeftIcon : ArrowUpRightIcon
                  return (
                    <tr key={e.id} className="grid grid-cols-[1fr_auto] gap-x-3 border-b px-4 py-3 last:border-b-0 md:table-row md:px-0 md:py-0">
                      <td className="order-2 col-span-2 text-xs text-muted-foreground md:table-cell md:px-4 md:py-3 md:text-sm" title={e.hash}>
                        {formatDate(e.at, locale)}
                      </td>
                      <td className="order-1 min-w-0 md:table-cell md:px-4 md:py-3">
                        <span className="flex items-start gap-2">
                          <Icon className={cn("mt-0.5 size-4 shrink-0", e.direction === "in" ? "text-success" : "text-foreground")} aria-label={e.direction === "in" ? T.in : T.out} />
                          <span className="min-w-0">
                            <span className="block font-semibold">{label(e)}</span>
                            <span className="block text-xs text-muted-foreground">
                              {e.counterparty}
                              {n ? (
                                <>
                                  {" · "}
                                  <Link href={href(locale, `/app/proposals/${e.proposalId}`)} className="font-semibold text-primary-ink underline underline-offset-2">
                                    {t(T.proposalLink, { n })}
                                  </Link>
                                </>
                              ) : null}
                            </span>
                          </span>
                        </span>
                      </td>
                      <td className={cn("order-1 text-right font-mono font-bold tabular-nums whitespace-nowrap md:table-cell md:px-4 md:py-3", e.direction === "in" ? "text-success" : "")}>
                        {e.direction === "in" ? "+" : "−"}
                        {formatAmount(e.amount, locale)}
                      </td>
                      <td className="hidden font-mono text-xs text-muted-foreground md:table-cell md:px-4 md:py-3" title={e.hash}>
                        {shortHash(e.hash)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        {rows.length > shown ? (
          <Button variant="outline" className="self-center" onClick={() => setShown((n) => n + PAGE)}>
            {T.more}
          </Button>
        ) : null}
      </section>
    </div>
  )
}
