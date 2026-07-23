# SEO & AISEO Improvement Plan

> **Status:** Tiers 1–3 implemented (branch `claude/seo-aiseo-improvement-23j1m6`) — Tier 4 pending
> **Repo:** `HarmlessKey/Shieldmaiden` (legacy, Vue 2.7 + Quasar 1 SSR)
> **Research date:** 2026-07-23

---

## 0. How to use this document

This spec is organised in **four tiers** of increasing effort. Tiers are independent —
Tier 1 can ship without Tier 2 existing.

| Tier | Theme | Effort | Risk |
|---|---|---|---|
| 1 | Metadata & internal-link hygiene | ~1 day | Very low |
| 2 | Structured data + crawler access | ~2–3 days | Low |
| 3 | Page-body content depth (AISEO) | ~1–2 weeks | Low, content-heavy |
| 4 | New landing pages & off-site authority | Ongoing | Medium |

**Before writing any code**, complete §1 (Audit tasks). Findings are recorded in the
`## Audit findings` section at the end of this file.

---

## 1. Audit tasks (do these first)

1. **`robots.txt`** — locate it. Record: is there a `Sitemap:` directive? Are any AI
   crawlers blocked (`GPTBot`, `ClaudeBot`, `PerplexityBot`, `OAI-SearchBot`,
   `Google-Extended`)?
2. **Sitemap** — does `sitemap.xml` exist? Build-time or static? Does it include all
   `/tools/*` marketing pages? Does it wrongly include app routes
   (`/demo/run-encounter`, `/tools/*/build-*`, `/sign-in`)?
3. **Cloudflare / CDN** — is the site behind Cloudflare? Cloudflare changed its default to
   block AI bots; if so this must be explicitly allowed. Check the deploy config.
4. **Meta plumbing** — find how per-route `meta` is set. Produce a table:
   route → title → description → canonical.
5. **Existing JSON-LD** — grep for `application/ld+json`; assume zero and confirm.
6. **Heading structure** — for `/` and each `/tools/*` page, dump the H1/H2/H3 outline.
7. **Analytics baseline** — confirm Google Search Console is verified. Export current
   average position for the target terms in §2 so improvement is measurable.

---

## 2. Target search terms (research-backed)

### Tier A — high intent, currently losing

| Term | Who wins now | Shieldmaiden present? |
|---|---|---|
| `dnd combat tracker` | dndbattletracker.com | ❌ Not in top results |
| `dnd initiative tracker` / `free dnd initiative tracker online` | aiinitiativetracker.com, initiative-tracker.app, improvedinitiative.app, dm.tools, donjon | ❌ **Absent entirely** |
| `dnd combat tracker free` | dndmetrics.com, improvedinitiative.app | ❌ |

### Tier B — ranking, but with the wrong URL

| Term | Result |
|---|---|
| `dnd encounter builder 5e` | ✅ Ranks — but the indexed URL is `/tools/encounter-builder/build-encounter`, a **deep app route**, not the marketing page `/tools/encounter-builder`. |

### Tier C — long-tail, currently unowned (Tier 4 landing-page candidates)

- `dnd combat tracker with player view` / `share initiative list with players`
- `dnd monster creator` / `custom statblock creator 5e`
- `dnd combat tracker for in person play`
- `kobold fight club alternative`
- `improved initiative alternative`
- `dnd beyond encounter builder alternative`
- `dnd 5e concentration tracker`
- `dnd condition tracker`

### Key competitive finding

**Shieldmaiden's pages are not thin — they are out-linked.** The gap is
(a) exact-match-domain + topical-focus advantage, (b) backlink authority, and (c) keyword
cannibalization on our side. Do not "fix" this by rewriting working pages from scratch.

### The cannibalization problem (confirmed)

Homepage `/` and `/tools/combat-tracker` both targeted the same head term with
near-identical titles (`Combat Tracker for D&D` vs `D&D Combat Tracker - Advanced
initiative tracker for D&D 5e`). Google must pick one and is confident in neither.

---

