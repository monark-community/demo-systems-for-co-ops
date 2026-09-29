// Visual check of every page and key flow with Playwright.
// Usage: pnpm build && pnpm start   (in another terminal; serves on port 3141)
//        pnpm screenshots            (BASE_URL defaults to http://localhost:3141)
// Output: docs/screenshots/<locale>-<width>-<theme>-<name>.png
import { mkdir } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { chromium } from "playwright"

const BASE = process.env.BASE_URL ?? "http://localhost:3141"
const OUT = fileURLToPath(new URL("../docs/screenshots/", import.meta.url))
const ONLY = process.env.ONLY // optional filter on the variant tag

const sizes = { 390: { width: 390, height: 844 }, 1440: { width: 1440, height: 900 } }
const variants = []
for (const w of [390, 1440]) for (const theme of ["light", "dark"]) variants.push({ locale: "en", w, theme })
for (const w of [390, 1440]) variants.push({ locale: "fr", w, theme: "light" })

const T = {
  en: { connect: "Connect demo wallet", confirm: "Confirm", overview: "Le Grenier" },
  fr: { connect: "Connecter le portefeuille de démo", confirm: "Confirmer", overview: "Le Grenier" },
}

async function newPage(browser, { locale, w, theme }) {
  const context = await browser.newContext({
    viewport: sizes[w],
    colorScheme: theme,
    locale: locale === "fr" ? "fr-CA" : "en-CA",
    reducedMotion: "no-preference",
  })
  await context.addInitScript((t) => {
    try {
      window.localStorage.setItem("theme", t)
    } catch {}
  }, theme)
  const page = await context.newPage()
  page.on("pageerror", (e) => console.log("  ! pageerror", e.message))
  return { context, page }
}

const shot = async (page, v, name, fullPage = false) => {
  if (fullPage) await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(300)
  await page.screenshot({ path: `${OUT}${v.locale}-${v.w}-${v.theme}-${name}.png`, fullPage })
  console.log("  ✓", name)
}

const confirmPrompt = async (page, v) => {
  const dialog = page.getByRole("dialog")
  await dialog.waitFor()
  await dialog.getByRole("button", { name: T[v.locale].confirm }).click()
  await dialog.waitFor({ state: "hidden" })
}

async function connect(page, v, capture) {
  await page.goto(`${BASE}/${v.locale}/app`, { waitUntil: "networkidle" })
  const btn = page.getByRole("main").getByRole("button", { name: T[v.locale].connect })
  await btn.waitFor()
  if (capture) await shot(page, v, "app-01-gate", true)
  await btn.click()
  await page.getByRole("dialog").waitFor()
  if (capture) await shot(page, v, "flow1-connect-prompt")
  await confirmPrompt(page, v)
  await page.getByRole("heading", { level: 1, name: T[v.locale].overview, exact: true }).waitFor({ timeout: 10000 })
}

async function setFailNext(page) {
  await page.getByRole("button", { name: "Demo controls" }).click()
  await page.getByLabel("Fail the next transaction").click()
  await page.keyboard.press("Escape")
}

async function marketing(page, v) {
  for (const [name, path] of [
    ["home", ""],
    ["how-it-works", "/how-it-works"],
    ["credits", "/credits"],
    ["pricing", "/pricing"],
    ["404", "/this-page-does-not-exist"],
  ]) {
    await page.goto(`${BASE}/${v.locale}${path}`, { waitUntil: "networkidle" })
    await page.waitForTimeout(name === "home" ? 5200 : 400)
    await shot(page, v, `page-${name}`, true)
  }
  if (v.w < 768) {
    await page.goto(`${BASE}/${v.locale}`, { waitUntil: "networkidle" })
    await page.getByRole("button", { name: "Open menu" }).click()
    await page.getByRole("dialog").waitFor()
    await shot(page, v, "page-mobile-menu")
  }
}

