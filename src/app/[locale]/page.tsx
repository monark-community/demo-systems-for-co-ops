import { ArrowRightIcon, PlusIcon } from "lucide-react"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { RouteDiagram } from "@/components/diagrams/route-diagram"
import { HeroVoteCard } from "@/components/home/hero-vote-card"
import { SectionDivider } from "@/components/site/section-divider"
import { Button } from "@/components/ui/button"
import { href, isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"

import assemblyImg from "../../../public/images/assembly.jpg"
import marketImg from "../../../public/images/market.jpg"
import studentsImg from "../../../public/images/students.jpg"

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  return pageMetadata(locale, "/", null, getDictionary(locale).meta.description)
}

const PHOTOS = [studentsImg, assemblyImg, marketImg]

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = getDictionary(locale)
  const h = dict.home

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden" aria-labelledby="hero-title">
        <Image
          src="/brand/monark-mesh.svg"
          alt=""
          width={569}
          height={571}
          unoptimized
          priority
          aria-hidden="true"
          className="pointer-events-none absolute -top-10 -right-48 w-[36rem] max-w-none opacity-[0.10] select-none sm:-right-28 lg:-top-24 lg:-right-16 lg:w-[50rem] dark:opacity-[0.16]"
        />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 pt-12 pb-16 sm:px-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-center lg:gap-16 lg:pt-20 lg:pb-24">
          <div>
            <p className="eyebrow text-primary-ink">{h.eyebrow}</p>
            <h1 id="hero-title" className="mt-4 text-[2.25rem] leading-[1.06] font-extrabold tracking-display sm:text-5xl lg:text-[4.1rem]">
              {/* Keep "co-op" from breaking at its hyphen. */}
              {h.title.split(" ").map((word, i) => (
                <span key={i}>
                  {i > 0 ? " " : null}
                  {word.includes("-") ? <span className="whitespace-nowrap">{word}</span> : word}
                </span>
              ))}
            </h1>
            <p className="mt-5 max-w-[34rem] text-lg text-muted-foreground sm:text-xl">{h.sub}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg">
                <Link href={href(locale, "/app")}>
                  {h.ctaPrimary}
                  <ArrowRightIcon aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href={href(locale, "/how-it-works")}>{h.ctaSecondary}</Link>
              </Button>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">{dict.common.demoBadge}</p>
          </div>
          <div className="flex justify-center lg:justify-end">
            <HeroVoteCard copy={h.card} />
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* Problem and benefits */}
      <section aria-labelledby="problem-title" className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:gap-16 lg:py-24">
        <div>
          <h2 id="problem-title" className="text-3xl font-bold tracking-display sm:text-[2.25rem]">
            {h.problem.title}
          </h2>
          <p className="mt-4 max-w-[52ch] text-lg text-muted-foreground">{h.problem.body}</p>
        </div>
        <ol className="flex flex-col">
          {h.problem.items.map((item, i) => (
            <li key={item.title} className="flex gap-5 border-b py-6 first:pt-0 last:border-b-0">
              <span className="font-mono text-sm font-bold text-primary-ink">0{i + 1}</span>
              <div>
                <h3 className="text-xl font-bold">{item.title}</h3>
                <p className="mt-1.5 text-muted-foreground">{item.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Three routes */}
      <section aria-labelledby="routes-title" className="bg-secondary/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
          <div className="max-w-2xl">
            <p className="eyebrow text-primary-ink">{h.routes.eyebrow}</p>
            <h2 id="routes-title" className="mt-3 text-3xl font-bold tracking-display sm:text-[2.25rem]">
              {h.routes.title}
            </h2>
            <p className="mt-3 text-lg text-muted-foreground">{h.routes.body}</p>
          </div>
          <RouteDiagram
            active="vote"
            ariaLabel={h.routes.diagramLabel}
            proposalText={h.card.amount}
            labels={{ proposal: h.routes.proposal, charter: h.routes.charter, items: h.routes.items }}
            className="mt-10"
          />
          <Link href={href(locale, "/how-it-works")} className="mt-8 inline-flex items-center gap-1.5 font-bold text-primary-ink underline underline-offset-4">
            {h.routes.cta}
            <ArrowRightIcon className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* Who */}
      <section aria-labelledby="who-title" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <p className="eyebrow text-primary-ink">{h.who.eyebrow}</p>
        <h2 id="who-title" className="mt-3 max-w-2xl text-3xl font-bold tracking-display sm:text-[2.25rem]">
          {h.who.title}
        </h2>
        <ul className="mt-10 grid gap-5 md:grid-cols-3">
          {h.who.items.map((item, i) => (
            <li key={item.title} className="flex flex-col overflow-hidden rounded-3xl border bg-card">
              <div className="relative aspect-[4/3]">
                <Image src={PHOTOS[i]!} alt={item.alt} fill placeholder="blur" sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-xl font-bold">{item.title}</h3>
                <p className="mt-1.5 text-muted-foreground">{item.body}</p>
                <p className="mt-4 inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold">
                  <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
                  {item.tag}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <SectionDivider />

      {/* FAQ */}
      <section aria-labelledby="faq-title" className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_2fr] lg:py-24">
        <h2 id="faq-title" className="text-3xl font-bold tracking-display sm:text-[2rem]">
          {h.faq.title}
        </h2>
        <div className="divide-y border-y">
          {h.faq.items.map((item) => (
            <details key={item.q} className="group py-1">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-lg py-3 text-lg font-bold [&::-webkit-details-marker]:hidden">
                {item.q}
                <PlusIcon className="size-5 shrink-0 text-primary transition-transform duration-200 group-open:rotate-45" aria-hidden="true" />
              </summary>
              <p className="max-w-[68ch] pb-5 text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Closing */}
      <section aria-labelledby="closing-title" className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
        <div className="flex flex-col items-start gap-6 rounded-3xl border bg-card p-8 sm:p-10 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 id="closing-title" className="text-2xl font-bold tracking-display sm:text-3xl">
              {h.closing.title}
            </h2>
            <p className="mt-2 text-muted-foreground">{h.closing.body}</p>
          </div>
          <Button asChild size="lg" className="shrink-0">
            <Link href={href(locale, "/app")}>
              {h.closing.cta}
              <ArrowRightIcon aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  )
}
