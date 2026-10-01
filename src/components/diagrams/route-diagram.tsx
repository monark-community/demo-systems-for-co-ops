import { FileTextIcon, ScrollTextIcon } from "lucide-react"

import type { Route } from "@/lib/demo/types"
import { cn } from "@/lib/utils"

export interface RouteItemCopy {
  name: string
  rule: string
  body?: string
}

const ORDER: Route[] = ["committee", "vote", "supermajority"]
const Y = [1 / 6, 3 / 6, 5 / 6]

/** Mini glyphs for each route, flat orange line art. */
function RouteGlyph({ route, active }: { route: Route; active: boolean }) {
  const stroke = active ? "var(--primary)" : "var(--input)"
  if (route === "committee") {
    return (
      <svg viewBox="0 0 60 20" className="h-5 w-15" aria-hidden="true">
        {[10, 30, 50].map((cx, i) => (
          <circle key={cx} cx={cx} cy={10} r={7} fill={i < 2 && active ? "var(--primary)" : "none"} stroke={stroke} strokeWidth={2} />
        ))}
      </svg>
    )
  }
  if (route === "vote") {
    return (
      <svg viewBox="0 0 60 20" className="h-5 w-15" aria-hidden="true">
        {Array.from({ length: 12 }, (_, i) => (
          <circle
            key={i}
            cx={5 + (i % 6) * 10}
            cy={i < 6 ? 5 : 15}
            r={3.4}
            fill={active && i < 8 ? "var(--primary)" : "none"}
            stroke={stroke}
            strokeWidth={1.5}
          />
        ))}
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 60 20" className="h-5 w-15" aria-hidden="true">
      <circle cx={30} cy={10} r={8} fill="none" stroke="var(--border)" strokeWidth={3} />
      <path d="M30 2 A8 8 0 1 1 23.07 14" fill="none" stroke={stroke} strokeWidth={3} strokeLinecap="round" />
    </svg>
  )
}

/**
 * A proposal enters the charter and leaves by one of three routes. The
 * active route runs in flat orange; the others stay neutral. Stacks on phones.
 */
export function RouteDiagram({
  active,
  labels,
  proposalText,
  ariaLabel,
  className,
}: {
  active: Route | null
  labels: { proposal: string; charter: string; items: RouteItemCopy[] }
  proposalText?: string
  ariaLabel: string
  className?: string
}) {
  return (
    <figure aria-label={ariaLabel} className={cn("grid items-center gap-3 sm:grid-cols-[minmax(0,11rem)_4.5rem_minmax(0,1fr)] sm:gap-0", className)}>
      {/* Left: proposal into the charter */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2.5 rounded-2xl border bg-card px-3.5 py-2.5">
          <FileTextIcon className="size-4 shrink-0 text-primary" aria-hidden="true" />
          <span className="min-w-0 leading-tight">
            <span className="block text-sm font-bold">{labels.proposal}</span>
            {proposalText ? <span className="block truncate font-mono text-xs text-muted-foreground">{proposalText}</span> : null}
          </span>
        </div>
        <span aria-hidden="true" className="ml-5 h-3 w-0.5 rounded-full bg-primary" />
        <div className="flex items-center gap-2.5 rounded-2xl border-2 border-primary bg-card px-3.5 py-2.5">
          <ScrollTextIcon className="size-4 shrink-0 text-primary" aria-hidden="true" />
          <span className="text-sm font-bold">{labels.charter}</span>
        </div>
      </div>

      {/* Middle: connectors (desktop) */}
      <svg aria-hidden="true" viewBox="0 0 100 300" preserveAspectRatio="none" className="hidden h-full min-h-56 w-full sm:block">
        {ORDER.map((r, i) => {
          const y = (Y[i] ?? 0.5) * 300
          const on = active === r
          return (
            <path
              key={r}
              d={`M 0 205 C 50 205, 50 ${y}, 100 ${y}`}
              fill="none"
              stroke={on ? "var(--primary)" : "var(--border)"}
              strokeWidth={on ? 3 : 2}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              className={cn("transition-[stroke] duration-200", on && "cd-flowing")}
            />
          )
        })}
      </svg>

      {/* Right: the three routes */}
      <ol className="flex flex-col gap-2.5">
        {ORDER.map((r, i) => {
          const item = labels.items[i]
          const on = active === r
          const dim = active !== null && !on
          return (
            <li
              key={r}
              data-active={on || undefined}
              className={cn(
                "flex items-start gap-3 rounded-2xl border bg-card px-4 py-3 transition-[border-color,opacity] duration-200",
                on && "border-2 border-primary",
                dim && "opacity-55"
              )}
            >
              <span className="mt-1 shrink-0">
                <RouteGlyph route={r} active={on || active === null} />
              </span>
              <span className="min-w-0 leading-snug">
                <span className="flex flex-wrap items-baseline gap-x-2">
                  <span className="font-bold">{item?.name}</span>
                  <span className="text-xs font-semibold text-primary-ink">{item?.rule}</span>
                </span>
                {item?.body ? <span className="mt-0.5 block text-sm text-muted-foreground">{item.body}</span> : null}
              </span>
            </li>
          )
        })}
      </ol>
    </figure>
  )
}
