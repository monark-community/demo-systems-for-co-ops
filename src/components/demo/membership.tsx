"use client"

import { BadgeCheckIcon, HourglassIcon, UserRoundIcon } from "lucide-react"
import Link from "next/link"

import { href } from "@/i18n/config"
import { you } from "@/lib/demo/rules"
import { useDemo } from "@/lib/demo/store"
import type { DemoState } from "@/lib/demo/types"

import { useAppCopy } from "./app-provider"

export type MembershipStatus = "visitor" | "applying" | "member"

export function membershipOf(s: DemoState) {
  const me = you(s)
  const application = s.applications.find((a) => a.isYou) ?? null
  const status: MembershipStatus = me ? "member" : application?.status === "waiting" ? "applying" : "visitor"
  return { status, me, application }
}

/** Where the visitor stands in the co-op, always visible in the app strip. */
export function MembershipChip() {
  const demo = useDemo()
  const { app, locale } = useAppCopy()
  if (!demo) return null
  const { status } = membershipOf(demo)
  const m = app.membership
  const Icon = status === "member" ? BadgeCheckIcon : status === "applying" ? HourglassIcon : UserRoundIcon
  const label = status === "member" ? m.member : status === "applying" ? m.applying : m.visitor
  return (
    <Link
      href={href(locale, "/app/members")}
      className="inline-flex h-7 items-center gap-1.5 rounded-full border bg-card px-2.5 text-xs font-bold hover:bg-muted"
    >
      <Icon className={status === "member" ? "size-3.5 text-success" : "size-3.5 text-muted-foreground"} aria-hidden="true" />
      {label}
    </Link>
  )
}