async function appFlows(page, v) {
  await connect(page, v, true)
  await shot(page, v, "app-02-overview-visitor", true)

  // Flow 1: join (failed once, then pending, committee signatures, welcome)
  await page.goto(`${BASE}/en/app/members`, { waitUntil: "networkidle" })
  const join = page.locator("#join")
  await join.waitFor()
  await join.scrollIntoViewIfNeeded()
  await shot(page, v, "flow1-join-form")
  await setFailNext(page)
  await join.getByRole("button", { name: "Pay share and apply" }).click()
  await page.getByRole("dialog").waitFor()
  await shot(page, v, "flow1-join-prompt")
  await confirmPrompt(page, v)
  await page.getByText("The transaction failed on the network").waitFor({ timeout: 10000 })
  await join.scrollIntoViewIfNeeded()
  await shot(page, v, "flow1-join-failed")
  await join.getByRole("button", { name: "Try again" }).click()
  await confirmPrompt(page, v)
  await page.getByText("Waiting for the network…").first().waitFor()
  await shot(page, v, "flow1-join-pending")
  await page.getByRole("heading", { name: "Your application is with the committee" }).waitFor({ timeout: 10000 })
  await join.getByText("1 of 2 signatures").first().waitFor({ timeout: 8000 })
  await join.scrollIntoViewIfNeeded()
  await shot(page, v, "flow1-committee-signing")
  await page.getByRole("heading", { name: /Welcome, you're member/ }).waitFor({ timeout: 10000 })
  await page.waitForTimeout(400)
  await join.scrollIntoViewIfNeeded()
  await shot(page, v, "flow1-welcome")
  await page.evaluate(() => window.scrollTo(0, 0))
  await shot(page, v, "app-03-members", true)

  // Flow 2: vote on the fridge, then fast-forward to the result
  await page.goto(`${BASE}/en/app/proposals/p-18`, { waitUntil: "networkidle" })
  await page.getByRole("heading", { level: 1 }).waitFor()
  await shot(page, v, "flow2-proposal-open", true)
  await page.getByRole("radio", { name: "For", exact: true }).check({ force: true })
  await page.getByRole("button", { name: "Cast your vote" }).click()
  await confirmPrompt(page, v)
  await page.getByText("Vote recorded").first().waitFor({ timeout: 10000 })
  await shot(page, v, "flow2-voted", true)
  await page.getByRole("button", { name: "Fast-forward to the end of the vote" }).click()
  await page.waitForTimeout(1200)
  await page.getByRole("heading", { name: "One member, one vote" }).scrollIntoViewIfNeeded()
  await shot(page, v, "flow2-votes-arriving")
  await page.getByText(/^Passed: \d+ for/).waitFor({ timeout: 15000 })
  await page.waitForTimeout(600)
  await shot(page, v, "flow2-passed", true)

  // Flow 2 (failure state): quorum not reached on soup Fridays
  await page.goto(`${BASE}/en/app/proposals/p-19`, { waitUntil: "networkidle" })
  await page.getByRole("button", { name: "Fast-forward to the end of the vote" }).click()
  await page.getByText(/^Quorum not reached:/).waitFor({ timeout: 15000 })
  await page.getByRole("heading", { name: "One member, one vote" }).scrollIntoViewIfNeeded()
  await shot(page, v, "flow2-no-quorum")

  // Flow 3: propose a spend (validation, live route, committee signatures)
  await page.goto(`${BASE}/en/app/proposals/new`, { waitUntil: "networkidle" })
  await page.getByRole("heading", { level: 1 }).waitFor()
  await page.getByRole("button", { name: "Submit proposal" }).click()
  await page.waitForTimeout(200)
  await shot(page, v, "flow3-composer-errors", true)
  await page.getByRole("button", { name: "Community oven (vote)" }).click()
  await shot(page, v, "flow3-route-vote", true)
  await page.getByRole("button", { name: "Shelving (committee)" }).click()
  await shot(page, v, "flow3-route-committee", true)
  await page.getByRole("button", { name: "Submit proposal" }).click()
  await page.getByRole("dialog").waitFor()
  await shot(page, v, "flow3-prompt")
  await confirmPrompt(page, v)
  await page.waitForURL(/\/app\/proposals\/p-20/, { timeout: 15000 })
  await page.getByRole("heading", { name: "Committee signatures" }).waitFor()
  await shot(page, v, "flow3-committee-waiting", true)
  await page.getByText("Approved by the committee").first().waitFor({ timeout: 10000 })
  await page.waitForTimeout(400)
  await shot(page, v, "flow3-committee-approved", true)

  // Flow 4: execute a passed proposal (jar deposit scheme)
  await page.goto(`${BASE}/en/app/proposals/p-17`, { waitUntil: "networkidle" })
  await page.getByRole("button", { name: "Execute payment" }).click()
  await page.getByRole("dialog").waitFor()
  await shot(page, v, "flow4-execute-prompt")
  await confirmPrompt(page, v)
  await page.getByText("Paying from the treasury…").first().waitFor()
  await shot(page, v, "flow4-executing", true)
  await page.getByText(/^Paid on /).waitFor({ timeout: 10000 })
  await shot(page, v, "flow4-paid", true)
  await page.goto(`${BASE}/en/app/treasury`, { waitUntil: "networkidle" })
  await page.getByRole("heading", { level: 1 }).waitFor()
  await shot(page, v, "flow4-treasury", true)

  // Flow 5: change the charter (committee limit 500 → 750), vote, enact
  await page.goto(`${BASE}/en/app/charter`, { waitUntil: "networkidle" })
  await page.getByRole("heading", { level: 1 }).waitFor()
  await shot(page, v, "flow5-charter", true)
  await page.goto(`${BASE}/en/app/proposals/new?kind=charter&rule=committeeLimit`, { waitUntil: "networkidle" })
  await page.getByLabel("New value").fill("750")
  await page.getByLabel("Why?").fill("Weekly orders now run 450–600 tUSDC; one committee sign-off keeps the produce fresh.")
  await shot(page, v, "flow5-composer", true)
  await page.getByRole("button", { name: "Submit proposal" }).click()
  await confirmPrompt(page, v)
  await page.waitForURL(/\/app\/proposals\/p-21/, { timeout: 15000 })
  await page.getByRole("radio", { name: "For", exact: true }).check({ force: true })
  await page.getByRole("button", { name: "Cast your vote" }).click()
  await confirmPrompt(page, v)
  await page.getByText("Vote recorded").first().waitFor({ timeout: 10000 })
  await page.getByRole("button", { name: "Fast-forward to the end of the vote" }).click()
  await page.getByText(/^(Passed: the charter now says|Rejected)/).waitFor({ timeout: 20000 })
  await page.waitForTimeout(600)
  await shot(page, v, "flow5-enacted", true)
  await page.goto(`${BASE}/en/app/charter`, { waitUntil: "networkidle" })
  await page.getByRole("heading", { level: 1 }).waitFor()
  await shot(page, v, "flow5-charter-after", true)

  // Member overview, proposal list and demo controls
  await page.goto(`${BASE}/en/app`, { waitUntil: "networkidle" })
  await page.getByRole("heading", { level: 1 }).waitFor()
  await shot(page, v, "app-04-overview-member", true)
  await page.goto(`${BASE}/en/app/proposals`, { waitUntil: "networkidle" })
  await page.getByRole("heading", { level: 1 }).waitFor()
  await shot(page, v, "app-05-proposals", true)
  await page.getByRole("button", { name: "Demo controls" }).click()
  await page.getByRole("dialog").waitFor()
  await shot(page, v, "app-06-demo-controls")
  await page.keyboard.press("Escape")
}

async function frenchFlow(page, v) {
  await page.goto(`${BASE}/fr`, { waitUntil: "networkidle" })
  await page.waitForTimeout(5200)
  await shot(page, v, "page-home", true)
  await connect(page, v, true)
  await shot(page, v, "app-02-overview-visitor", true)
  await page.goto(`${BASE}/fr/app/members`, { waitUntil: "networkidle" })
  await page.locator("#join").getByRole("button", { name: "Payer la part et adhérer" }).click()
  await confirmPrompt(page, v)
  await page.getByRole("heading", { name: /Bienvenue, vous êtes le membre/ }).waitFor({ timeout: 15000 })
  await page.goto(`${BASE}/fr/app/proposals/p-18`, { waitUntil: "networkidle" })
  await page.getByRole("radio", { name: "Pour", exact: true }).check({ force: true })
  await page.getByRole("button", { name: "Voter", exact: true }).click()
  await confirmPrompt(page, v)
  await page.getByText("Vote enregistré").first().waitFor({ timeout: 10000 })
  await page.getByRole("button", { name: "Avancer jusqu'à la fin du vote" }).click()
  await page.getByText(/^Adoptée : \d+ pour/).waitFor({ timeout: 15000 })
  await page.waitForTimeout(600)
  await shot(page, v, "flow2-passed", true)
  await page.goto(`${BASE}/fr/app/proposals/new`, { waitUntil: "networkidle" })
  await page.getByRole("button", { name: "Four communautaire (vote)" }).click()
  await shot(page, v, "flow3-route-vote", true)
}

const browser = await chromium.launch()
await mkdir(OUT, { recursive: true })
for (const v of variants) {
  const tag = `${v.locale}-${v.w}-${v.theme}`
  if (ONLY && !tag.includes(ONLY)) continue
  console.log(tag)
  const { context, page } = await newPage(browser, v)
  try {
    if (v.locale === "fr") await frenchFlow(page, v)
    else {
      await marketing(page, v)
      await appFlows(page, v)
    }
  } catch (e) {
    console.error("  ✗", tag, e.message)
    await page.screenshot({ path: `${OUT}_error-${tag}.png` }).catch(() => {})
    process.exitCode = 1
  }
  await context.close()
}
await browser.close()