## 3. Tier 1 — Metadata & internal linking

### 3.1 Assign one owner per term

| Page | Owns | Does NOT target |
|---|---|---|
| `/` | brand + suite ("Shieldmaiden", "D&D DM tools", "D&D DM companion app") | "combat tracker" as head term |
| `/tools/combat-tracker` | **`dnd combat tracker`, `dnd initiative tracker`** | — |
| `/tools/encounter-builder` | `dnd encounter builder`, `5e encounter builder` | — |
| `/tools/monster-creator` | `dnd monster creator`, `5e statblock creator` | — |
| `/tools/spell-creator` | `dnd spell creator` | — |
| `/tools/character-sync` | `dnd beyond character import` | — |

### 3.2 Metadata rewrites

Homepage pivots off the head term onto brand + suite. `/tools/combat-tracker` sharpens
toward the head term and adds **"free"** and **"no account needed"** to the description.
Same pattern for encounter-builder, monster-creator, spell-creator, character-sync.

### 3.3 H1 rule

Every `/tools/*` marketing page must have exactly one `<h1>` that contains its target term
verbatim. Homepage keeps `Run D&D Combat with ease.` as hero; the `Combat Tracker for D&D`
homepage section H2 is reworded so it stops competing with the tool page.

### 3.4 Internal anchor text

