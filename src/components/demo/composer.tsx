"use client"

import { ArrowLeftIcon, Loader2Icon, SparklesIcon } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useId, useState, type ReactNode } from "react"
import { toast } from "sonner"

import { RouteDiagram } from "@/components/diagrams/route-diagram"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { href } from "@/i18n/config"
import { t } from "@/i18n/t"
import { useTx } from "@/lib/demo/chain"
import { isAddress, seededAddress } from "@/lib/demo/ids"
import { createProposal, type ProposalDraft } from "@/lib/demo/ops"
import { available, routeFor } from "@/lib/demo/rules"
import { getDemo, useDemo } from "@/lib/demo/store"
import type { Category, CharterKey } from "@/lib/demo/types"
import { formatToken, parseAmount } from "@/lib/format"
import { cn } from "@/lib/utils"

import { useAppCopy } from "./app-provider"
import { charterValue, routeRule } from "./labels"
import { membershipOf } from "./membership"
import { TxFeedback } from "./tx-feedback"

const CATEGORIES: Exclude<Category, "charter">[] = ["supplies", "equipment", "community", "operations"]
const KEYS: CharterKey[] = ["committeeLimit", "quorum", "votingDays", "memberShare"]
const RANGES: Record<CharterKey, [number, number]> = {
  committeeLimit: [50, 5000],
  quorum: [10, 90],
  votingDays: [2, 14],
  memberShare: [5, 200],
}
const isMoney = (k: CharterKey) => k === "committeeLimit" || k === "memberShare"

type Errors = Partial<Record<"title" | "amount" | "recipient" | "address" | "summary" | "value", string>>

