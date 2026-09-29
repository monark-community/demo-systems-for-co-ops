"use client"

import {
  BadgeCheckIcon,
  BanknoteArrowDownIcon,
  BanknoteArrowUpIcon,
  CheckCheckIcon,
  CircleSlashIcon,
  FilePlus2Icon,
  PenLineIcon,
  ScrollTextIcon,
  UserPlusIcon,
  VoteIcon,
  XIcon,
} from "lucide-react"
import Link from "next/link"

import { href } from "@/i18n/config"
import { t } from "@/i18n/t"
import { formatRelative, formatToken, shortHash } from "@/lib/format"
import type { Activity, DemoState } from "@/lib/demo/types"

import { useAppCopy } from "./app-provider"
import { memberName } from "./labels"

const ICONS = {
  joined: BadgeCheckIcon,
  applied: UserPlusIcon,
  proposed: FilePlus2Icon,
  voted: VoteIcon,
  signed: PenLineIcon,
  passed: CheckCheckIcon,
  approved: CheckCheckIcon,
  rejected: XIcon,
  noQuorum: CircleSlashIcon,
  executed: BanknoteArrowUpIcon,
  charter: ScrollTextIcon,
  deposit: BanknoteArrowDownIcon,
} as const

export function ActivityFeed({ demo, limit = 8, proposalId }: { demo: DemoState; limit?: number; proposalId?: string }) {
  const { app, locale } = useAppCopy()
  const a = app.activity
  const items = [...demo.activity]
    .filter((x) => !proposalId || x.proposalId === proposalId)
    .sort((x, y) => y.at.localeCompare(x.at))
    .slice(0, limit)
  if (items.length === 0) return <p className="text-sm text-muted-foreground">{app.overview.noActivity}</p>

  const text = (it: Activity) => {
    const p = it.proposalId ? demo.proposals.find((x) => x.id === it.proposalId) : undefined
    const vars = {
      actor: memberName(demo, it.actor, app),
      n: p?.number ?? "",
      title: p ? (locale === "fr" ? `« ${p.title} »` : `“${p.title}”`) : "",
      amount: it.amount ? formatToken(it.amount, locale) : "",
    }
    if (it.kind === "signed") return t(p ? a.signedOn : a.signed, vars)
    return t(a[it.kind], vars)
  }

  return (
    <ol className="flex flex-col">
      {items.map((it) => {
        const Icon = ICONS[it.kind]
        const link = it.proposalId ? href(locale, `/app/proposals/${it.proposalId}`) : null
        return (
          <li key={it.id} className="flex gap-3 border-b py-3 last:border-b-0">
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary">
              <Icon className="size-3.5 text-foreground" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1 text-sm">
              {link ? (
                <Link href={link} className="hover:underline hover:underline-offset-4">
                  {text(it)}
                </Link>
              ) : (
                <span>{text(it)}</span>
              )}
              <p className="mt-0.5 flex flex-wrap gap-x-2 text-xs text-muted-foreground">
                <time dateTime={it.at}>{formatRelative(it.at, locale)}</time>
                {it.hash ? (
                  <span className="font-mono" title={it.hash}>
                    {shortHash(it.hash)}
                  </span>
                ) : null}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
