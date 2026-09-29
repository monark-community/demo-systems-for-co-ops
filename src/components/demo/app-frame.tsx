"use client"

import { CheckIcon, Loader2Icon, WalletIcon, XCircleIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, type ReactNode } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { NetworkBadge } from "@/components/ui/network-badge"
import { href } from "@/i18n/config"
import { useDemo, useStorageOk } from "@/lib/demo/store"
import { connectWallet } from "@/lib/demo/wallet"
import { cn } from "@/lib/utils"

import { useAppCopy } from "./app-provider"
import { DemoControls } from "./demo-controls"
import { Disclaimer } from "./disclaimer"
import { MemberGrid } from "./member-grid"
import { MembershipChip, membershipOf } from "./membership"

/** App chrome under the site header: sub-navigation, network, disclaimer, demo controls; gates on wallet connection. */
export function AppFrame({ children }: { children: ReactNode }) {
  const demo = useDemo()
  const storageOk = useStorageOk()
  const { app, disclaimer } = useAppCopy()
  const connected = demo?.wallet.status === "connected"

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b bg-secondary/40">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 sm:px-6">
          <NetworkBadge name={app.network} variant="outline" icon={<span className="block size-full rounded-full bg-success" />} />
          {connected ? <MembershipChip /> : null}
          <Disclaimer text={disclaimer} className="order-last min-w-0 basis-full md:order-none md:basis-auto md:flex-1" />
          <div className="ml-auto md:ml-0">
            <DemoControls />
          </div>
        </div>
        {connected ? <SubNav /> : null}
        <WelcomeWatcher />
      </div>
      {!storageOk ? (
        <p role="alert" className="mx-auto mt-4 w-full max-w-6xl px-4 text-sm font-semibold text-warning sm:px-6">
          {app.storageOff}
        </p>
      ) : null}
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 sm:px-6 lg:py-10">
        {!demo ? <AppLoading label={app.loading} /> : !connected ? <ConnectGate /> : children}
      </div>
    </div>
  )
}

/** Toasts once when the committee admits the visitor. */
function WelcomeWatcher() {
  const demo = useDemo()
  const { app } = useAppCopy()
  const status = demo ? membershipOf(demo).status : null
  const prev = useRef(status)
  useEffect(() => {
    if (prev.current === "applying" && status === "member") toast.success(app.join.toast)
    prev.current = status
  }, [status, app.join.toast])
  return null
}

function SubNav() {
  const { app, locale } = useAppCopy()
  const pathname = usePathname() ?? ""
  const base = href(locale, "/app")
  const items = [
    { href: base, label: app.nav.overview, exact: true },
    { href: `${base}/proposals`, label: app.nav.proposals },
    { href: `${base}/treasury`, label: app.nav.treasury },
    { href: `${base}/members`, label: app.nav.members },
    { href: `${base}/charter`, label: app.nav.charter },
  ]
  return (
    <nav aria-label={app.nav.label} className="mx-auto max-w-6xl px-2 sm:px-4">
      <ul className="no-scrollbar -mb-px flex gap-1 overflow-x-auto">
        {items.map((it) => {
          const active = it.exact ? pathname === it.href : pathname === it.href || pathname.startsWith(`${it.href}/`)
          return (
            <li key={it.href} className="shrink-0">
              <Link
                href={it.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-11 items-center border-b-2 px-3 text-sm font-bold transition-colors duration-150",
                  active ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {it.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export function AppLoading({ label }: { label: string }) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-4">
      <span className="sr-only">{label}</span>
      <div className="h-9 w-56 animate-pulse rounded-full bg-muted" />
      <div className="grid gap-3 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
      <div className="h-40 animate-pulse rounded-2xl bg-muted" />
    </div>
  )
}

function ConnectGate() {
  const demo = useDemo()
  const { app } = useAppCopy()
  const g = app.gate
  const connecting = demo?.wallet.status === "connecting"
  const rejected = demo?.wallet.lastError === "rejected"
  const dots = Array.from({ length: 34 }, (_, i) => (i < 11 ? ("for" as const) : i < 14 ? ("against" as const) : ("none" as const)))

  return (
    <section aria-labelledby="gate-title" className="grid flex-1 items-center gap-10 py-4 lg:grid-cols-[1.1fr_1fr] lg:py-10">
      <div className="max-w-lg">
        <p className="eyebrow text-primary-ink">{g.eyebrow}</p>
        <h1 id="gate-title" className="mt-3 text-3xl font-extrabold tracking-display sm:text-4xl">
          {g.title}
        </h1>
        <p className="mt-3 text-muted-foreground">{g.body}</p>
        <ul className="mt-6 flex flex-col gap-2 text-sm">
          {g.points.map((f) => (
            <li key={f} className="flex items-center gap-2">
              <CheckIcon className="size-4 shrink-0 text-primary" aria-hidden="true" />
              {f}
            </li>
          ))}
        </ul>
        <Button
          size="lg"
          className="mt-8 w-full sm:w-auto"
          disabled={connecting}
          onClick={() =>
            void connectWallet({
              title: app.summaries.signIn,
              rows: [{ label: app.summaries.signInRow, value: app.summaries.signInValue }],
              movesValue: false,
              noFee: true,
            })
          }
        >
          {connecting ? <Loader2Icon className="animate-spin" aria-hidden="true" /> : <WalletIcon aria-hidden="true" />}
          {connecting ? app.wallet.connecting : g.connect}
        </Button>
        <div aria-live="polite" className="mt-4 min-h-6">
          {rejected ? (
            <p role="alert" className="flex items-start gap-2 text-sm text-destructive">
              <XCircleIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {g.rejected}
            </p>
          ) : null}
        </div>
      </div>
      <div aria-hidden="true" className="hidden rounded-3xl border bg-card p-8 lg:block">
        <p className="eyebrow text-muted-foreground">Le Grenier</p>
        <MemberGrid dots={dots} quorum={14} label="" className="mt-6 max-w-sm" />
        <div className="mt-8 grid grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <span key={i} className={cn("h-2 rounded-full", i === 0 ? "bg-primary" : "bg-muted")} />
          ))}
        </div>
      </div>
    </section>
  )
}
