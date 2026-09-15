# sales-js — brand & conversion site

A lightspeed personal-brand site for **Md Ilias Hossain Tushar** (6 yrs brand management · customer conversion),
built as an **outreach asset**: every LinkedIn/WhatsApp DM ends with one of these three funnels instead of a CV.

Zero frameworks, zero webfonts, zero build step. Three hand-written structures sharing one motion engine.

| Structure | File | Funnel type | Page weight | Use it when |
|---|---|---|---|---|
| **A · Proof-First Authority** | `index.html` | long-scroll 8-stage trust funnel | 73.6 KB raw / **23.1 KB gz**, 5 requests | they clicked from a profile, want the full picture, or you need something to print |
| **B · Diagnostic Funnel** | `audit.html` | one-way 4-step qualifying micro-funnel → instant score | 66.8 KB / **22.9 KB gz** | the "free audit" offer — qualifies by budget, filters tyre-kickers, hands over value either way |
| **C · 10-Second DM Pitch** | `pitch.html` | mobile snap-reel, 6 screens, one button | 48.9 KB / **16.4 KB gz** | cold-ish reply on a phone; the DM follow-up with the least friction |

No dependencies to install. Open it:

```bash
python3 -m http.server 8000 --bind 0.0.0.0     # then / , /audit.html , /pitch.html
```

---

## 1 · Structure A — `index.html` (dark luxury: near-black + gold/emerald)

Header and hero answer the *only* question a prospect has before they scroll:
**“what do I get, and why should I believe you?”** — outcome first, biography deliberately buried (that inversion
*is* one of the fixes being sold).

```
1 attention   hero: outcome promise + kinetic mask reveal + live "leak meter" SVG-free motion card
2 proof       4 counters (count-up) + industry marquee + sourced-claims footnote
2b reframe    pull-quote band (brand vs funnel) — the belief shift that makes the price logical
3 diagnosis   the 4 leaks (L1..L4 cards)  →  self-recognition → "find your leak" CTA into Structure B
4 mechanism   5-stage funnel diagram (animated widths) + per-stage KPI board with published B2B benchmarks
5 cases       3 anonymised before→after cards with animated bar sparks and a quote
6 offer       3 tiers, one flagged "most chosen", fixed price, risk clause strip
6b process    14-day timeline (day 0–1 … 10–14) — kills the "this will take ages of my time" objection
7 trust       about + capability matrix + operating rules
7b objections 5-item accordion — the five things they were going to ask, answered in writing
8 action      final block: audit CTA + 4 direct lines (WhatsApp/email/booking/LinkedIn)
9 footer      second entry point (lead-magnet email) + perf flex + full funnel link map
```

Sticky mobile dock CTA appears after 85% of a viewport of scrolling and disappears at the footer;
nav carries a scroll-progress rule; `?debug=1` shows live funnel events bottom-right.

## 2 · Structure B — `audit.html` (editorial Swiss: off-white grid + signal red)

The conversion mechanism proper: **a self-serve diagnosis that ends in a decision**, with no navigation to
leak out of (one-way funnel by design).

```
why-this-exists   5-min promise, "no email to see your score", personalisation banner (?to=)
step 1  SHAPE     solo / team / scaling + category line                      → qualifies effort
step 2  MATHS     3 sliders (leads · conversion · ticket) + currency          → live leak readout
step 3  BREAK     which sentence stings (traffic/trust/offer/follow-up)       → picks the fix list
                  + 4 "already in place" ticks                                  → avoids re-selling basics
step 4  CONTACT   name + email/WhatsApp + best window + note                   → only now asks for detail
RESULT            animated 0–100 gauge · revenue today vs realistic vs LEAK/mo · 3 prioritised fixes
                  with impact windows (72h / 14d / 30d) · copyable plain-text summary → WhatsApp/email
THE ASK           15-min booking with the leak number already in the subject line, + what-happens-next cards
```

Scoring is a real rules engine (`assets/funnel.js`), not a random number: conversion below the 2–5% B2B band,
missing one-way page, follow-up gap, ticket size and stage all move it, and the verdict text changes
(`Leaking at every seam` → `Visible, not believed` → `Built, under-extracted`). Prefill a prospect's likely
answers straight from the DM link:

```
audit.html?to=Yousuf%20Efti&co=Future%20Icon&leads=18&conv=2&ticket=120000&break=followup
```

With no `formEndpoint`, the lead never leaves the visitor's browser — the result is rendered client-side and
*they* choose to send it to you. That is the whole trust argument of the page, so it's the default.

## 3 · Structure C — `pitch.html` (kinetic: black + acid lime, stroke-type marquee)

Six snap screens, one action each, thumb-first:

```
1 hook     "You're the authority. Your inbox says otherwise." + 3 counters + the one button
2 leak     1,000 → 460 → 88 → 26 → 2 animated flow; the last two lanes spill red
3 fix      the four 14-day moves with the number each one moves
4 proof    three rooms, same four moves
5 ask      ৳75,000 · 14 days · 45-day benchmark clause · three doors (audit / WhatsApp / book)
6 who      credibility + "NOT FOR YOU IF" disqualification (the highest-status line on the site)
```

## 4 · Shared motion engine (`assets/motion.js`, 4.8 KB gz)

