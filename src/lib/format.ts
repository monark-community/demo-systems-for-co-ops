import { intlLocale, type Locale } from "@/i18n/config"
import { TOKEN } from "@/lib/demo/tokens"
import type { Cents } from "@/lib/demo/types"

/** 148000 -> "1,480" (en) or "1 480" (fr); cents shown only when present. */
export function formatAmount(cents: Cents, locale: Locale): string {
  const whole = cents % 100 === 0
  return new Intl.NumberFormat(intlLocale[locale], {
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(cents / 100)
}

export function formatToken(cents: Cents, locale: Locale): string {
  return `${formatAmount(cents, locale)} ${TOKEN.symbol}`
}

export function formatPercent(fraction: number, locale: Locale, maxFrac = 0): string {
  return new Intl.NumberFormat(intlLocale[locale], { style: "percent", maximumFractionDigits: maxFrac }).format(fraction)
}

export function formatNumber(n: number, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale[locale], { maximumFractionDigits: 2 }).format(n)
}

export function formatDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale[locale], { dateStyle: "medium" }).format(new Date(iso))
}

export function formatDateTime(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale[locale], { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso))
}

/** "in 3 days", "2 hours ago"… */
export function formatRelative(iso: string, locale: Locale, nowMs = Date.now()): string {
  const diff = new Date(iso).getTime() - nowMs
  const abs = Math.abs(diff)
  const rtf = new Intl.RelativeTimeFormat(intlLocale[locale], { numeric: "auto" })
  const MIN = 60_000
  const HOUR = 60 * MIN
  const DAY = 24 * HOUR
  if (abs < HOUR) return rtf.format(Math.round(diff / MIN), "minute")
  if (abs < DAY) return rtf.format(Math.round(diff / HOUR), "hour")
  if (abs < 30 * DAY) return rtf.format(Math.round(diff / DAY), "day")
  return rtf.format(Math.round(diff / (30 * DAY)), "month")
}

export function shortHash(hash: string, start = 8, end = 6): string {
  return hash.length > start + end + 1 ? `${hash.slice(0, start)}…${hash.slice(-end)}` : hash
}

export function shortAddress(address: string): string {
  return address.length > 12 ? `${address.slice(0, 6)}…${address.slice(-4)}` : address
}

/** Parse a user-typed amount ("1,480.50", "1 480,50") into cents, or null. */
export function parseAmount(raw: string): Cents | null {
  const cleaned = raw.replace(/[\s  ]/g, "")
  if (!cleaned) return null
  // Last separator is the decimal one if followed by 1–2 digits.
  const m = cleaned.match(/^(\d{1,3}(?:[.,]\d{3})*|\d+)(?:[.,](\d{1,2}))?$/)
  if (!m) return null
  const whole = Number((m[1] ?? "0").replace(/[.,]/g, ""))
  const frac = m[2] ? Number(m[2].padEnd(2, "0")) : 0
  if (!Number.isFinite(whole)) return null
  return whole * 100 + frac
}
