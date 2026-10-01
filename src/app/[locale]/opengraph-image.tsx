import { readFile } from "node:fs/promises"
import { join } from "node:path"

import { ImageResponse } from "next/og"

import { isLocale, locales } from "@/i18n/config"
import { getDictionary } from "@/i18n"

export const alt = "CoopDAO by Monark"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

// 34 members: 18 for, 4 against, 2 abstain, 10 not voted (the hero proposal).
const DOTS = Array.from({ length: 34 }, (_, i) => (i < 18 ? "for" : i < 22 ? "against" : i < 24 ? "abstain" : "none"))

export default async function OpenGraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params
  const locale = isLocale(raw) ? raw : "en"
  const d = getDictionary(locale)
  const mark = await readFile(join(process.cwd(), "public/brand/monark-mark.svg"), "utf8")
  const markSrc = `data:image/svg+xml;base64,${Buffer.from(mark).toString("base64")}`

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#FFF9F3", color: "#15110E", padding: 72 }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 600 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={markSrc} width={64} height={64} alt="" />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 44, fontWeight: 800, lineHeight: 1 }}>CoopDAO</span>
              <span style={{ fontSize: 22, color: "#625952", marginTop: 6 }}>{d.common.byMonark}</span>
            </div>
          </div>
          <div style={{ fontSize: 60, fontWeight: 800, lineHeight: 1.08, letterSpacing: -1.5 }}>{d.meta.ogTagline}</div>
          <div style={{ fontSize: 22, color: "#625952" }}>{d.common.demoBadge}</div>
        </div>
        <div
          style={{
            marginLeft: 48,
            width: 408,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 22,
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, width: 408 }}>
            {DOTS.map((kind, i) => (
              <div
                key={i}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  background: kind === "for" ? "#F88D10" : kind === "against" ? "#15110E" : "#FFFEFC",
                  border: kind === "abstain" ? "4px solid #15110E" : kind === "none" ? "3px solid #E9DFD7" : "0",
                }}
              />
            ))}
          </div>
          {d.meta.ogPoints.map((p) => (
            <div key={p} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 24, fontWeight: 700 }}>
              <div style={{ width: 14, height: 14, borderRadius: 7, border: "3px solid #F88D10" }} />
              {p}
            </div>
          ))}
        </div>
      </div>
    ),
    size
  )
}
