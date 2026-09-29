import type { Choice } from "@/lib/demo/types"
import { cn } from "@/lib/utils"

export type DotKind = Choice | "none"

/**
 * One dot per member: the co-op principle drawn literally. Votes fill dots
 * (orange for, dark for against, ringed for abstain) in arrival order; the
 * quorum marker sits after the Nth dot. `youIndex` rings the visitor's dot.
 */
export function MemberGrid({
  dots,
  quorum,
  quorumLabel,
  youIndex,
  label,
  size = "md",
  className,
}: {
  dots: DotKind[]
  quorum?: number
  quorumLabel?: string
  youIndex?: number
  label: string
  size?: "sm" | "md"
  className?: string
}) {
  const dot = size === "sm" ? "size-3" : "size-5 sm:size-6"
  return (
    <div role="img" aria-label={label} className={cn("flex flex-wrap items-center gap-1.5 sm:gap-2", className)}>
      {dots.map((kind, i) => (
        <span key={i} className="contents">
          {quorum !== undefined && i === quorum ? (
            <span className="mx-0.5 h-7 w-1 shrink-0 rounded-full bg-primary sm:h-8" aria-hidden="true" title={quorumLabel} />
          ) : null}
          <span
            aria-hidden="true"
            data-kind={kind}
            className={cn(
              "shrink-0 rounded-full transition-colors duration-200",
              dot,
              kind === "for" && "cd-dot-in bg-primary",
              kind === "against" && "cd-dot-in bg-foreground",
              kind === "abstain" && "cd-dot-in border-[3px] border-foreground bg-card",
              kind === "none" && "border-2 border-border bg-card",
              youIndex === i && "ring-2 ring-primary ring-offset-2 ring-offset-card"
            )}
          />
        </span>
      ))}
    </div>
  )
}

export function GridLegend({
  labels,
  quorum,
  className,
}: {
  labels: { for: string; against: string; abstain: string; none: string }
  quorum?: string
  className?: string
}) {
  const items: { kind: DotKind; label: string }[] = [
    { kind: "for", label: labels.for },
    { kind: "against", label: labels.against },
    { kind: "abstain", label: labels.abstain },
    { kind: "none", label: labels.none },
  ]
  return (
    <ul className={cn("flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground", className)}>
      {items.map((it) => (
        <li key={it.kind} className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className={cn(
              "size-3 rounded-full",
              it.kind === "for" && "bg-primary",
              it.kind === "against" && "bg-foreground",
              it.kind === "abstain" && "border-2 border-foreground",
              it.kind === "none" && "border-2 border-border"
            )}
          />
          {it.label}
        </li>
      ))}
      {quorum ? (
        <li className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="h-3.5 w-1 rounded-full bg-primary" />
          {quorum}
        </li>
      ) : null}
    </ul>
  )
}