| Motion graphic | Technique | Cost |
|---|---|---|
| Mask/line headline reveal | `.mask>span` translateY + stagger via `--d` | compositor-only |
| Metric count-up | rAF cubic ease-out, fires from the reveal observer | 1 paint/number |
| Scramble-decode label | char-cycling text rotator (`data-scramble="A|B|C"`) | idle 1 node |
| Funnel stage fills | `clip-path` + animated `--w` widths on scroll | GPU |
| Bar sparks / leak meter | CSS keyframe `scaleX/scaleY` with per-bar `--d` | GPU |
| Industry marquee / kinetic type | duplicated track + `translateX` loop (pauses on hover) | 1 animation |
| SVG line-draw | `stroke-dasharray/offset` on reveal | used by the gauge arc |
| Cursor spotlight + magnetic CTAs | rAF-throttled custom props, `pointer:fine` only | skipped on touch |
| Scroll progress + sticky dock | single passive scroll handler, rAF-batched | 1 handler |
| Gauge + step transitions | `stroke-dashoffset`, `pane-in` keyframe | on submit only |

Everything is `prefers-reduced-motion`-aware (animations collapse to final states) and the page is fully
readable with JS disabled — motion is decoration, never a gate.

## 5 · Customise in 10 minutes

1. `assets/site.config.js` — name, email, WhatsApp, booking, LinkedIn, prices, `formEndpoint`.
2. Search & replace `https://yourdomain.com` in the three HTML files + `sitemap.xml` + `robots.txt`.
3. Work through **`docs/DATA-CHECKLIST.md`** — every demo metric, footnote and claim.
4. `assets/og-cover.jpg` (1200×630) is the LinkedIn/WhatsApp preview card. Redraw it if the headline changes —
   the card is the first half of the pitch.
5. Optional: `assets/theme-dark.css` / `-editorial.css` / `-kinetic.css` hold only tokens + component skins;
   swap `--accent`/`--bg` and a structure becomes a different brand in one line.

Add a 4th structure without touching the others:

```html
<link rel="stylesheet" href="assets/base.css">
<link rel="stylesheet" href="assets/theme-editorial.css">   <!-- reuse a skin, or add theme-x.css -->
<script src="assets/site.config.js"></script>
<script src="assets/motion.js" defer></script>
<!-- then: data-reveal / data-count / data-cue / data-passthrough / data-to -->
```

## 6 · Funnel measurement (so "top 1%" is a number, not an adjective)

`assets/motion.js` logs every funnel event to `localStorage` (last 60) and, if `SITE.trackEndpoint` is set,
`sendBeacon`s each one. Open any page with `?debug=1` to watch it live.

| Event | Fires on | What it tells you |
|---|---|---|
| `page_view` | load (+`utm_*`, referrer) | which DM/post/profile drives traffic |
| `cue_proof` `cue_diagnosis` `cue_method` `cue_cases` `cue_offers` `cue_faq` `cue_about` `cue_cta_final` | section enters view | how far the long-scroll gets read |
| `step_1…step_4` | stepper advance | where the audit funnel loses people |
| `opt` | each option pick | which pain point your audience admits |
| `metric_view` | a counter finishes | proof actually consumed |
| `personalised` | visit via `?to=` | per-prospect open + read behaviour |
| `copy` / `whatsapp_click` / `email_click` | hand-off actions | intent, the warmest signal you'll get |
| `audit_complete` | score rendered (+score, leak) | qualified lead count |
| `lead_sent` / `lead_send_failed` | POST to `formEndpoint` | delivery sanity |
| `magnet_submit` | footer checklist | secondary funnel volume |

`utm_*` on any inbound link is captured on first touch and persisted, so a lead from 3 weeks ago still
attributes to the post or DM that produced it.

Targets for the site itself (measure 30–90 days, split by source — published B2B pages convert 2–5% of
visitors to a lead; Unbounce's all-industry landing-page median is 6.6%, top performers >11%; DM/email
traffic converts far above organic social, roughly 19% email → landing page vs 1.2–2.9% organic social):
`index → audit` click-through ≥ 12%, audit start ≥ 55%, audit completion ≥ 40% of starts,
`audit_complete → booking` ≥ 25%. If a stage misses, fix that stage — never the whole page. [1](https://marketful.com/marketing-funnel) [2](https://kissmetrics.io/blog/conversion-rate-benchmarks) [3](https://grow-conversions.com/blog/conversion-rate-benchmarks-by-industry/)

## 7 · Ship it

Static — any of these work:

```bash
# GitHub Pages (repo is already github.com/ihttushar182-web/sales-js)
#   repo → Settings → Pages → Source: Deploy from a branch → main / (root)
#   then set the custom domain in Settings → Pages and update canonical/og URLs

# or Netlify / Vercel / Cloudflare Pages: drag-drop the repo root, no build command, no install step
# or any nginx/caddy: serve the folder as-is
```

The repo has no `package.json` on purpose: nothing to install, nothing to rot, `npm audit` is irrelevant.

## 8 · Repo map

```
index.html              Structure A · proof-first long-scroll
audit.html              Structure B · one-way 4-step diagnostic funnel
pitch.html              Structure C · mobile 6-screen DM pitch
404.html                branded, and a funnel joke that lands
robots.txt sitemap.xml  indexable; personalised ?to= links disallowed (don't let bots read your prospect's name)
assets/
  base.css              tokens, type scale, motion primitives, forms, stepper, gauge, dock   (16.9 KB)
  theme-dark.css        Structure A skin
  theme-editorial.css   Structure B skin
  theme-kinetic.css     Structure C skin
  motion.js             reveal · counters · scramble · spotlight · tracking · personalisation (13.2 KB)
  funnel.js             stepper · validation · leak maths · scoring · result · hand-off       (11.3 KB)
  site.config.js        ONE file with names, links, prices, endpoints
  favicon.svg og-cover.jpg
docs/
  OUTREACH-efti.md      prospect dossier, DM sequence, benchmark table, objection map
  DATA-CHECKLIST.md     every placeholder + the ethics line before you publish
```

MIT · Md Ilias Hossain Tushar
