# Yousuf Efti — Sales Leadership

**A bilingual (English / বাংলা), three-mood, static website for Md Yousuf Efti, PhD** — sales leadership trainer,
CEO of Future Icon™ — built as a conversion system, not a brochure. It carries his credibility *and* the machinery
that turns a follower into a corporate training contract:

- a **free Sales Credibility Index™** (10 rotating questions from a 40-question bank → scored 0–100 → report to email or WhatsApp)
- **8 programmes** with a **learner dashboard** (progress rings, action plans, certificates)
- **articles + photo gallery** that **he edits himself** through a login-protected back office
- a **live appointment board** (slots from his real working hours → `.ics` + WhatsApp confirmation)
- **SEO + AEO/AIO + agent-readable plumbing**: JSON-LD graph, sitemap, RSS + JSON Feed, `llms.txt`, hreflang, PWA

Zero frameworks. Zero webfonts. No build tool to install — one Node script for content plumbing.
Measured page weight (`gzip -9`, cold, no cache): **index 139 KB raw / 41.2 KB gz over 7 requests**
(54 KB HTML + 34 KB CSS + 33 KB JS + 18 KB content JSON); inner pages land at **25–32 KB gz over 5 requests**.
No webfonts, no framework, no third-party origin — the LCP element is hero text, so first paint is paint-bound.

```bash
node tools/serve.js      # http://localhost:8000  + admin boards can write back to content/*.json
node scripts/build.js    # validate JSON → gallery.json, sitemap.xml, rss.xml, feed.json, llms.txt, JSON-LD
python3 -m http.server 8000 --bind 0.0.0.0   # plain preview if you don't want the save endpoint
```

---

## 1 · The pages

| File | What it is | Funnel role |
|---|---|---|
| `index.html` | Hero + 3D stat cube, proof stats, three doors, programmes teaser, articles, gallery strip, objections, lead magnet | **capture** — one CTA above the fold, one at the end, one in the mobile dock |
| `diagnostic.html` | Sales Credibility Index™ — rotating questions, gauge, dimension bars, fix list, report delivery | **qualify** — the free value that produces a named lead with a score attached |
| `courses.html` | 8 programmes with seats/prices/dates + the learner dashboard preview + terms FAQ | **convert** — pricing is public, so the call starts at "which size", not "how much" |
| `blog.html` / `article.html` | Article index (search + tags) and article template, both rendered from `content/posts.json` | **authority + SEO surface** — the pages that actually earn rankings |
| `gallery.html` | Masonry gallery + keyboard lightbox, rendered from `content/gallery.json` | **proof** — rooms, cohorts, awards |
| `book.html` | Live slot picker from `content/settings.json`, `.ics`, Google Calendar link, WhatsApp confirm | **appointments** — no back-and-forth, no "when are you free?" |
| `admin.html` | Passphrase-gated boards: overview, leads, appointments, articles, programmes, gallery, diagnostic, booking, SEO audit, security | **his** control room |
| `outreach/` | Your own assets from the previous build (profile page, 4-step audit funnel, mobile pitch) — `noindex`, not linked | **your** DM weapon; kept out of his site's sitemap |

### Funnel map (all stages are instrumented; open any page with `?debug=1`)

```
                     ┌────────────┐   cue_how    ┌──────────────┐  step_1..4   ┌──────────┐
 DM / LinkedIn / FB →│ index.html │─────────────→│ diagnostic   │─────────────→│  report   │
                     └─────┬──────┘              └──────┬───────┘              └────┬─────
                           │ cue_courses                │ lead (score+dims)         │ shareable ?r= link
                           ▼                            ▼                          ▼
                     ┌────────────              ┌──────────────┐         send to trainer / GM
                     │ courses    │──────────────→│ book.html    │
                     └─────┬──────┘  enrol→dash    └──────┬───────┘  slot_pick → appointment → .ics
                           │                              │
                     ┌─────▼──────┐                ┌──────▼───────┐
                     │ blog /     │  cta blocks     │ admin boards │  leads · appointments · edits · SEO audit
                     │ gallery    │────────────────→│ (noindex)    │
                     └────────────┘                 └──────────────┘
```

---

## 2 · Mood and language

- **Three themes** — `light` (paper + ink), `bright` (electric navy/gold), `dark` (deep navy/gold). Persisted in
  `localStorage`, no flash (an inline script sets `data-theme` before first paint), and each sets `theme-color` so
  the phone chrome matches. Toggle is in every header.
- **Two languages** — EN / বাং. Translated copy lives *inline* as `<span class="en">…</span><span class="bn i">…</span>`,
  so switching is a CSS flip (no re-fetch, no reflow jank, works with JS off) and both languages exist in the served
  HTML for crawlers. Bangla gets its own stack (`Noto Sans Bengali, SolaimanLipi, Kalpurush, Nirmala UI`) with a
  serif/sans line-height bump so syllable clusters don't clip. Content JSON holds `titleEn/titleBn`, `summaryBn`,
  `bodyBn`, `captionBn` and the UI re-renders on language change.

## 3 · Motion (all hand-written, all `prefers-reduced-motion` aware)

