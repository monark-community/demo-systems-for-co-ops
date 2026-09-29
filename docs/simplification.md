# Simplification pass

Owner feedback: *"Simplify, reduce text quantity, revise flows so that context is only given when necessary. Two top bars on homepage is too busy; demo banners only on demo/app pages."* Method: the TrustRate pilot (`sites/address-review-system/docs/simplification.md`, §4 checklist). Binding rules: `monark-brand-guidelines.md` §8 "Restraint", §10 and §11.

How the numbers are measured (scripts in `scripts/`, run against `pnpm start`, port 3141):

- `node scripts/wordcount.mjs`: words per page, English, 1440px. *Visible* is the `innerText` of `<main>`; *total* also counts closed disclosures and FAQ answers; *chrome* is everything outside `<main>` (header, app bar, footer). The script connects the demo wallet and joins the co-op (flow 1) so the member-only views render in full. App pages include seeded data (member names, proposal summaries, activity).
- `node scripts/dictcount.mjs`: words of UI copy in `src/i18n/dictionaries/{en,fr}.ts`, per section.

## 1. Before

| Page | Visible in main | Total in main | Chrome |
|-|-:|-:|-:|
| Home | 414 | 569 | 82 |
| How it works | 601 | 606 | 82 |
| Credits | 113 | 113 | 82 |
| 404 | 33 | 33 | 82 |
| App: connect gate | 58 | 58 | 80 |
| App: overview (visitor) | 290 | 290 | 82 |
| App: overview (member) | 268 | 268 | 82 |
| App: proposals | 259 | 259 | 82 |
| App: proposal #18 (vote) | 166 | 166 | 82 |
| App: proposal #16 (committee) | 145 | 145 | 82 |
| App: new proposal | 120 | 120 | 82 |
| App: treasury | 267 | 267 | 82 |
| App: members | 695 | 695 | 82 |
| App: charter | 154 | 154 | 82 |
| **Total** | **3,583** | **3,743** | **1,146** |

Dictionary copy: **EN 3,452 words** (meta 189 · common 147 · home 631 · how 593 · credits 87 · pricing 192 · app 1,374 · seed 238); **FR 3,816**.

### Inventory

- **Shell.** One header on marketing pages (already). Demo chip tinted `primary/12` in both themes (reference: 8% light, 15% dark). Footer legal band carried "Demo · simulated data" **and** the testnet line; product line 16 words. Brand, nav, mobile menu and theme toggle had drifted slightly from Splitflow (link padding, chip position in the sheet, 44px theme button on mobile).
- **Home** (hero + 5 sections, 2 dividers). Hero: eyebrow, 26-word subline, a "Demo · simulated data" line under the buttons (third copy of the notice). "A co-op already has rules" (paragraph + 3 benefits) and "Three routes, one charter" (eyebrow, heading, intro line, diagram, link) said the same thing twice: benefit 1 and 3 are the routes. "Who" with eyebrow and 15-word card lines. FAQ with 6 questions, two of them mechanics (multi-signature, quorum). Closing with a body line.
- **How it works.** Eyebrow, 40-word intro, 10–15-word diagram steps, 2–3 paragraphs per section (≈ 90 words each), the developer modules and code note always open, CTA with a body line.
- **App.** Two bars under the header: a strip (network badge, membership chip, the testnet notice, Demo controls) and the section tabs. Testnet notice also under "Pay share and apply" and "Execute payment" (and again in the wallet prompt). Gate: eyebrow, paragraph, 3 bullets. Overview: eyebrow, 20-word intro, a dashed "You're visiting…" box repeating the "Join the co-op" button, "Available" hint line, 7 activity rows each with a hash. Page intros on proposals, composer, treasury, members, charter. Proposal page: a "why this route" line, a fast-forward hint, a "who can pay" paragraph. Members: intro, a join paragraph, a "waiting" paragraph, a welcome paragraph, all 35 members listed. Treasury: intro + ledger note, hash on its own line per row on phones. Charter: intro, 4 "Propose a change" buttons plus the header one, 3 "Fixed by design" labels, hashes in the history. Demo controls hints of 10–16 words.
- **Repeated messages.** Vote: toast + "Vote recorded" + "You voted for". Fast-forward: toast + outcome line. Execute: toast + "Paid on …". Join: toast + "Your application is with the committee"; welcome toast + welcome panel. Submit proposal: toast + the proposal page. Pending transactions showed the step label and "Waiting for the network…" on two lines.

## 2. What changed

No feature or flow was removed.

### Shell (brought to the Splitflow reference)
- `brand.tsx`, `demo-chip.tsx`, `header.tsx`, `nav-links.tsx`, `mobile-menu.tsx`, `theme.tsx` copied from Splitflow. Demo chip: `bg-primary/8 dark:bg-primary/15`, `text-primary-ink`. Header primary action inside the app: "Connect demo wallet" (reference label; the "Connect wallet" short label was removed).
- Footer legal band: "© Monark · Open source · Demo · simulated data · photo credits"; the testnet line is gone. Product line 16 → 11 words.

