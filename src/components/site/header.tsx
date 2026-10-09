"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { DemoChip } from "@/components/ui/demo-chip"
import { HeaderAction } from "@/components/ui/header-action"
import { LocaleSwitch } from "@/components/ui/locale-switch"
import { SiteBrand } from "@/components/ui/site-brand"
import { SiteHeader } from "@/components/ui/site-header"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { href, locales, switchLocalePath, type Locale } from "@/i18n/config"
import { useDemo } from "@/lib/demo/store"
import { connectWallet, disconnectWallet } from "@/lib/demo/wallet"

/** Plain translated strings for the header, picked from the dictionary on the server. */
export interface HeaderCopy {
  product: string
  homeLabel: string
  nav: { overview: string; how: string; demo: string; label: string }
  launchDemo: string
  menu: string
  menuTitle: string
  closeMenu: string
  theme: string
  language: { label: string; names: Record<Locale, string>; short: Record<Locale, string> }
  demoChip: string
  demoBadge: string
  wallet: { connect: string; connecting: string; disconnect: string; signIn: string; signInRow: string; signInValue: string }
}

/**
 * The @monark/ui site shell wired to CoopDAO: brand, three page links, then
 * Demo chip, EN/FR, theme toggle and the one primary action ("Open the demo
 * co-op" outside the app, the demo wallet inside it).
 */
export function Header({ locale, copy }: { locale: Locale; copy: HeaderCopy }) {
  const pathname = usePathname() ?? `/${locale}`
  const demo = useDemo()
  const w = copy.wallet

  return (
    <SiteHeader
      pathname={pathname}
      LinkComponent={Link}
      brand={<SiteBrand name={copy.product} href={href(locale)} aria-label={copy.homeLabel} LinkComponent={Link} />}
      links={[
        { href: href(locale), label: copy.nav.overview, exact: true },
        { href: href(locale, "/how-it-works"), label: copy.nav.how },
        { href: href(locale, "/app"), label: copy.nav.demo },
      ]}
      labels={{ nav: copy.nav.label, openMenu: copy.menu, closeMenu: copy.closeMenu, menu: copy.menuTitle }}
      actions={
        <>
          <DemoChip label={copy.demoChip} description={copy.demoBadge} />
          <LocaleSwitch
            locales={locales}
            current={locale}
            hrefFor={(l) => switchLocalePath(pathname, l)}
            labels={copy.language}
            LinkComponent={Link}
            linkProps={{ prefetch: false }}
          />
          <ThemeToggle label={copy.theme} />
        </>
      }
      primaryAction={
        <HeaderAction
          appHref={href(locale, "/app")}
          pathname={pathname}
          launchLabel={copy.launchDemo}
          LinkComponent={Link}
          loading={!demo}
          wallet={{
            status: demo?.wallet.status,
            address: demo?.wallet.address,
            name: demo?.wallet.name,
            connectLabel: w.connect,
            connectingLabel: w.connecting,
            disconnectLabel: w.disconnect,
            onConnect: () =>
              void connectWallet({
                title: w.signIn,
                rows: [{ label: w.signInRow, value: w.signInValue }],
                movesValue: false,
                noFee: true,
              }),
            onDisconnect: disconnectWallet,
          }}
        />
      }
    />
  )
}
