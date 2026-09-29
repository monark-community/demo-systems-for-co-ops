import { cn } from "@/lib/utils"

/** Marks the site as a simulated demo (guidelines §10). */
export function DemoChip({ label, title, className }: { label: string; title?: string; className?: string }) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full bg-primary/12 px-2.5 text-xs font-bold text-primary-ink",
        className
      )}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-primary" />
      {label}
      {title ? <span className="sr-only"> ({title})</span> : null}
    </span>
  )
}