### Home (hero + 5 sections → hero + 4)
- Hero: no eyebrow; subline 26 → 13 words; the demo line under the buttons removed (the header chip and the footer say it).
- **Merged** "A co-op already has rules" and "Three routes": one section with the problem heading and the route diagram; route lines cut to 6–9 words; the intro paragraph, 3 benefits, eyebrow, intro line and "Read how the charter works" link are gone (the hero's secondary button and the nav go there).
- "Who": no eyebrow; heading 8 → 6 words; card lines 9–10 words.
- FAQ: 6 → 4 questions, answers 13–16 words. Multi-signature and quorum moved to `/how-it-works` (committee section; "Without quorum, a proposal fails" in the charter section).
- Closing: heading + button. One divider (after the hero) instead of two.

### How it works
- No eyebrow; intro 40 → 7 words. Diagram steps 3–6 words.
- Sections: one or two short lines each (≈ 90 → 20–35 words).
- For developers: 30 → 15-word line; the four contract modules and the code note sit behind "Show the contract modules".
- CTA: heading + button.

### App (`/app/...`)
- **One bar instead of two.** Section nav on the left, one pill on the right showing the network ("● Sepolia testnet") that opens Demo controls. On phones the pill is icon-only and Overview is a house icon, so the five sections fit without scrolling in EN and FR. The membership chip moved to the overview title.
- **Testnet line once per transaction:** only in the wallet prompt (value-moving prompts). Removed from the app strip, the join form and the payment panel.
- Gate: no eyebrow, no bullets; line 18 → 8 words.
- Overview: no eyebrow; intro 20 → 6 words; the "You're visiting" box removed (the header button is the action); "Available" explained in an info popover; 5 activity rows instead of 7.
- Page intros removed on proposals, new proposal, members and charter; the treasury's is in an info popover next to the title.
- Proposal: "why this route" in an info popover next to the route; fast-forward hint removed; "any member can pay" in an info popover next to "Payment"; join-to-vote line 16 → 7 words.
- Proposals list paged by 6 ("Show more proposals"), members by 9 ("Show all 35 members"; a search shows every match), ledger by 8 ("Show more"; the CSV has everything).
- Secondary metadata in tooltips: activity and charter-history hashes (on the time / item), past roles on member rows, the ledger hash on phones (still a column on desktop). Charter: per-rule "Propose a change" buttons became pencil icons, "Fixed by design" a lock icon (labels in `aria-label` / tooltip); the header keeps the one labelled action.
- Members: join, waiting and welcome paragraphs removed (the share row, the seals and the button carry them); committee line 17 → 9 words.
- Demo controls: hints 3–7 words; reset confirmation 12 → 7 words.
- **One message, once:** no toast for vote, fast-forward, execute, application or new proposal (each screen already shows the result); the welcome toast only fires when you're not on the members page. A pending transaction shows one chip (the step's label + hash) instead of two lines.
- Empty and error states one line: invalid address "Not a wallet address (0x + 40 characters).", proposal not found "It may have been cleared by "Reset demo"." + back button, 404 body 17 → 7 words.
- New shared component: `src/components/ui/info-tip.tsx` (from the pilot; Radix Popover behind an info icon, works on touch).

French was rewritten to the same brevity in `src/i18n/dictionaries/fr.ts`; unused keys were removed from both languages.

## 3. After

| Page | Visible before | Visible after | Change | Total after | Chrome before | Chrome after |
|-|-:|-:|-:|-:|-:|-:|
| Home | 414 | 199 | −52% | 254 | 82 | 67 |
| How it works | 601 | 243 | −60% | 286 | 82 | 67 |
| Credits | 113 | 92 | −19% | 92 | 82 | 67 |
| 404 | 33 | 22 | −33% | 22 | 82 | 67 |
| App: connect gate | 58 | 23 | −60% | 23 | 80 | 66 |
| App: overview (visitor) | 290 | 225 | −22% | 225 | 82 | 67 |
| App: overview (member) | 268 | 208 | −22% | 208 | 82 | 67 |
| App: proposals | 259 | 168 | −35% | 168 | 82 | 67 |
| App: proposal #18 (vote) | 166 | 132 | −20% | 132 | 82 | 67 |
| App: proposal #16 (committee) | 145 | 118 | −19% | 118 | 82 | 67 |
| App: new proposal | 120 | 93 | −23% | 93 | 82 | 67 |
| App: treasury | 267 | 161 | −40% | 161 | 82 | 67 |
| App: members | 695 | 229 | −67% | 229 | 82 | 67 |
| App: charter | 154 | 115 | −25% | 115 | 82 | 67 |
| **Total** | **3,583** | **2,028** | **−43%** | **2,126** | **1,146** | **937** |

Marketing pages (home, how it works, credits, 404): 1,161 → 556 visible words (−52%). What remains in the app is mostly seeded data (proposal titles and summaries, member names, activity lines).

Dictionary copy: **EN 3,452 → 2,523 (−27%)**, **FR 3,816 → 2,824 (−26%)**. Per section (EN): meta 189 → 180 · common 147 → 130 · home 631 → 325 · how 593 → 273 · credits 87 → 66 · app 1,374 → 1,118 · pricing 192 (internal, unlinked, unchanged) · seed 238 (data, unchanged).

### Screenshots

- Before: `docs/screenshots/before/en-1440-light-page-home.png`, `docs/screenshots/before/en-1440-light-flow2-proposal-open.png`.
- After: `docs/screenshots/en-1440-light-page-home.png`, `docs/screenshots/en-1440-light-flow2-proposal-open.png`, and every page and flow step in `docs/screenshots/` (EN 390/1440 light/dark, FR 390/1440 light). No screenshot was renamed or removed, so the project image was not re-rendered.
