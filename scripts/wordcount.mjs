// Word counts per page (English), for the simplification pass.
// Usage: pnpm build && pnpm start          (in another terminal; serves on port 3141)
//        node scripts/wordcount.mjs        (BASE_URL defaults to http://localhost:3141)
// Prints a Markdown table:
//   visible = words in <main> a visitor can read without opening anything (innerText)
//   total   = every word in <main>, including closed disclosures and FAQ answers
//   chrome  = visible words outside <main> (header, app bar, footer)
import { chromium } from "playwright"

const BASE = process.env.BASE_URL ?? "http://localhost:3141"

async function measure(page) {
  return page.evaluate(() => {
    const main = document.querySelector("main")
    const words = (s) => (s.match(/[\p{L}\p{N}][\p{L}\p{N}'’.,-]*/gu) ?? []).length
    const all = []
    const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.parentElement?.closest("script,style,svg") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
    })
    while (walker.nextNode()) all.push(walker.currentNode.nodeValue)
    const visible = words(main.innerText)
    const total = words(all.join(" "))
    const chrome = words(document.body.innerText) - visible
    return { visible, total, chrome }
  })
}

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "en-CA", reducedMotion: "reduce" })
const page = await context.newPage()
const rows = []

async function run(name, path) {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" })
  await page.getByRole("heading", { level: 1 }).first().waitFor()
  await page.waitForTimeout(800)
  rows.push({ name, ...(await measure(page)) })
}

for (const [name, path] of [
  ["Home", "/en"],
  ["How it works", "/en/how-it-works"],
  ["Credits", "/en/credits"],
  ["404", "/en/this-page-does-not-exist"],
]) await run(name, path)

await run("App: connect gate", "/en/app")
await page.getByRole("main").getByRole("button", { name: /connect/i }).click()
await page.getByRole("dialog").getByRole("button", { name: "Confirm", exact: true }).click()
await page.getByRole("heading", { level: 1, name: "Le Grenier", exact: true }).waitFor({ timeout: 10000 })
await page.waitForTimeout(800)
rows.push({ name: "App: overview (visitor)", ...(await measure(page)) })

// Join the co-op (flow 1) so the member-only views render in full.
await page.goto(`${BASE}/en/app/members`, { waitUntil: "networkidle" })
await page.locator("#join").getByRole("button", { name: /apply/i }).click()
await page.getByRole("dialog").getByRole("button", { name: "Confirm", exact: true }).click()
await page.getByRole("heading", { name: /Welcome, you're member/ }).waitFor({ timeout: 20000 })

await run("App: overview (member)", "/en/app")
await run("App: proposals", "/en/app/proposals")
await run("App: proposal #18 (vote)", "/en/app/proposals/p-18")
await run("App: proposal #16 (committee)", "/en/app/proposals/p-16")
await run("App: new proposal", "/en/app/proposals/new")
await run("App: treasury", "/en/app/treasury")
await run("App: members", "/en/app/members")
await run("App: charter", "/en/app/charter")

await browser.close()

const sum = (k) => rows.reduce((s, r) => s + r[k], 0)
console.log("| Page | Visible in main | Total in main (incl. collapsed) | Chrome (header, app bar, footer) |")
console.log("|-|-:|-:|-:|")
for (const r of rows) console.log(`| ${r.name} | ${r.visible} | ${r.total} | ${r.chrome} |`)
console.log(`| **Total** | **${sum("visible")}** | **${sum("total")}** | **${sum("chrome")}** |`)