export function Composer() {
  const demo = useDemo()
  const { app, locale } = useAppCopy()
  const params = useSearchParams()
  const router = useRouter()
  const uid = useId()
  const initialKind = params?.get("kind") === "charter" ? "charter" : "spend"
  const initialKey = (KEYS as string[]).includes(params?.get("rule") ?? "") ? (params?.get("rule") as CharterKey) : "committeeLimit"

  const [kind, setKind] = useState<"spend" | "charter">(initialKind)
  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [recipient, setRecipient] = useState("")
  const [address, setAddress] = useState("")
  const [category, setCategory] = useState<Exclude<Category, "charter">>("supplies")
  const [summary, setSummary] = useState("")
  const [key, setKey] = useState<CharterKey>(initialKey)
  const [value, setValue] = useState("")
  const [errors, setErrors] = useState<Errors>({})
  const [submitted, setSubmitted] = useState(false)
  const tx = useTx()

  if (!demo) return null
  const C = app.composer
  const F = C.fields
  const E = C.errors
  const S = app.summaries
  const member = membershipOf(demo).status === "member"
  const avail = available(demo)
  const cents = parseAmount(amount)
  const route = kind === "charter" ? "supermajority" : cents && cents > 0 ? routeFor(demo.charter, "spend", cents) : null
  const current = demo.charter[key]
  const toCharterValue = (raw: string): number | null => {
    if (isMoney(key)) return parseAmount(raw)
    const n = Number(raw.replace(",", "."))
    return Number.isInteger(n) ? n : null
  }
  const newValue = toCharterValue(value)

  const fill = (ex: { title: string; recipient: string; amount: string; summary: string }, cat: typeof category) => {
    setKind("spend")
    setTitle(ex.title)
    setRecipient(ex.recipient)
    setAmount(ex.amount)
    setSummary(ex.summary)
    setAddress(seededAddress(ex.recipient))
    setCategory(cat)
    setErrors({})
  }

  const validate = (): { ok: boolean; draft?: ProposalDraft } => {
    const e: Errors = {}
    if (kind === "spend") {
      if (title.trim().length < 4) e.title = E.title
      if (!cents || cents <= 0) e.amount = E.amount
      else if (cents > avail) e.amount = t(E.amountHigh, { available: formatToken(avail, locale) })
      if (recipient.trim().length < 2) e.recipient = E.recipient
      if (!isAddress(address)) e.address = E.address
      if (summary.trim().length < 12) e.summary = E.summary
      setErrors(e)
      if (Object.keys(e).length) return { ok: false }
      return {
        ok: true,
        draft: {
          kind: "spend",
          title: title.trim(),
          summary: summary.trim(),
          category,
          amount: cents!,
          recipient: { name: recipient.trim(), address: address.trim() },
        },
      }
    }
    const [min, max] = RANGES[key]
    const raw = newValue
    const asUnits = raw === null ? null : isMoney(key) ? raw / 100 : raw
    if (raw === null || asUnits === null || asUnits < min || asUnits > max)
      e.value = t(E.range, {
        min: isMoney(key) ? formatToken(min * 100, locale) : charterValue(key, min, app, locale),
        max: isMoney(key) ? formatToken(max * 100, locale) : charterValue(key, max, app, locale),
      })
    else if (raw === current) e.value = E.same
    if (summary.trim().length < 12) e.summary = E.summary
    setErrors(e)
    if (Object.keys(e).length) return { ok: false }
    const ruleName = app.charter.rules[key].name
    return {
      ok: true,
      draft: {
        kind: "charter",
        title: `${ruleName}: ${charterValue(key, current, app, locale)} → ${charterValue(key, raw!, app, locale)}`,
        summary: summary.trim(),
        category: "charter",
        change: { key, from: current, to: raw! },
      },
    }
  }

  const submit = () => {
    setSubmitted(true)
    const { ok, draft } = validate()
    if (!ok || !draft) return
    const r = routeFor(demo.charter, draft.kind, draft.amount)
    let createdId = ""
    void tx
      .run(
        {
          title: S.propose,
          rows: [
            { label: S.voteOn, value: draft.title },
            ...(draft.amount ? [{ label: S.proposeAmount, value: formatToken(draft.amount, locale) }] : []),
            { label: S.proposeRoute, value: app.routes[r] },
          ],
        },
        (hash) => {
          createdId = createProposal(draft, hash)
        }
      )
      .then((ok2) => {
        if (!ok2 || !createdId) return
        const n = getDemo()?.proposals.find((p) => p.id === createdId)?.number ?? ""
        toast.success(t(app.toasts.proposed, { n }))
        router.push(href(locale, `/app/proposals/${createdId}`))
      })
  }

  if (!member) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 py-12 text-center">
        <h1 className="text-3xl font-extrabold tracking-display">{C.title}</h1>
        <p className="text-muted-foreground">{C.member}</p>
        <Button asChild>
          <Link href={href(locale, "/app/members#join")}>{app.membership.join}</Link>
        </Button>
      </div>
    )
  }

  const errorCount = Object.keys(errors).length
  const field = (name: keyof Errors) => ({
    id: `${uid}-${name}`,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${uid}-${name}-err` : undefined,
  })
  const err = (name: keyof Errors) =>
    errors[name] ? (
      <p id={`${uid}-${name}-err`} className="mt-1.5 text-sm text-destructive">
        {errors[name]}
      </p>
    ) : null

  return (
    <div className="flex flex-col gap-6">
      <Link href={href(locale, "/app/proposals")} className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeftIcon className="size-4" aria-hidden="true" />
        {app.proposal.back}
      </Link>
      <header>
        <h1 className="text-4xl font-extrabold tracking-display">{C.title}</h1>
        <p className="mt-2 text-muted-foreground">{C.sub}</p>
      </header>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
          className="flex flex-col gap-5"
        >
          <fieldset>
            <legend className="text-sm font-bold">{C.kind.label}</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {(["spend", "charter"] as const).map((k) => (
                <Choice key={k} name={`${uid}-kind`} checked={kind === k} onChange={() => { setKind(k); setErrors({}) }}>
                  {C.kind[k]}
                </Choice>
              ))}
            </div>
          </fieldset>

          {kind === "spend" ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <SparklesIcon className="size-3.5" aria-hidden="true" />
                  {C.templates.label}
                </span>
                <Button type="button" size="xs" variant="outline" onClick={() => fill(C.examples.shelving, "equipment")}>
                  {C.templates.shelving}
                </Button>
                <Button type="button" size="xs" variant="outline" onClick={() => fill(C.examples.oven, "community")}>
                  {C.templates.oven}
                </Button>
              </div>
              <div>
                <Label htmlFor={`${uid}-title`}>{F.title}</Label>
                <Input {...field("title")} value={title} onChange={(e) => setTitle(e.target.value)} placeholder={F.titlePh} className="mt-1.5" />
                {err("title")}
              </div>
              <div>
                <Label htmlFor={`${uid}-amount`}>{F.amount}</Label>
                <div className="relative mt-1.5">
                  <Input {...field("amount")} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" className="pr-16 font-mono" />
                  <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm text-muted-foreground">tUSDC</span>
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">{t(F.amountHint, { available: formatToken(avail, locale) })}</p>
                {err("amount")}
                {/* Phones: the live route sits right under the amount (the full diagram is further down). */}
                {route ? (
                  <p aria-hidden="true" className="cd-rise mt-3 flex items-start gap-2 rounded-2xl border-2 border-primary bg-card px-3.5 py-2.5 text-sm lg:hidden">
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                    <span>
                      <span className="font-bold">{app.routes[route]}</span>
                      <span className="block text-xs text-muted-foreground">{routeRule(route, demo.charter, app, locale)}</span>
                    </span>
                  </p>
                ) : null}
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <Label htmlFor={`${uid}-recipient`}>{F.recipientName}</Label>
                  <Input {...field("recipient")} value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder={F.recipientNamePh} className="mt-1.5" />
                  {err("recipient")}
                </div>
                <div>
                  <Label htmlFor={`${uid}-address`}>{F.recipientAddress}</Label>
                  <Input {...field("address")} value={address} onChange={(e) => setAddress(e.target.value)} placeholder={F.recipientAddressPh} spellCheck={false} autoComplete="off" className="mt-1.5 font-mono text-sm" />
                  {err("address")}
                </div>
              </div>
              <fieldset>
                <legend className="text-sm font-bold">{F.category}</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <Choice key={c} name={`${uid}-cat`} checked={category === c} onChange={() => setCategory(c)} pill>
                      {app.categories[c]}
                    </Choice>
                  ))}
                </div>
              </fieldset>
            </>
          ) : (
            <>
              <fieldset>
                <legend className="text-sm font-bold">{F.rule}</legend>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {KEYS.map((k) => (
                    <Choice key={k} name={`${uid}-rule`} checked={key === k} onChange={() => { setKey(k); setValue(""); setErrors({}) }}>
                      <span className="flex flex-col text-left leading-tight">
                        <span>{app.charter.rules[k].name}</span>
                        <span className="text-xs font-semibold opacity-75">{t(C.charterNow, { value: charterValue(k, demo.charter[k], app, locale) })}</span>
                      </span>
                    </Choice>
                  ))}
                </div>
              </fieldset>
              <div>
                <Label htmlFor={`${uid}-value`}>{F.newValue}</Label>
                <div className="relative mt-1.5">
                  <Input {...field("value")} inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} placeholder={isMoney(key) ? String(current / 100) : String(current)} className="pr-20 font-mono" />
                  <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm text-muted-foreground">
                    {isMoney(key) ? "tUSDC" : key === "quorum" ? "%" : t(app.charter.days, { n: "" }).trim()}
                  </span>
                </div>
                {newValue !== null && newValue !== current && value ? (
                  <p className="mt-1.5 text-sm font-semibold">
                    {charterValue(key, current, app, locale)} → <span className="text-primary-ink">{charterValue(key, newValue, app, locale)}</span>
                  </p>
                ) : null}
                {err("value")}
              </div>
            </>
          )}

          <div>
            <Label htmlFor={`${uid}-summary`}>{F.summary}</Label>
            <textarea
              {...field("summary")}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder={F.summaryPh}
              rows={4}
              className="mt-1.5 w-full rounded-2xl border border-input bg-card px-4 py-3 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 aria-invalid:border-destructive md:text-sm"
            />
            {err("summary")}
          </div>

          {submitted && errorCount > 0 ? (
            <p role="alert" className="text-sm font-semibold text-destructive">
              {E.fix}
            </p>
          ) : null}

          <div className="flex flex-col gap-3">
            <Button type="submit" size="lg" className="w-full sm:w-auto sm:self-end" disabled={tx.busy}>
              {tx.busy ? <Loader2Icon className="animate-spin" aria-hidden="true" /> : null}
              {tx.busy ? C.pending : C.submit}
            </Button>
            <TxFeedback state={tx.state} onRetry={submit} onDismiss={tx.reset} />
          </div>
        </form>

        <aside aria-labelledby={`${uid}-preview`} className="flex flex-col gap-3 rounded-3xl border bg-secondary/50 p-5 lg:sticky lg:top-24">
          <h2 id={`${uid}-preview`} className="eyebrow text-muted-foreground">
            {C.preview}
          </h2>
          <p aria-live="polite" className="min-h-12 text-sm">
            {route ? (
              <>
                <span className="font-bold">{app.routes[route]}</span>
                <span className="block text-muted-foreground">{routeRule(route, demo.charter, app, locale)}</span>
              </>
            ) : (
              <span className="text-muted-foreground">{C.previewEmpty}</span>
            )}
          </p>
          <RouteDiagram
            active={route}
            ariaLabel={app.proposal.routeTitle}
            proposalText={kind === "spend" && cents ? formatToken(cents, locale) : kind === "charter" ? app.charter.rules[key].name : undefined}
            labels={{
              proposal: C.node,
              charter: app.nav.charter,
              items: (["committee", "vote", "supermajority"] as const).map((r) => ({ name: app.routes[r], rule: routeRule(r, demo.charter, app, locale) })),
            }}
            className="sm:grid-cols-1 [&>svg]:hidden"
          />
        </aside>
      </div>
    </div>
  )
}

function Label({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-bold">
      {children}
    </label>
  )
}

function Choice({ name, checked, onChange, children, pill }: { name: string; checked: boolean; onChange: () => void; children: ReactNode; pill?: boolean }) {
  return (
    <label
      className={cn(
        "flex min-h-11 cursor-pointer items-center border px-4 py-2 text-sm font-bold transition-colors duration-150 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring",
        pill ? "rounded-full" : "rounded-2xl",
        checked ? "border-foreground bg-foreground text-background" : "border-input bg-card hover:bg-muted"
      )}
    >
      <input type="radio" name={name} checked={checked} onChange={onChange} className="sr-only" />
      {children}
    </label>
  )
}
