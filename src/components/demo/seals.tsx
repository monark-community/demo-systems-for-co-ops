import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export interface SealItem {
  id: string
  name: string
  title: string
  signed: boolean
}

/** The committee's signatures as three rings; each signature stamps one. */
export function Seals({
  items,
  signedLabel,
  notSignedLabel,
  className,
}: {
  items: SealItem[]
  signedLabel: string
  notSignedLabel: string
  className?: string
}) {
  return (
    <ul className={cn("grid grid-cols-3 gap-2 sm:gap-3", className)}>
      {items.map((s) => (
        <li key={s.id} className="flex flex-col items-center gap-2 text-center">
          <span
            className={cn(
              "relative flex size-14 items-center justify-center rounded-full border-2 border-dashed sm:size-16",
              s.signed ? "border-primary" : "border-input"
            )}
          >
            {s.signed ? (
              <span className="cd-stamp flex size-11 items-center justify-center rounded-full border-2 border-primary bg-primary/15 text-primary-ink sm:size-12">
                <CheckIcon className="size-5" strokeWidth={2.5} aria-hidden="true" />
              </span>
            ) : null}
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-bold">{s.name}</span>
            <span className="text-xs text-muted-foreground">{s.title}</span>
            <span className={cn("mt-1 text-xs font-semibold", s.signed ? "text-success" : "text-muted-foreground")}>
              {s.signed ? signedLabel : notSignedLabel}
            </span>
          </span>
        </li>
      ))}
    </ul>
  )
}
