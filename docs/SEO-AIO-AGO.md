# SEO · AIO · AGO — what's wired, and the launch list

Three audiences, one static site:
**SEO** (Google/Bing) · **AIO/AEO** (ChatGPT, Perplexity, Gemini, Copilot answering "who trains pharma sales
forces in Bangladesh") · **AGO** (agents that fetch, act and book on the visitor's behalf).

## 1 · Already implemented in the code

### Technical / Core Web Vitals (ranking hygiene)
- Static HTML, **no framework, no webfonts, no third-party JS** — measured cold: index 139 KB raw / 41.2 KB gz over 7
  requests, inner pages 25–32 KB gz over 5. LCP element is hero text, so LCP is paint-bound, not fetch-bound.
- `width`/`height` on every image + `loading="lazy"` below the fold → CLS ≈ 0. Deferred JS (`defer`) → INP unaffected by scripts.
- `preload` for the stylesheet; `theme-color` per mood; `color-scheme` per theme; `content-visibility` not needed because sections are cheap.
- `404.html` returns 404 with routes back into the funnel. `robots.txt` blocks `?to=` personalised URLs and `/admin.html`, `/outreach/`.
- `Cache-Control` in `tools/serve.js` (`no-cache` for html/json, 7 days for assets); `sw.js` is network-first for JSON
  so his edits appear immediately and the shell works offline.

### On-page
- One `<h1>` per page; every section labelled; semantic landmarks (`header/nav/main/section/footer`); skip link;
  `aria-pressed` on toggles; `alt` text on all images (from captions); visible focus rings; 4.5:1+ contrast in all three moods.
- Unique `<title>` (30–65 chars, outcome + name) and meta description (120–165) per page — enforced by the Admin → SEO audit.
- Canonical + `hreflang` en/bn/x-default; `lang` attribute flips live with the toggle; both language variants are
  present in the served HTML (so no cloaking, and Bangla is indexable as on-page content).
- Internal link graph: every page links siblings + the two entry points, so crawl depth ≤ 2 from home; footer carries
  sitemap, feed, llms.txt.

### Structured data (the AEO part)
`scripts/build.js` injects one `@graph` into all 7 public pages:
`WebSite` · `Person` (with `sameAs` LinkedIn/Facebook/Future Icon, `knowsAbout`, `award`, `contactPoint` with
`availableLanguage: [English, Bengali]`) · `Organization` (Future Icon™, `foundingDate`, `areaServed`) ·
`ItemList` of `Course` with `hasCourseInstance` (`startDate`, `courseMode`, `timeRequired`) and `Offer`
(price + BDT) · `Blog` → `BlogPosting[]` (`inLanguage`, `datePublished`, `dateModified`, `wordCount`, `keywords`) ·
`HowTo` for the diagnostic (steps = the six dimensions, `totalTime: PT4M`, `estimatedCost: 0 BDT`) · `ImageGallery`
with `numberOfItems`. `diagnostic.html` additionally carries a `FAQPage`.
**Entity consistency** is what makes Google trust a personal brand: the same name/phone/hours appear in
`settings.json`, the schema, the footer, the GBP listing and the LinkedIn profile.

### AI answer engines
- `llms.txt` (short card an assistant can quote) and `llms-full.txt` (facts, positions, programme list, method,
  booking rules, article index) — regenerated on every build so they can't drift.
- `feed.json` (JSON Feed 1.1) and `rss.xml` with `content:encoded` — the format most crawler-friendly for
  Perplexity/Gemini ingestion.
- Every claim on the pages is attached to a number and a method ("self-reported by the client's MIS", "n=84, 10 weeks"),
  which is what answer engines extract as citable. Long paragraphs are broken by `<h2>` question-shaped headings —
  the shape featured snippets and AI answers lift.
- `robots.txt` explicitly allows `GPTBot`, `OAI-SearchBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`
  while blocking nothing else — deliberate, because for a training business, being quotable is worth more than being private.

### Agents (the AGO part)
- Booking is deterministic and machine-readable: rules live in `content/settings.json → booking`, slots are
  generated from `openDays/slots/durationMin/bufferMin`, and taken slots come from one store — so an agent can compute
  availability from the same file rather than scraping a widget.
- Confirmation output is a downloadable `.ics` plus a `calendar.google.com/render` URL: an agent can finish the job
  without a login or a card.
- The diagnostic is stateless JSON arithmetic (documented scoring rule + `?r=` base64 state in the URL), so a result
  is portable, re-openable and shareable without an account.
- Content is plain `fetch()`-able JSON (`content/*.json`) — no API key, no HTML scraping needed.

## 2 · Launch checklist (do these in order, ~1 hour)

- [ ] `settings.json → seo.siteUrl` = real origin; `contact` = real numbers. Re-run `node scripts/build.js`.
- [ ] `docs/DATA-CHECKLIST.md` — verify every figure. **Delete any rating/review claim you cannot source**: invented
      `aggregateRating` in schema is a Google structured-data violation, not just a credibility risk.
- [ ] Replace gallery/blog placeholders with real photos (names: `g1.jpg`, `leadership.jpg`…).
- [ ] `node scripts/build.js` → commit → deploy (Netlify/Cloudflare Pages/Pages); confirm HTTPS + no `www` duplicates
      (force one origin, 301 the other).
- [ ] Google Search Console: **Domain** property, DNS TXT verify, submit `sitemap.xml`, then URL-inspect → Request
      indexing for: `/`, `/diagnostic.html`, `/courses.html`, `/blog.html` + top 3 articles.
- [ ] Bing Webmaster Tools (import from GSC) — cheaper than Google, still quoted by Copilot/ChatGPT.
- [ ] Google Business Profile "Corporate training company", Dhaka, exact name/phone/hours from `settings.json`,
      10 photos, website link, messaging on. This is the local pack + Maps ranking lever, and it feeds the Knowledge Panel.
- [ ] Same NAP (name/address/phone) on LinkedIn, Facebook page, Future Icon site footer → entity consolidation.
- [ ] LinkedIn: put `yousufefti.com` in the profile's website field and in his bio; each article's first line + link
      posted from the profile (this is his highest-authority backlink source, at 47.8k followers).
- [ ] Backlinks worth having (in order of value for a training business): client "our trainers" pages, ISTD / BOLD /
      FBHRO member listings, university alumni pages (Dhaka, Putra), event/speaker directories
      (speakin.co, India Speaker Bureau — he is already listed there), podcast show notes, news coverage of the Eid-shirt drive.
- [ ] After 2 weeks: check GSC → Pages → "Alternating page with a redirect" and "Crawled – not indexed" counts;
      fix thin pages by adding a `takeaways` box and one real photo, not by adding words.
- [ ] Every article: internal link to `/diagnostic.html` and one to a programme (`courseId`); keep outbound links to ≤ 2 and only to primary sources.

## 3 · What to measure (it's already instrumented)

Open `/?debug=1` (or admin → Overview). Events: `cue_*` per section, `q_1..10_<dimension>`, `diag_complete {score}`,
`lead`, `slot_pick`, `appointment`, `download_*`, `theme_*`, `lang_*`, `gallery_open`, `enrol_click`, `progress`.

Targets for a personal-brand training site:

| Metric | Baseline expectation | What to do if missed |
|---|---|---|
| Home → diagnostic CTR | 12%+ | raise the diagnostic's position; make the hero CTA name the outcome, not the tool |
| Diagnostic start → finish | 60%+ | drop `questionCount` to 8 in the admin; shorten option text |
| Finish → contact given | 45%+ | move the capture above the fixes; add "report to WhatsApp" as default |
| Contact → appointment booked | 20%+ | shorten `advanceDays`, widen slots, add a fee line that removes the fear |
| GSC: pages indexed | all 7 + articles within 3 weeks | check `sitemap.xml` origin, internal links, `noindex` leftovers |
| Branded SERP | Knowledge Panel + sitelinks | NAP consistency + sameAs in schema + GBP |
