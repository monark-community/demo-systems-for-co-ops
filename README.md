# CoopDAO by Monark

**Run your co-op in the open.** CoopDAO keeps a co-op's members, shared money and decisions on one public record, and follows the charter its members wrote: one member, one vote. Small expenses go to the elected committee (two of three signatures), larger ones to a member vote with a quorum, and charter changes need a two-thirds majority. Money only leaves the treasury by executing an approved proposal, and every payment links back to it.

This repository is the demo site: a bilingual (English / French) Next.js app with an interactive demo co-op, **Le Grenier**, a student food co-op with 34 members and a year of history. Everything is simulated in the browser; there is no real chain, wallet or backend.

- Project page: https://www.monark.io/en/project/systems-for-co-ops
- Live demo: https://coopdao.monark.io

## Run it locally

Requires Node 22 and pnpm 10.

```bash
pnpm install
pnpm dev          # http://localhost:3141
```

Other scripts:

```bash
pnpm lint
pnpm typecheck
pnpm build && pnpm start      # production build on port 3141
pnpm screenshots              # Playwright screenshots of every page and flow (needs pnpm start running)
```

No environment variables are needed. `NEXT_PUBLIC_SITE_URL` optionally overrides the canonical URL (default `https://coopdao.monark.io`).

## What you can do in the demo

1. **Join the co-op:** connect a demo wallet, pay the 20 tUSDC member share, and watch two stewards sign your admission.
2. **Vote:** cast a vote on the walk-in fridge (one dot per member, quorum marker), then fast-forward to the end of the vote.
3. **Propose a spend:** the route preview switches between committee approval and a member vote as you type the amount.
4. **Execute a payment:** pay a passed proposal from the treasury and find it in the ledger (CSV export).
5. **Change the charter:** propose a new committee limit, vote, and see the charter and its history update.

"Demo controls" lets you slow the network, force the next transaction to fail, and reset the demo.

## How the simulation works

All demo state lives in `src/lib/demo/` behind a small typed layer, so it could be swapped for wagmi/viem without touching the UI:

| File | Role |
|-|-|
| `types.ts` | Domain types: members, charter, proposals, ledger, applications, activity. Amounts are integer cents of tUSDC. |
| `rules.ts` | The charter as pure functions: `routeFor`, `tally`, `outcome`, `treasuryBalance`, `available`. |
| `seed.ts` | Le Grenier, seeded in the visitor's language with dates relative to now. |
| `store.ts` | External store persisted to `localStorage` (every access in try/catch) and the wallet-prompt channel. |
| `chain.ts` | Transaction lifecycle: wallet prompt (sign or reject) → pending with a hash (1.2–2.4 s, or 3–6 s on "slow network") → confirmed or reverted. |
| `wallet.ts` | Simulated connect/disconnect. |
| `ops.ts` | What each confirmed transaction does (join, propose, vote, execute), plus the simulated co-signers and the fast-forwarded votes of other members. |

## Project structure

```
src/
  app/[locale]/          Pages: home, how-it-works, app/*, credits, pricing (unlinked), 404, OG image
  components/demo/       The interactive app (overview, proposals, composer, treasury, members, charter)
  components/diagrams/   Route and lifecycle diagrams (line art in code)
  components/home/       Hero vote card
  components/site/       Standard Monark header, footer, locale and theme switches
  components/ui/         shadcn/ui + @monark/ui registry components (wallet, connect-wallet, token-amount, tx-status, network-badge)
  i18n/                  Locale config and typed EN/FR dictionaries
  lib/demo/              Simulated chain, wallet and data layer
docs/
  site-plan.md           Product brief, flows, copy, aesthetics, pricing: what shipped
  assets.md              Every image with its license and credit
  screenshots/           Playwright screenshots (390 px and 1440 px, light and dark, EN + FR)
```

## Deploy to Vercel

Import the repository in Vercel and deploy with the framework defaults (Next.js, pnpm detected from `pnpm-lock.yaml`, Node 22 from `engines`). No `vercel.json`, no environment variables. Every page prerenders; proposals created in the browser render on demand.

## License and credits

Open source by the Monark community. Photos from Unsplash (see `/credits` and `docs/assets.md`).