| Effect | Where | How |
|---|---|---|
| **CSS-3D stat cube** | hero | 6 faces on `preserve-3d`, 22 s rotation, pauses on hover — the "small 3D sales objects" ask, with no WebGL payload |
| **Pointer tilt + layered depth** | proof card | `rotateX/rotateY` from pointer, `.lay` translated on Z |
| **3D funnel pyramid** | hero card | three `rotateX(52deg)` planes that fan out on reveal |
| Rotating revenue **coin** | `assets/site.css` `.coin` | 3D spin, `৳` face — available for any page |
| Mask line reveals, counters, marquee, scroll rule, dock, gauge arc, conic progress rings, seat bars, live slot grid | everywhere | IntersectionObserver + `clip-path` + rAF counters + compositor transforms |
| Lightbox with keyboard nav | gallery | one delegated listener, focus returned on close |

Nothing blocks LCP: no fonts to wait for, images `loading="lazy"` with width/height set (no CLS), CSS/JS deferred.

## 4 · Editing content (Yousuf's side)

`admin.html` → passphrase (default **`efti2026-change-me`**, change it in Security) → boards:

- **Articles** — new/edit/delete, bilingual title/excerpt/body, tags, cover, linked programme. Save.
- **Programmes** — price, seats left, next cohort, featured flag, bilingual summary. This drives the public cards *and* the dashboard.
- **Gallery** — captions, hide, add by path.
- **Diagnostic** — how many questions per session, band labels.
- **Booking** — duration, buffer, working windows, open days, platform, meeting link, fee line. Slot availability follows these rules.
- **Leads / Appointments** — every diagnostic result and booking lands here; CSV export; one-click reply by email/WhatsApp.
- **SEO / AEO** — runs a 14-point check *against the live pages in the browser* (title length, meta length, canonical,
  single h1, OG/Twitter, viewport, lang, JSON-LD, image alt coverage, word count, internal links, placeholder text)
  and prints per-page scores with the exact fix on hover.
- **Security** — generate a new passphrase hash, set the sync endpoint.

**Saving:** run `node tools/serve.js` and the boards `PUT` straight into `content/*.json` (token `dev` by default,
`FI_TOKEN` to change). Opening the site any other way falls back to `localStorage` + **Export JSON** — you drop the
file into `content/` and commit. Photos are the simplest loop: drop JPGs into `assets/img/gallery/`, run
`node scripts/build.js`, captions preserved by filename.

## 5 · Deploy

```bash
node scripts/build.js                      # regenerates sitemap.xml, rss.xml, feed.json, llms*.txt, JSON-LD
git add -A && git commit -m "content update" && git push   # Pages/Netlify/Cloudflare pick it up
```

1. In `content/settings.json` set `seo.siteUrl` to the real origin, and the contact block.
2. Point DNS: `yousufefti.com` + `www` → your host. Then run build again so sitemap/canonicals match.
3. Google Search Console → Domain property → verify with the DNS TXT → put the same value in `settings.seo.googleVerify`
   (documentation only; the verification itself is DNS). Submit `sitemap.xml`. Request indexing for the 7 pages + top 3 articles.
4. Google Business Profile (Dhaka) with the same name/phone/hours as `settings.json` — that consistency is the local
   ranking lever; link `yousufefti.com` in it.
5. Full launch list: **`docs/SEO-AIO-AGO.md`**. Content/claims list to verify: **`docs/DATA-CHECKLIST.md`**.

## 6 · Repo map

```
index.html diagnostic.html courses.html blog.html article.html gallery.html book.html admin.html 404.html
assets/
  site.css            tokens for 3 themes, bilingual rules, motion, 3D, admin, print
  app.js              settings, theme, language, reveal, counters, tilt, lightbox, tracking, SW
  render.js           courses + dashboard, article list/page, gallery (JSON → DOM, re-renders per language)
  diagnostic.js       40-question bank, scoring, bands, report text, capture → email/WhatsApp/.txt
  book.js             slot engine, .ics, Google Calendar link, confirmation
  admin.js            login, 10 boards, CSV/JSON export, SEO auditor
  img/gallery/*.svg   placeholders (replace with JPGs, same basename)
  img/blog/*.svg      article covers          og-efti.jpg 1200×630 share card   favicon.svg + icon-*.png
content/
  settings.json  courses.json  posts.json  gallery.json      (+ inbox.jsonl when tools/serve.js collects leads)
scripts/build.js        validate → gallery.json, sitemap.xml, robots.txt, rss.xml, feed.json, llms.txt, llms-full.txt, JSON-LD into every page
tools/serve.js          preview + PUT /__save (writes content/*.json) + POST /__lead (collects leads locally)
sw.js · manifest.webmanifest       installable, offline-fast, network-first for JSON so edits show instantly
docs/  OUTREACH-efti.md · CONTENT-GUIDE.md · SEO-AIO-AGO.md · DATA-CHECKLIST.md
outreach/                your own profile + audit + pitch pages (noindex)
```

MIT · built by Md Ilias Hossain Tushar for Md Yousuf Efti, PhD.
