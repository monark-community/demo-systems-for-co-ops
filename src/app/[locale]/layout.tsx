import type { Metadata, Viewport } from "next"
import { Nunito_Sans } from "next/font/google"
import { notFound } from "next/navigation"

import "../globals.css"

import Link from "next/link"

import { Header, type HeaderCopy } from "@/components/site/header"
import { MONARK_SOCIALS, SiteFooter } from "@/components/ui/site-footer"
import { ThemeProvider } from "@/components/ui/theme-toggle"
import { href, isLocale, locales, PROJECT_ID, REPO_URL, SITE_URL, type Locale } from "@/i18n/config"
import { getDictionary, type Dictionary } from "@/i18n"

function headerCopy(dict: Dictionary): HeaderCopy {
  const c = dict.common
  const s = dict.app.summaries
  return {
    product: c.product,
    homeLabel: c.homeLabel,
    nav: { overview: c.nav.overview, how: c.nav.how, demo: c.nav.demo, label: c.nav.label },
    launchDemo: c.launchDemo,
    menu: c.menu,
    menuTitle: c.menuTitle,
    closeMenu: c.closeMenu,
    theme: c.theme.toggle,
    language: { label: c.language.label, names: { en: c.language.en, fr: c.language.fr }, short: c.language.short },
    demoChip: c.demoChip,
    demoBadge: c.demoBadge,
    wallet: { ...dict.app.wallet, signIn: s.signIn, signInRow: s.signInRow, signInValue: s.signInValue },
  }
}

function Footer({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const c = dict.common
  const f = c.footer
  return (
    <SiteFooter
      product={c.product}
      description={f.product}
      LinkComponent={Link}
      links={[
        { href: href(locale), label: c.nav.overview },
        { href: href(locale, "/how-it-works"), label: c.nav.how },
        { href: href(locale, "/app"), label: c.nav.demo },
        { href: href(locale, "/credits"), label: c.nav.credits },
      ]}
      resources={[
        { href: `https://www.monark.io/${locale}/project/${PROJECT_ID}`, label: f.projectPage },
        { href: REPO_URL, label: f.repo },
      ]}
      socials={MONARK_SOCIALS.map((s) => ({ ...s, label: f.social[s.key as keyof typeof f.social] }))}
      copyright={`© ${new Date().getFullYear()} ${f.legal}`}
      demoNotice={c.demoBadge}
      legalLinks={[{ href: href(locale, "/credits"), label: f.photos }]}
      labels={{ productNav: f.productNav, builtBy: f.builtBy, monarkHome: f.monarkHome, tagline: f.tagline, socials: f.socialLabel }}
    />
  )
}

const nunito = Nunito_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-nunito",
  display: "swap",
})

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale).meta
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: d.title, template: d.titleTemplate },
    description: d.description,
    applicationName: "CoopDAO",
    openGraph: {
      type: "website",
      siteName: locale === "fr" ? "CoopDAO par Monark" : "CoopDAO by Monark",
      title: d.title,
      description: d.description,
      locale: locale === "fr" ? "fr_CA" : "en_CA",
      url: `/${locale}`,
    },
    twitter: { card: "summary_large_image", title: d.title, description: d.description },
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fff9f3" },
    { media: "(prefers-color-scheme: dark)", color: "#1a0b02" },
  ],
  width: "device-width",
  initialScale: 1,
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = getDictionary(locale)

  return (
    <html lang={locale} className={nunito.variable} suppressHydrationWarning>
      <body className="flex min-h-dvh flex-col">
        <ThemeProvider>
          <a
            href="#main"
            className="sr-only z-50 rounded-full bg-primary px-4 py-2 font-bold text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
          >
            {dict.common.skip}
          </a>
          <Header locale={locale} copy={headerCopy(dict)} />
          <main id="main" tabIndex={-1} className="flex flex-1 flex-col outline-none">
            {children}
          </main>
          <Footer locale={locale} dict={dict} />
        </ThemeProvider>
      </body>
    </html>
  )
}
