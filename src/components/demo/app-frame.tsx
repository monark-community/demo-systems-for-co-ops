"use client"

import { HouseIcon, Loader2Icon, WalletIcon, XCircleIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, type ReactNode } from "react"
import { toast } from "sonner"

import { AppLoading } from "@/components/ui/app-loading"
import { AppTabs, type AppTab } from "@/components/ui/app-tabs"
import { Button } from "@/components/ui/button"
import { DemoControls } from "@/components/ui/demo-controls"
import { FieldError } from "@/components/ui/field-error"
import { href } from "@/i18n/config"
import { resetDemo, setSettings, useDemo, useStorageOk } from "@/lib/demo/store"
import { connectWallet } from "@/lib/demo/wallet"
import { cn } from "@/lib/utils"

import { useAppCopy } from "./app-provider"
import { MemberGrid } from "./member-grid"
import { membershipOf } from "./membership"

/**
 * App chrome under the site header: ONE compact bar with the section nav on
 * the left and the network + demo controls pill on the right. No testnet
 * strip: that line lives in the wallet prompt, once per transaction. Gates on
 * wallet connection.
 */
export function AppFrame({ children }: { children: ReactNode }) {
  const demo = useDemo()
  const storageOk = useStorageOk()
  const { app, locale } = useAppCopy()
  const connected = demo?.wallet.status === "connected"
  const pathname = usePathname() ?? ""
  const base = href(locale, "/app")
  const sections: AppTab[] = [
    {
      href: base,
      exact: true,
      // Phones: Overview is a house icon, so the five sections fit on one bar.
      label: (
        <>
          <HouseIcon className="size-4 sm:hidden" aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">{app.nav.overview}</span>
        </>
      ),
    },
    { href: `${base}/proposals`, label: app.nav.proposals },
    { href: `${base}/treasury`, label: app.nav.treasury },
    { href: `${base}/members`, label: app.nav.members },
    { href: `${base}/charter`, label: app.nav.charter },
  ]

  return (
    <div className="flex flex-1 flex-col">
      <AppTabs
        tabs={connected ? sections : []}
        pathname={pathname}
        LinkComponent={Link}
        label={app.nav.label}
        actions={demo ? <Controls /> : null}
      />
      <WelcomeWatcher />
      {!storageOk ? (
        <p role="alert" className="mx-auto mt-4 w-full max-w-6xl px-4 text-sm font-semibold text-warning sm:px-6">
          {app.storageOff}
        </p>
      ) : null}
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 sm:px-6 lg:py-10">
        {!demo ? <AppLoading label={app.loading} panels={1} /> : !connected ? <ConnectGate /> : children}
      </div>
    </div>
  )
}

/** Toasts once when the committee admits the visitor, unless the members page (which shows the welcome) is open. */
function WelcomeWatcher() {
  const demo = useDemo()
  const { app, locale } = useAppCopy()
  const pathname = usePathname() ?? ""
  const onMembers = pathname === href(locale, "/app/members")
  const status = demo ? membershipOf(demo).status : null
  const prev = useRef(status)
  useEffect(() => {
    if (prev.current === "applying" && status === "member" && !onMembers) toast.success(app.join.toast)
    prev.current = status
  }, [status, onMembers, app.join.toast])
  return null
}

/** The app bar's one demo element: network speed, forced failure and "Reset demo". */
function Controls() {
  const demo = useDemo()
  const { app, seed, locale } = useAppCopy()
  const c = app.controls
  if (!demo) return null
  return (
    <DemoControls
      networkName={app.network}
      slow={demo.settings.slow}
      onSlowChange={(v) => setSettings({ slow: v })}
      failNext={demo.settings.failNext}
      onFailNextChange={(v) => setSettings({ failNext: v })}
      onReset={() => {
        resetDemo(seed, locale)
        toast.success(c.resetDone)
      }}
      title={c.title}
      openLabel={c.open}
      slowLabel={c.slow}
      slowHint={c.slowHint}
      failNextLabel={c.failNext}
      failNextHint={c.failNextHint}
      resetLabel={c.reset}
      resetHint={c.resetHint}
      resetConfirmTitle={c.resetConfirm}
      resetConfirmBody={c.resetConfirmBody}
      resetConfirmLabel={c.resetDo}
      cancelLabel={c.cancel}
      closeLabel={app.close}
    />
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
        <h1 id="gate-title" className="text-3xl font-extrabold tracking-display sm:text-4xl">
          {g.title}
        </h1>
        <p className="mt-3 text-muted-foreground">{g.body}</p>
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
          <FieldError icon={<XCircleIcon />}>{rejected ? g.rejected : null}</FieldError>
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