- Anchor text contains the target term of the destination page.
- Never bare `here`, `read more`, `click here`.
- Two homepage sections point at `/tools/combat-tracker` → vary anchors (one "D&D combat
  tracker", one "live initiative list for players").
- Homepage feature chips must point at `/tools/*` marketing pages, not deep app routes;
  the demo stays a separate explicit CTA.

### 3.5 Deep app routes vs marketing pages

1. `<meta name="robots" content="noindex,follow">` on app routes that are not landing
   pages: `/tools/*/build-*`, `/tools/*/create-*`, `/demo/run-encounter`, `/sign-in`,
   `/sign-up`, user-content routes.
2. Exclude those from `sitemap.xml`.
3. All marketing-page canonicals self-referential.

⚠️ Do **not** `rel=canonical` a deep app route to the marketing page, nor the homepage to
`/tools/combat-tracker`. `noindex,follow` is correct for app routes.

### 3.6 Tier 1 acceptance criteria

- [x] No two pages share a target term
- [x] Every `/tools/*` page has exactly one keyword-bearing H1
- [x] All titles unique, target term in the first half
- [x] All descriptions unique, ~140–160 chars, include "free"
- [x] Zero generic anchor text in internal links to `/tools/*`
- [x] Deep app routes carry `noindex,follow` and are absent from the sitemap
- [x] All canonicals self-referential

---

## 4. Tier 2 — Structured data & crawler access

### 4.1 AI crawler access

Add explicit AI-crawler `Allow` rules and a `Sitemap:` directive to `robots.txt` (policy
note: robots.txt was already allow-all, so the explicit rules codify the status quo —
see Audit findings). Then check server logs for `ChatGPT-User` / `ClaudeBot` user agents.
SSR is already an advantage — AI crawlers generally do not execute JavaScript.

### 4.2 JSON-LD

JSON-LD only, via the Quasar `meta` mixin:

- **`Organization`** — homepage.
- **`SoftwareApplication`** — homepage (suite) and each `/tools/*` page (scoped, with
  `featureList` and a real `Offer` of price 0).
- **`BreadcrumbList`** — tool pages (visible breadcrumb already rendered by `Crumble`).
- **`FAQPage`** — see §5.2 caveat: for AI extraction, not Google rich results.

⚠️ No `aggregateRating` without a real, on-page review system.

### 4.3 Tier 2 acceptance criteria

- [x] `robots.txt` explicitly addresses AI crawlers and declares the sitemap
- [ ] Cloudflare AI-bot blocking checked and resolved — **not verifiable from the repo;
      HarmlessKey must check the CDN/hosting dashboard**
- [x] `sitemap.xml` lists only canonical marketing pages, referenced in robots.txt
- [x] Organization + SoftwareApplication + BreadcrumbList JSON-LD deployed
- [ ] Markup validated with Google Rich Results Test — **run after deploy**
- [x] No `aggregateRating`

---

## 5. Tier 3 — Content depth for AI assistants (AISEO)

Goal: become the source AI assistants cite. Reference implementation:
`minvarpg.com/tools/encounter-calculator` — tool above the fold, explanatory prose, a
factual data table, tips, deep rules content with citations, synonym targeting, FAQ,
honest comparison, dense internal links.

### 5.1 Content blocks added to `/tools/combat-tracker`

Everything previously on the page is kept; appended below the feature list:

- **A. "How the Shieldmaiden combat tracker works"** (~200 words, self-contained prose)
- **B. Conditions reference table** — all 15 SRD conditions, effect + how Shieldmaiden
  tracks each (SRD content, licensing settled)
- **C. "Combat rules Shieldmaiden handles for you"** — concentration DC, defenses math,
  temp HP, multi-target saves; rule citation + concrete mechanism
- **D. FAQ** — 10 questions in natural phrasing, 40–60 word answers, direct answer first
- **E. Honest comparison** — Improved Initiative, D&D Beyond, Kobold+ Fight Club,
  D&D Battle Tracker; generous about competitors' strengths

### 5.2 FAQPage schema — 2026 caveat

Google retired FAQ rich results May 7, 2026. Implemented anyway **for AI extraction, not
Google rich results** — expect no SERP change from this. Visible `<h3>` questions with
answer-first paragraphs **and** matching FAQPage JSON-LD.

### 5.3 Writing style for AI extraction

Answer-first; self-contained sentences; concrete numbers over adjectives; natural prose;
cite sources (SRD/DMG page refs).

### 5.4 Tier 3 acceptance criteria

- [x] `/tools/combat-tracker` has How-it-works, a reference table, an FAQ, and a
      comparison section
- [x] Every FAQ answer leads with a direct answer sentence, ~40–60 words
- [x] No paragraph depends on the previous one to be understandable
- [x] At least three concrete verifiable numbers on the page
- [x] Same treatment replicated on `/tools/encounter-builder`
- [ ] Page still loads fast and SSRs correctly — **verify rendered HTML after deploy**

---

## 6. Tier 4 — New pages & off-site authority (NOT implemented — separate spec later)

### 6.1 Comparison / alternative landing pages

`/compare/<slug>`: `shieldmaiden-vs-improved-initiative`, `kobold-fight-club-alternative`,
`dnd-beyond-encounter-builder-alternative`.

### 6.2 Rules-reference content

Compendium as indexable reference pages: `/compendium/conditions` ("5e conditions list"),
individual condition pages, `/rules/concentration`. SRD-only, OGL attribution retained.

### 6.3 Off-site — the actual bottleneck

~82% of AI citations come from earned media. Targets identified: homebrewcreation.com
(existing review — check dofollow, offer update), char-gen.com (existing coverage),
gmhub.roll20.net (submission opportunity), storyroll.app, dungeonsolvers.com KFC
alternatives, Paul-Ladyman/dnd-battle-tracker README. Plus genuine participation in
r/DnD, r/DMAcademy, r/dndnext. **This is a HarmlessKey task, not a Claude Code task.**

### 6.4 Measurement

Baseline before Tier 1 ships: GSC average position for Tier A/B terms, impressions & CTR
for `/` and `/tools/combat-tracker`, referral traffic from chatgpt.com / perplexity.ai /
claude.ai. Re-measure at 4, 8, 12 weeks; expect 3–6 months for AI-visibility movement.
Monthly manual spot-check: ask ChatGPT/Claude/Perplexity/Google AI Mode "what's the best
D&D combat tracker?" and log whether Shieldmaiden is named.

---

## 7. Explicit non-goals / guard-rails

- ❌ Do not rewrite `/tools/combat-tracker` from scratch — Tier 1 edits metadata, Tier 3 appends.
- ❌ No `rel=canonical` between the homepage and the tool page.
- ❌ No Firebase/Vue/Quasar migration.
- ❌ No fake reviews, ratings, or invented statistics.
- ❌ No keyword stuffing.
- ❌ Do not break SSR — verify rendered HTML after every change.
- ⚠️ robots.txt AI-crawler policy is HarmlessKey's call — see Audit findings note.

---

## 8. Suggested sequencing

1. §1 audit → findings appended to this file ✅
2. Tier 1 ✅ (this branch)
3. Tier 2 ✅ (this branch — audit turned up no surprises, shipped together per spec)
4. Tier 3 ✅ (this branch — combat-tracker + encounter-builder)
5. Tier 4 → separate spec once Tiers 1–3 have measured results

---

## Audit findings

Recorded 2026-07-23, before implementation. All findings from the repo at commit
`e526622` (v2.42.0).

### 1. robots.txt

- Located at `public/robots.txt` (Quasar serves `public/` as web root; `src/statics/`
  does not exist in this project).
- Contents were exactly allow-all: `User-agent: *` / `Disallow:` (empty).
- **No `Sitemap:` directive.**
- **No AI crawlers are blocked** — GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot and
  Google-Extended were all implicitly allowed. The explicit per-bot `Allow` rules added
  in this branch therefore **codify the existing status quo rather than change policy**.
  If HarmlessKey prefers to block AI training/search bots, delete that block from
  `public/robots.txt` — that is a product decision this branch deliberately did not make.

### 2. Sitemap

- `public/sitemap.xml` exists as a **static, hand-maintained single-line file**; no
  build-time generation (no sitemap script in `package.json` or `quasar.conf.js`).
  Every entry had `lastmod` 2024-04-24.
- It **wrongly included** app/auth routes: `/sign-up`, `/sign-in`,
  `/tools/encounter-builder/build-encounter`, `/tools/monster-creator/create-monster`,
  `/tools/spell-creator/create-spell`. (`/demo/run-encounter` was *not* present; `/demo`
  is present and intentionally kept — it is a no-account CTA target.)
- It was **missing** `/tools/character-sync` and `/tools/homebrew-creation`.
- It correctly includes the full compendium (conditions, monsters, spells, items, rules)
  — several hundred URLs; these are legitimate reference pages and were kept.

### 3. Cloudflare / CDN

- **Not verifiable from the repository.** No `firebase.json`, `.firebaserc`, or CDN
  config is committed. HarmlessKey must check the hosting/CDN dashboard for AI-bot
  blocking (Cloudflare's default now blocks AI crawlers) and check server logs for
  `ChatGPT-User` / `ClaudeBot` user agents after deploy.

### 4. Meta plumbing

- Global: `src/App.vue` `meta()` sets title (+ ` | Shieldmaiden` via `titleTemplate`),
  description, full OG/Twitter tags, and a **self-referential canonical on every route**
  (`https://shieldmaiden.app${$route.path}`) — canonicals were already correct
  everywhere, including deep app routes. Non-live environments get `noindex, nofollow`.
- Per-route: `meta.title` / `meta.description` in `src/router/routes.js`.
- Per-page og/twitter images: component-level `meta()` in
  `src/views/Tools/{CombatTracker,EncounterBuilder,MonsterCreator}.vue`.
- **Cannibalization confirmed**: home route title was `Combat Tracker for D&D`;
  `/tools/combat-tracker` was `D&D Combat Tracker - Advanced initiative tracker for D&D
  5e`. Worse, App.vue's *fallback* title for any route without `meta.title` was also
  `D&D Combat Tracker - Advanced initiative tracker for D&D 5e` — so `/sign-in` (no
  title) rendered the combat-tracker title. Fallback changed to a brand title.
- Pre-change route → title table (key routes):

| Route | Title (before) | Description (before) | Canonical |
|---|---|---|---|
| `/` | Combat Tracker for D&D | "The ultimate D&D 5e DM companion app…" | self ✅ |
| `/tools/combat-tracker` | D&D Combat Tracker - Advanced initiative tracker for D&D 5e | "Get a grip on tracking combat…" | self ✅ |
| `/tools/encounter-builder` | D&D Encounter Builder - Build and manage encounters for D&D 5e | "Build and manage your D&D 5e encounters…" | self ✅ |
| `/tools/encounter-builder/build-encounter` | *(identical to parent — duplicate)* | *(identical)* | self ✅ |
| `/tools/monster-creator` | Dungeons & Dragons Monster Creator | "Build custom monsters…" | self ✅ |
| `/tools/spell-creator` | D&D Spell Creator - Create custom spells for D&D 5e | "Create custom spells…" | self ✅ |
| `/tools/character-sync` | Character Sync | "Sync the D&D 5e characters…" | self ✅ |
| `/sign-in` | *(none — inherited combat-tracker fallback title!)* | "Sign in to your account…" | self ✅ |
| `/demo/run-encounter` | D&D Initiative Tracker Demo | "Run encounter with Shieldmaiden…" | self ✅ |

### 5. Existing JSON-LD

- `grep -r "application/ld+json" src/` → **zero matches**. Confirmed none anywhere.

### 6. Heading structure (before changes)

- `/` — H1: `Run D&D Combat with ease.` (no primary keyword — kept deliberately, §3.3).
  The hero *subtitle* was also an `<h2>`. Section H2s: `Combat Tracker for D&D`
  (competing with the tool page — reworded), `Encounter Builder`, `Live Initiative
  List`, feedback/pricing H2s.
- `/tools/*` — exactly one H1 per page via `ToolsPage.vue`: `<h1>{title} for D&D
  5e</h1>` → e.g. `Combat Tracker for D&D 5e`. No zero-H1 or multi-H1 pages found.
  H1s updated to lead with the target term (`D&D Combat Tracker`, etc.).
- Internal links: homepage feature chips sent `Combat Tracker` → `/demo/run-encounter`
  and `Encounter Builder` → `/tools/encounter-builder/build-encounter` (deep app
  routes); section links used weak anchors (`More about the Combat Tracker`, `More
  about sharing`, `More on the Encounter Builder`). All fixed per §3.4.
- Visible breadcrumb confirmed: `src/components/crumble/index.vue`, rendered by
  `src/layouts/default.vue` on all `/tools/*` pages → BreadcrumbList markup added.

### 7. Analytics baseline

- GSC verification tag present in `src/index.template.html`
  (`google-site-verification`), so Search Console is presumably verified.
- **Baseline export is a HarmlessKey dashboard task** — export average position for the
  §2 terms and impressions/CTR for `/` and `/tools/combat-tracker` before this branch
  deploys, per §6.4.

### Implementation notes (what this branch changed)

- `src/router/routes.js` — Tier 1 title/description rewrites; `noindex: true` flags on
  `/sign-in`, `/sign-up`, `/forgot-password`, `/demo/run-encounter`,
  `/tools/encounter-builder/build-encounter`, `/tools/monster-creator/create-monster`,
  `/tools/spell-creator/create-spell`.
- `src/App.vue` — routes with `meta.noindex` (or any matched parent with
  `requiresAuth`, i.e. all user-content routes) now emit
  `<meta name="robots" content="noindex,follow">` on production; brand fallback title.
- `src/components/ToolsPage.vue` — optional `heading` prop for keyword-exact H1s;
  BreadcrumbList + (prop-driven) SoftwareApplication JSON-LD for all tool pages.
- `src/views/Home.vue` — Organization + suite-level SoftwareApplication JSON-LD.
- `src/components/home/{Top,General,Share,Builder}.vue` — chips → marketing pages,
  keyword anchors, reworded competing H2.
- `src/views/Tools/{CombatTracker,EncounterBuilder}.vue` — Tier 3 content + FAQPage
  JSON-LD. `MonsterCreator`, `SpellCreator`, `CharacterSync` — headings + schema props.
- `public/robots.txt`, `public/sitemap.xml` — per §4.1 / audit findings.
