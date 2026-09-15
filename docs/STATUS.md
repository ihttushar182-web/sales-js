# Status — what is done, what needs you

Last update: Phase 2 complete and pushed (`arena/01a0a2c7-sales-js`).

## Done and verified
| Area | State |
|---|---|
| 7 public pages (home, diagnostic, programmes, articles, article, gallery, booking) | written, bilingual EN/বাংলা, 3 moods, `node --check` clean |
| Sales Credibility Index™ | 10 questions drawn from a 40-question bank, **a different set every visit**, 6 dimensions, gauge + fix list, report to email/WhatsApp/`.txt`/shareable link. Scoring verified: perfect run = 100, half = 50 |
| Lead magnet | 10-point checklist downloads instantly, is stored as a lead, validation fixed (email or 9+ digit number) |
| Programmes + dashboard | 8 programmes from `content/courses.json`; dashboard with progress rings, action plan, certificate state |
| Admin (`admin.html`) | passphrase gate, 10 boards, live 14-point SEO/AEO audit, CSV/JSON export, writes back to `content/*.json` when run through `node tools/serve.js` |
| SEO / AEO / AGo | JSON-LD `@graph` injected into all 7 pages by `scripts/build.js`, sitemap, RSS + JSON Feed, `llms.txt` + `llms-full.txt`, hreflang, robots allowing the AI crawlers and blocking `/admin.html` + `?to=` |
| Motion | CSS-3D stat cube, pointer tilt, funnel pyramid, mask reveals, counters, marquee, gauge arc, lightbox, mobile dock — all disabled under `prefers-reduced-motion` |
| PWA | manifest + 3 generated PNG icons + service worker (network-first for JSON so his edits show instantly) |
| QA pass | Bangla digit truncations fixed, CJK contamination 0 hits, no stale asset paths, all 23 URLs return 200 through `tools/serve.js`, `PUT /__save` + `POST /__lead` round-trips verified |
| Docs | `README.md`, `docs/CONTENT-GUIDE.md`, `docs/SEO-AIO-AGO.md`, `docs/DATA-CHECKLIST.md` (Part B = real vs demo), `docs/OUTREACH-efti.md` (Part B = the DM to send him) |

Measured weight: index 139 KB raw / **41.2 KB gz over 7 requests**, inner pages 25–32 KB gz / 5 requests, no third-party origin.

## Needs your decision (blocks "send it to Efti")
1. **Where it lives** — a real domain (or Netlify/GitHub Pages subdomain) so the link is HTTPS and shareable. Then set
   `content/settings.json → seo.siteUrl` and re-run `node scripts/build.js`.
2. **Photos** — nothing in this build uses his face (only your own uploaded assets). If you want real photos you must
   have the rights to them; otherwise keep the drawn placeholders, which are honest for a sample.
3. **Real prices + cohort dates** — every price/date/rating in `content/courses.json` is a market estimate, not his.
   Until he confirms, the ratings must not be published (fake `aggregateRating` = Google structured-data violation).
4. **Where leads go** — blank `admin.endpoint` = everything stays in the visitor's browser. A 15-minute Google Apps
   Script (snippet in `docs/CONTENT-GUIDE.md` §6) makes email, Sheets and admin saves work for real.

## Also worth doing when you have a browser in front of you
- Click through: diagnostic (answer 10 → give email → report), booking (pick a slot → `.ics`), admin login
  (`efti2026-change-me`) → edit one article → reload the public page. I verified every endpoint and selector from the
  command line, but a human pass catches the taste-level things.
- Run `node scripts/build.js` after any content change (it regenerates sitemap, feeds, `llms*.txt`, schema).
