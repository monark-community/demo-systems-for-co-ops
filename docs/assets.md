# Assets

## Photography

All photos are from Unsplash under the free [Unsplash License](https://unsplash.com/license) (none are Unsplash+; each was downloaded from `images.unsplash.com` and checked not to redirect to `plus.unsplash.com`). They are resized to 1,600 px on the long edge, compressed (quality 72), stored in `public/images/` and served with `next/image`. Photographers are credited on `/credits`, linked from the footer.

| File | Unsplash page | Photographer | Profile | Used on |
|-|-|-|-|-|
| `public/images/students.jpg` | https://unsplash.com/photos/zgdhwK1UT3U | tribesh kayastha | https://unsplash.com/@trikayastha | Home, "Who runs on CoopDAO": student co-ops; `/credits` |
| `public/images/assembly.jpg` | https://unsplash.com/photos/1tAtO-9HYNM | Dorota Trzaska | https://unsplash.com/@dtrzaska1 | Home, "Who runs on CoopDAO": local collectives; `/credits` |
| `public/images/market.jpg` | https://unsplash.com/photos/yd1SUwAVD9M | Grab | https://unsplash.com/@grab | Home, "Who runs on CoopDAO": farmers' and housing co-ops; `/credits` |

## Monark brand assets

From `lovable-migration/brand-refs/` and the [monark-community/website](https://github.com/monark-community/website) repo, used per `monark-brand-guidelines.md`:

| File | Source | Used for |
|-|-|-|
| `public/brand/monark-mark.svg`, `src/app/icon.svg` | brand-refs `logos/svg/standalone/logo-branded-standalone.svg` | Header pairing, favicon, wallet prompt, OG image |
| `public/brand/monark-horizontal-{light,dark}.svg` | website `public/vectors/brand/horizontal/` | Footer Monark band |
| `public/brand/monark-vertical-{light,dark}.svg` | brand-refs `logos/svg/vertical/` | 404 page |
| `public/brand/monark-mesh.svg` | website `public/vectors/decorative/monark-mesh.svg` | Home hero only (once per site) |
| `public/brand/socials/*.svg` | website `public/vectors/socials/` | Footer social links (recoloured to `foreground` through a CSS mask) |

## Built in code

- **Hero vote card** (`src/components/home/hero-vote-card.tsx`): proposal #18 routed by the charter, 34 member dots filling to quorum, passed and paid.
- **Member grid** (`src/components/demo/member-grid.tsx`): one dot per member with the quorum marker; used on the home page, How it works, proposal cards and pages.
- **Route diagram** (`src/components/diagrams/route-diagram.tsx`): proposal → charter → committee / member vote / charter change; home page and the composer's live preview.
- **Committee seals** (`src/components/demo/seals.tsx`): three rings stamped by signatures; proposals, applications, How it works.
- **Lifecycle diagram** (`src/components/diagrams/lifecycle-diagram.tsx`): draft → route → approve → execute → record; How it works.
- Open Graph image: generated per locale with `next/og` (`src/app/[locale]/opengraph-image.tsx`).
- Icons: [Lucide](https://lucide.dev). Type: Nunito Sans via `next/font/google`.
