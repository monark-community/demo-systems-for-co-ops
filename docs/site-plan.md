# CoopDAO by Monark: site plan

Status: shipped on `develop`, then simplified (see `docs/simplification.md`: −43% visible words, one app bar, context on demand). This plan describes what the site does; it is kept in sync with the code (see §12 for decisions taken while building).

- Product: **CoopDAO**, Monark's co-op operating system: wallet-based membership, proposals and votes, and a shared treasury run by the rules the members wrote.
- Authoritative description: https://www.monark.io/en/project/systems-for-co-ops
- Branding: **Monark-branded** (`true`). `lovable-migration/monark-brand-guidelines.md` is binding.
- Stack: Next.js 16 (App Router, `src/`, TypeScript strict), pnpm, Tailwind CSS v4, shadcn/ui on the Monark UI registry, `lucide-react`.

Decisions taken unattended are marked **Decision**.

---

## 1. Product brief

**Target user.** A small group that owns something together and wants to run it fairly without a back-office:

- the stewards of a **student food co-op** or campus bike co-op (members, a counter, a supplier every week);
- a **local collective or mutual-aid network** that pools money for its neighbourhood;
- a **farmers' co-op or housing co-op** board that is tired of one treasurer holding the bank card and the spreadsheet;
- **students and developers** in the Monark community learning how DAO tooling works on a real-world case (Monark's education mission; the documentation frames it as a student project).

**Core job to be done.** *"Let our members decide together how we spend our shared money, and make sure the money only moves the way we decided, with a record anyone in the co-op can check."*

**Point of view.** A co-op already has what most DAOs lack: a **charter** (bylaws) its members agreed on. CoopDAO makes that charter the engine. Every rule is visible in plain words, and the app routes each decision through it: small expenses go to the elected committee (a 2-of-3 multi-signature), larger ones go to a member vote, and changing the charter itself needs a two-thirds majority. And unlike token DAOs, it keeps the co-op principle: **one member, one vote**, whatever they paid in.

**Positioning in the Monark family.** GovChain (dao-voting-platform) is the general voting module; Splitflow shares incoming money. CoopDAO is the whole organisation around them: who is a member, who sits on the committee, what the charter says, and the treasury that obeys it.

**Domain concepts** (each explained in plain words the first time the site uses it):

| Concept | Meaning in CoopDAO |
|-|-|
| Co-op | The organisation. Its treasury and rules live in a set of small smart contracts. |
| Member | A person whose wallet holds one membership, bought with one **member share** (20 tUSDC, refundable when they leave). |
| Charter | The co-op's rules, stored as parameters: member share, quorum, majority, voting period, committee spending limit, supermajority for charter changes. |
| Committee | Three stewards elected for a term. They admit members and approve small expenses together: **2 of 3 signatures** (a multi-signature wallet). |
| Proposal | A request put to the co-op: a spend (amount, recipient, reason), or a charter change. |
| Route | Which path a proposal takes, decided by the charter: committee approval, member vote, or supermajority vote. |
| Quorum | The share of members who must take part for a vote to count (40%). |
| Treasury | The co-op's shared wallet. Money only leaves it by executing an approved proposal. |
| Ledger | Every inflow and outflow, linked to the proposal that allowed it, with its transaction hash. |
| Participation | A member's record: votes taken part in, proposals made, roles held. It builds trust; it never adds voting weight. |

**What the Lovable version got wrong or left out.**

- Blue-to-green gradient landing page with frosted cards and generic copy ("Everything your cooperative needs"). Nothing Monark, nothing specific to how a co-op actually works.
- All numbers were hard-coded ("$45,230", "24 / 45 members"). Voting only toggled a local highlight; nothing was ever signed, pending, confirmed or failed.
- No charter: no quorum, no thresholds, no reason why one proposal needs a vote and another doesn't. The documented multi-signature committee approval was only a bullet point.
- The treasury never moved. Passed proposals were never executed, and there was no ledger linking money to decisions.
- Joining the co-op ("members join via wallet") was not a flow. Roles and participation were decorative badges.
- Dollar amounts implied real money, no disclaimers, English only, a banner stuck over the content.

## 2. Value proposition

**CoopDAO gives co-ops and community groups one shared treasury that only moves the way their members decided, one member one vote, with every rule and every payment on a public record, so no single treasurer, spreadsheet or bank card holds the group's trust.**

Supporting benefits (outcomes):

1. **Everyone knows how a decision gets made.** The charter is in plain words and each proposal shows its route before anyone votes.
2. **The money follows the vote, and only the vote.** A payment leaves the treasury only after its approval, and anyone can trace it back.
3. **Small things stay quick.** Everyday expenses need two stewards' signatures, not a general assembly.

## 3. Hero

- **Headline (EN):** "Run your co-op in the open." (6 words) · **FR:** « Votre coop, gérée au grand jour. »
- **Subheadline (EN):** "Members, shared money and decisions on one public record. One member, one vote."
- **FR:** « Membres, caisse commune et décisions dans un seul registre public. Un membre, une voix. »
- No eyebrow, no demo line under the buttons (the header's Demo chip and the footer carry it).
- **Primary CTA:** "Open the demo co-op" → `/{locale}/app` · FR « Ouvrir la coop de démo »
- **Secondary CTA:** "How the charter works" → `/{locale}/how-it-works` · FR « Comment fonctionne la charte »
- **Hero visual: product UI, animated once.** A live proposal card from the demo co-op ("Second-hand walk-in fridge · 1,480 tUSDC"): its route line lights up "Above 500 tUSDC → member vote", then a grid of 34 member dots fills as votes arrive, the tally crosses the quorum marker, and the card settles on "Passed · executed". It shows the product's idea (rules route the decision, one dot per member, money moves after) in five seconds, which no photo can. The mesh butterfly sits large and cropped behind it.

## 4. Page map

All routes live under `/{locale}` (`en`, `fr`); `/` redirects to the preferred language.

| Route | Purpose | Sections in order |
|-|-|-|
| `/{locale}` | Home: understand the product and enter the demo. | Hero (vote card) · Section divider · "A co-op already has rules. Now they run themselves." (the line-art router: committee / member vote / charter change) · "For groups that own something together" (3 photo cards) · FAQ (4) · Closing call to action (heading + button) |
| `/{locale}/how-it-works` | For students, developers and careful stewards: the mechanics. **Justified**: the documentation positions CoopDAO as a learning project in DAO tooling; the audience needs the contract model spelled out. | One-line intro · The life of a proposal (diagram) · One member, one vote · The committee's 2-of-3 signatures · Joining and leaving · Changing the charter (incl. what happens without quorum) · For developers (one line; contract modules behind "Show the contract modules") · Call to action (heading + button). One or two short lines per section. |
| `/{locale}/app` | Demo: co-op overview. Wallet gate, your membership status, treasury balance, open proposals, charter summary, recent activity. | |
| `/{locale}/app/proposals` | All proposals with status filters (open, awaiting committee, passed, executed, rejected). | |
| `/{locale}/app/proposals/new` | Proposal composer with the live route preview. | |
| `/{locale}/app/proposals/[id]` | One proposal: route, tally grid, votes, committee signatures, execution, history. | |
| `/{locale}/app/treasury` | Balance, inflow/outflow ledger linked to proposals, CSV export. | |
| `/{locale}/app/members` | Directory with roles and participation, the committee and its term, pending applications, join. | |
| `/{locale}/app/charter` | The charter in plain words, its history, and "Propose a change". | |
| `/{locale}/credits` | Photo credits. **Justified** by the asset rules (footer link). | |
| `/{locale}/pricing` | Internal strategy review only. Never linked, not in the sitemap, `noindex, nofollow`. | |
| 404 | Localized not-found with the vertical Monark logo. | |

**Header** (standard Monark navbar, guidelines §2 and §10): butterfly mark + "CoopDAO" on one line (no "by Monark"), then left-aligned links Overview, How it works, Demo co-op · right: Demo chip (primary 8% light / 15% dark), EN/FR switch, theme toggle, "Open the demo co-op" (inside the app: the `connect-wallet` control, labelled "Connect demo wallet"). Shell components mirror Splitflow's `src/components/site/`. Below `lg`: brand + menu button; the sheet holds the links, Demo chip, EN/FR, theme and the action.

**App bar** (one compact bar under the header, `/app` only): pill nav Overview · Proposals · Treasury · Members · Charter on the left; on the right one pill "● Sepolia testnet | Demo controls" that opens the controls (network speed, fail next transaction, Reset demo). On phones the pill is icon-only and Overview is a house icon, so all five sections fit in EN and FR. No testnet strip; the membership chip sits under the overview title.

**Footer:** standard three bands: product line ("One member, one vote, and a treasury that follows your charter.") + links (Overview, How it works, Demo co-op, Credits) · "CoopDAO is built by Monark", Monark logo + tagline, project page on monark.io, GitHub repo, socials · "© {year} Monark · Open source", "Demo · simulated data", photo credits link (no testnet line).

## 5. Feature highlights

| Feature | User benefit | Where | Proven by flow |
|-|-|-|-|
| The charter as the engine | Everyone knows in advance how a decision will be made | Home "Three routes", `/app/charter`, route preview in the composer and on every proposal | 3, 5 |
| One member, one vote, drawn literally | Fairness you can see: one dot per member, the quorum line on the grid | Home hero, proposal page | 2 |
| Committee multi-signature | Everyday expenses and admissions stay quick but never depend on one person | Proposal page (signature seals), members page (admissions) | 1, 3 |
| Treasury that obeys the vote | Money leaves only through an approved proposal, traced in the ledger | Proposal page "Execute", `/app/treasury` | 4 |
| Wallet-based membership | Join with a wallet and a refundable member share; roles and participation are public | `/app/members`, overview | 1 |
| Participation record | Trust grows from showing up, without buying more votes | Members directory, member rows | 1, 2 |

## 6. Key flows

The demo simulates a wallet (Camille Roy, 250 tUSDC), a testnet (Sepolia) and a block time of 1.2–2.4 s (3–6 s with "Slow network"). "Fail the next transaction" in Demo controls forces a revert. Closing the wallet prompt counts as a rejection.

1. **Join the co-op.** Open the demo → "Connect demo wallet" → wallet prompt (sign-in message, no fee) → connected as a visitor → Members → "Apply to join" → name, a line about why, member share 20 tUSDC shown → "Pay share and apply" → wallet prompt (moves 20 tUSDC) → *pending* (hash) → *confirmed*: application listed "Waiting for the committee · 0 of 2 signatures" → signatures from two stewards arrive a couple of seconds apart (seals stamp in) → "Welcome, you're member #35". *Failed:* wallet rejected ("You declined the request. Nothing was sent.") or reverted ("The transaction failed on the network. Your 20 tUSDC were not taken.") with Try again.
2. **Vote on a proposal.** Proposals → "Second-hand walk-in fridge" (member vote, open, quorum not yet reached) → choose For / Against / Abstain → "Cast your vote" → prompt → *pending* → *confirmed*: your dot lights up in the grid, tally updates. Then "Fast-forward to the end of the vote" (demo) → remaining votes arrive one by one, tally settles, quorum marker is crossed → outcome *Passed* (or *Rejected*, or *Quorum not reached* for a different proposal). Non-members see "Join the co-op to vote". *Failed:* rejected or reverted, the vote isn't counted.
3. **Propose a spend.** "New proposal" → title, amount (tUSDC), recipient (name + address), category, reason → the route preview switches live: ≤ 500 tUSDC "Committee approval · 2 of 3 signatures", above "Member vote · 5 days · quorum 40%". Validation: missing fields, invalid address, amount above the available treasury. "Submit proposal" → prompt → *pending* → *confirmed* → redirect to the proposal. Committee route: signatures arrive and the proposal becomes *Approved*. *Failed:* rejected/reverted with retry.
4. **Execute a passed proposal.** A passed proposal ("Reusable jar deposit scheme", 820 tUSDC) → "Execute payment" (any member can trigger it; the rules already decided) → prompt (moves value, disclaimer) → *pending* → *confirmed*: the treasury balance counts down, a ledger row appears linked to the proposal, status *Executed*. *Failed:* reverted, the treasury is unchanged, Try again.
5. **Change the charter.** Charter → "Propose a change" → pick a rule (committee spending limit, quorum, voting period, member share) and a new value; the diff "500 → 750 tUSDC" and the route "Charter change · two-thirds majority · quorum 50%" are shown → submit (prompt, pending, confirmed) → proposal page → vote → fast-forward → *Passed*: the charter updates and its history shows the change, or *Rejected* when two-thirds isn't reached.

## 7. Content (EN / FR)

Tone: Monark voice. Open, practical, community-first, no hype. Web3 terms explained on first use. The full string set lives in `src/i18n/dictionaries/{en,fr}.ts`; the key copy is below.

### Home

| | EN | FR |
|-|-|-|
| H1 | Run your co-op in the open. | Votre coop, gérée au grand jour. |
| Sub | (see §3) | (see §3) |
| CTAs | Open the demo co-op · How the charter works | Ouvrir la coop de démo · Comment fonctionne la charte |
| Hero card states | Member vote · Quorum reached · Passed · Paid from the treasury | Vote des membres · Quorum atteint · Adoptée · Payée par la caisse |
| Routes H2 | A co-op already has rules. Now they run themselves. | Une coop a déjà ses règles. Maintenant, elles s'appliquent seules. |
| Route 1 | Committee approval · Up to 500 tUSDC · Two of three elected stewards sign. | Accord du comité · Jusqu'à 500 tUSDC · Deux des trois responsables élus signent. |
| Route 2 | Member vote · Above 500 tUSDC · Five days, 40% quorum, one member, one vote. | Vote des membres · Au-delà de 500 tUSDC · Cinq jours, quorum de 40 %, un membre, une voix. |
| Route 3 | Charter change · Any rule · Two-thirds of the votes, half the members taking part. | Modification de la charte · Toute règle · Deux tiers des voix, la moitié des membres votants. |
| Who H2 | For groups that own something together | Pour les groupes qui possèdent quelque chose ensemble |
| Card 1 | Student co-ops — A campus grocery, a bike workshop, a student café. | Coops étudiantes — Une épicerie de campus, un atelier vélo, un café étudiant. |
| Card 2 | Local collectives — Neighbours pooling money for a garden or mutual aid. | Collectifs de quartier — Des voisins qui cotisent pour un jardin ou l'entraide. |
| Card 3 | Farmers' and housing co-ops — Boards that want every member to see the money. | Coops agricoles et d'habitation — Des conseils qui veulent que chaque membre voie l'argent. |
| Closing | Spend a week in a real co-op. / Open the demo co-op | Vivez une semaine dans une vraie coop. / Ouvrir la coop de démo |

### FAQ

The only FAQ on the site (4 questions). Mechanics (multi-signature, quorum) live on `/how-it-works`.

1. **Is this real money? / Est-ce du vrai argent ?** No. The wallet, the test tokens (tUSDC) and every transaction are simulated in your browser. / Non. Le portefeuille, les jetons de test (tUSDC) et chaque transaction sont simulés dans votre navigateur.
2. **Why one member, one vote? / Pourquoi un membre, une voix ?** It's the co-op principle: your member share buys membership, never extra weight. / C'est le principe coopératif : votre part sociale achète l'adhésion, jamais plus de poids.
3. **Can we change the rules? / Peut-on changer les règles ?** Yes, by proposal: two-thirds of the votes, with half the members taking part. / Oui, par proposition : deux tiers des voix, avec la participation de la moitié des membres.
4. **Do I need to understand blockchains? / Faut-il comprendre les chaînes de blocs ?** No. You'll see members, proposals, votes and payments; the on-chain details stay one click away. / Non. Vous verrez des membres, des propositions, des votes et des paiements ; le détail on-chain reste à portée de clic.

### Empty, loading and error states

| State | EN | FR |
|-|-|-|
| Wallet gate | A simulated wallet opens it. No real funds. | Un portefeuille simulé l'ouvre. Aucun vrai fonds. |
| Connect rejected | You declined the sign-in request. Nothing was shared. | Vous avez refusé la demande de connexion. Rien n'a été partagé. |
| Not a member | "Visiting" chip under the overview title + "Join the co-op" button; on a vote: "Joining takes a 20 tUSDC member share." | Pastille « En visite » + bouton « Adhérer à la coop » ; sur un vote : « L'adhésion demande une part sociale de 20 tUSDC. » |
| No proposals in filter | No proposals here yet. | Aucune proposition ici pour l'instant. |
| Empty ledger filter | No payments match this filter. | Aucun mouvement ne correspond à ce filtre. |
| Proposal not found | Proposal not found / It may have been cleared by "Reset demo". + All proposals | Proposition introuvable / « Réinitialiser la démo » l'a peut-être effacée. + Toutes les propositions |
| Tx rejected | You declined the request. Nothing was sent. | Vous avez refusé la demande. Rien n'a été envoyé. |
| Tx reverted | The transaction failed on the network. Nothing changed. | La transaction a échoué sur le réseau. Rien n'a changé. |
| Over treasury | That's more than the treasury has available ({amount}). | C'est plus que ce que la caisse a de disponible ({amount}). |
| Storage off | Your browser blocks local storage, so the demo resets when you leave. | Votre navigateur bloque le stockage local : la démo repartira de zéro à votre départ. |
| Invalid address | Not a wallet address (0x + 40 characters). | Adresse de portefeuille invalide (0x + 40 caractères). |
| 404 | This page wandered off. / The link may be old or mistyped. / Back to the home page · Open the demo co-op | Cette page s'est égarée. / Le lien est peut-être ancien ou mal tapé. / Retour à l'accueil · Ouvrir la coop de démo |
| Error | Something went wrong on our side. / Try again | Un problème est survenu de notre côté. / Réessayer |

Disclaimers: "Demo · simulated data" / « Démo · données simulées » (footer + header Demo chip); "Testnet demo · not financial advice · no real funds" / « Démo sur réseau de test · pas un conseil financier · aucun vrai fonds » once per transaction, only in the wallet prompt of value-moving transactions (member share, execute payment). Non-value prompts say "Simulated wallet: nothing is signed with a real key."

**Context on demand (app).** No page intros. Info popovers (`src/components/ui/info-tip.tsx`) carry: why a proposal took its route, who can trigger a payment, what "Available" means, what the treasury is. Long lists are paged: proposals by 6, members by 9 (search shows all), ledger by 8 (CSV has all). Hashes sit in tooltips in the activity feed and charter history; the ledger keeps a hash column on desktop.

## 8. Aesthetics (Monark-branded)

Colour, type, logo, header and footer come from the guidelines (cream / espresso tokens from §3 pasted over the `@monark/ui` theme, Nunito Sans, flat orange, pills). What's left:

- **Rhythm.** Home: asymmetrical hero (copy left, live vote card right over the cropped mesh) → divider → a calm three-column benefit band → a tinted `secondary` band for "Three routes" with the line-art router → photo cards → FAQ in a narrow column → a bordered closing card. Two section dividers max. How it works: long-form, narrow text column (68ch) with full-width diagrams. App: dense but airy, 1.5rem gaps, cards with borders, one orange action per view.
- **Hero visual:** the product's own vote card (see §3), rendered in code.
- **Monark illustrations:** the mesh butterfly (home hero only). New line-art drawn in code with flat orange strokes: the **route diagram** (one proposal line forking into three routes: committee seals, member-vote grid, supermajority), the **proposal lifecycle** (draft → route → approval → execution → ledger), and the **signature seals** (three rings, two stamped).
- **Photography:** real people deciding and working together, warm light, unstaged: a general assembly in a circle on the grass, students around a table, a hand-to-hand market exchange. Used only in "Who runs on CoopDAO" and paired with copy.
- **Mesh butterfly:** yes, once, large and cropped at the top-right of the home hero, behind the vote card at low contrast. No gradients anywhere.
- **Signature moments:**
  1. **The member grid.** Every proposal shows one dot per member; votes fill dots in (orange for, dark for against, outlined for abstain) with a quorum marker. On "fast-forward", the remaining dots fill one by one and the tally settles; crossing quorum flips the label.
  2. **The live route.** In the composer the route diagram re-routes as you type the amount: at 501 tUSDC the line leaves the committee seals and runs to the member vote.
  3. **Seals stamping in.** Committee approvals appear as three rings; each signature stamps one (200 ms, no bounce), and at 2 of 3 the payment unlocks.

## 9. Assets

| File | Purpose / placement | Source |
|-|-|-|
| `public/images/assembly.jpg` | General assembly in a circle outdoors: "Local collectives" card; `/credits` | Unsplash `1tAtO-9HYNM`, Dorota Trzaska |
| `public/images/students.jpg` | Young people around a table: "Student co-ops" card; `/credits` | Unsplash `zgdhwK1UT3U`, tribesh kayastha |
| `public/images/market.jpg` | Hand-to-hand produce at a market stall: "Farmers' and housing co-ops" card; `/credits` | Unsplash `yd1SUwAVD9M`, Grab |
| `public/brand/*` | Monark mark, horizontal and vertical logos, mesh butterfly, social icons | brand-refs + monark.io repo |

Icons: Lucide. Illustrations built in code: vote card, member grid, route diagram, lifecycle diagram, signature seals. OG image generated with `next/og` per locale. Favicon: the Monark mark.

## 10. Pricing strategy

**Free, included in the Monark bundle.** CoopDAO is community infrastructure: it is how Monark itself runs (open governance, a community treasury, member roles) and how it brings that model to local communities. A fee on a co-op's own treasury would contradict its purpose, and the code is open source. On a real network, the only cost is gas. Co-ops or partners that need help deploying (custom chain, charter drafting, onboarding their members) go through Monark's partnership programme rather than a price list.

A `/pricing` page exists for internal strategy review only: "Free, part of Monark", what's included, and the partner-support note. It is never linked, excluded from the sitemap and marked `noindex, nofollow`. No other page mentions prices.

## 11. Out of scope

- Real wallets, chains or contracts; no wagmi/viem. The data layer in `src/lib/demo/` is shaped so it could be swapped.
- Token-weighted, quadratic or delegated voting (that's GovChain's territory; CoopDAO is one member, one vote).
- Committee elections as a flow (the term and next election date are shown, not run).
- Leaving the co-op and refunding the member share (explained on How it works, not simulated).
- Several co-ops per visitor, co-op creation from scratch, notifications, email, off-chain discussion threads.
- Multiple tokens: the treasury holds tUSDC only.

## 12. Decisions taken while building (unattended)

- **Positioning vs GovChain.** GovChain (dao-voting-platform) is the general voting module; CoopDAO is the organisation around it (membership, committee, charter, treasury) and deliberately limited to one member, one vote.
- **One demo co-op, Le Grenier.** A student food co-op in Montréal fits Monark's audience (students, local communities) and the documentation's examples; names are bilingual-friendly and untranslated.
- **Visitor starts as a non-member.** Joining is flow 1, so votes and proposals are gated on membership, as in a real co-op. The visitor becomes member #35 and is added to the electorate of votes still open.
- **Simulated co-members.** Committee signatures arrive about 2 s apart (for your application, your committee proposals, and the seeded #16 when viewed). "Fast-forward to the end of the vote" plays the other members' votes one by one with a deterministic per-proposal lean and turnout, so #18 passes and #19 fails for lack of quorum, which shows both outcomes.
- **Execution is open to any member** once approved: the rules already decided, so no one person gatekeeps the payment.
- **"Available" treasury** = balance minus approved-but-unpaid spends; the composer refuses amounts above it.
- **Charter changes** apply to later proposals; ranges are bounded (committee limit 50–5,000 tUSDC, quorum 10–90%, voting 2–14 days, share 5–200 tUSDC). Committee size/threshold, supermajority and one-member-one-vote are shown as fixed.
- **Quorum marker labelling.** The marker in the member grid is explained in the grid legend rather than with a floating label (the label collided with wrapped rows).
- **Phones.** On proposal pages the vote/payment panel comes right after the vote grid; in the composer a compact live route line sits under the amount (the full diagram is below the form).
- **Toasts** sit top-right under the app bar on desktop (offset 176 px), clear of the proposal and composer content; on phones they sit under the site header, never over the flow content. After the simplification pass only three remain: "The demo co-op was reset.", "Ledger exported as CSV." and the welcome toast (only when you're not on the members page, which shows the welcome itself). Votes, fast-forward, payments, applications and new proposals confirm in place.
- **Photos**: three free Unsplash images (people deciding and working together, warm light), credited on `/credits`; everything else is product UI and line art drawn in code.
