import { BookOpenCheckIcon, FilePenLineIcon, SendIcon, SignatureIcon, SplitIcon } from "lucide-react"

const ICONS = [FilePenLineIcon, SplitIcon, SignatureIcon, SendIcon, BookOpenCheckIcon]

/** Draft → route → approve → execute → record, as a flat orange line with five stations. */
export function LifecycleDiagram({ steps, label }: { steps: { name: string; body: string }[]; label: string }) {
  return (
    <figure aria-label={label} className="relative">
      <span aria-hidden="true" className="absolute top-5 bottom-5 left-5 w-0.5 rounded-full bg-primary md:top-5 md:right-[10%] md:bottom-auto md:left-[10%] md:h-0.5 md:w-auto" />
      <ol className="relative grid gap-6 md:grid-cols-5 md:gap-4">
        {steps.map((s, i) => {
          const Icon = ICONS[i] ?? FilePenLineIcon
          return (
            <li key={s.name} className="flex gap-4 md:flex-col md:items-center md:text-center">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-background">
                <Icon className="size-4.5 text-foreground" aria-hidden="true" />
              </span>
              <span>
                <span className="block font-bold">
                  <span className="mr-1.5 font-mono text-xs text-primary-ink">{i + 1}</span>
                  {s.name}
                </span>
                <span className="mt-1 block text-sm text-muted-foreground">{s.body}</span>
              </span>
            </li>
          )
        })}
      </ol>
    </figure>
  )
}
