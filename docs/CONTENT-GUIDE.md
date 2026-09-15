# Content guide — how this site gets updated

Everything the site shows comes from **four JSON files** plus the theme/language blocks in each page. No CMS, no
database, no lock-in: `git` is the CMS.

## 1 · `content/settings.json` — the single source of truth

| Block | Drives | Notes |
|---|---|---|
| `seo.siteUrl` | sitemap, feeds, canonicals, OG URLs, llms.txt | **must** be the real origin before launch, then re-run `node scripts/build.js` |
| `brand` | header/footer strings, mono names, tagline | `nameBn` / `roleBn` used in Bangla mode |
| `contact` | every WhatsApp / tel / mailto / LinkedIn link (`data-wa`, `data-tel`, `data-mail`, `data-lin`, `data-fb`) | change once here, not per page |
| `proof` | counters, llms.txt facts | these are the claims you must be able to defend |
| `booking` | slot generator: `openDays` (0=Sun), `slots` windows, `durationMin`, `bufferMin`, `advanceDays`, `maxPerDay`, `platform`, `meetingUrl`, `feeEn` | public calendar = these rules; the admin board writes the same object |
| `diagnostic` | question count per session, dimension names, band labels + advice | bands are the verdicts a visitor reads |
| `admin.endpoint` | where leads/appointments/events are POSTed | blank = local only |
| `admin.passphraseSha256` | `admin.html` login | regenerate in Security board |
| `theme.default` / `lang.default` | first-visit mood and language | visitor's choice wins after that |
| `cta`, `leadMagnet` | buttons and the free checklist copy | |

## 2 · `content/courses.json` — programmes (cards, prices, seats, dashboard)

```json
{ "id": "selling-skills", "featured": true, "badge": "Best seller",
  "titleEn": "…", "titleBn": "…", "summaryEn": "…", "summaryBn": "…",
  "level": "All levels", "format": "In-house · 2 days", "duration": "2 days",
  "price": 280000, "priceNote": "per cohort", "nextCohort": "2026-10-05", "seatsLeft": 14,
  "enrolled": 5210, "rating": 4.8, "tags": ["selling","field"],
  "modules": [{ "en": "…", "bn": "…" }], "outcomes": ["…"] }
```

- `seatsLeft` renders the seat bar (`40 - seatsLeft` over 40) and the "seats left in next cohort" line; keep it honest, it updates live for visitors.
- `nextCohort` must be `YYYY-MM-DD` — `build.js` fails the build otherwise, because it feeds schema `startDate`.
- `price` is BDT per corporate cohort unless `priceNote` says per participant. `build.js` maps `price` into `Course → offers` schema, which is what Google uses for rich results.
- Delete a course and the dashboard, teaser and schema all follow automatically.

## 3 · `content/posts.json` — articles

Fields: `slug, date, updated, read, author, tags[], titleEn, titleBn, excerptEn, excerptBn, cover, courseId, takeaways[], bodyEn, bodyBn`.
Body is HTML (`<p> <h2> <h3> <strong> <em> <ul> <blockquote>`) — deliberately not Markdown, so nothing renders wrong in the admin textarea.

- URL is `article.html?slug=<slug>`; the slug never changes, so it is safe to link from LinkedIn.
- Missing `bodyBn` is not an error: the article falls back to English and the index page counts how many are awaiting translation.
- `takeaways` become the boxed "in three lines" panel — the block most often quoted by AI answers, so write it first.
- New article → add to `posts.json` (or the Admin → Articles board) → `node scripts/build.js` → commit. Sitemap, RSS,
  JSON Feed, `llms.txt` and `llms-full.txt` all update in that one command.

## 4 · `assets/img/gallery/` — photos

`node scripts/build.js` rebuilds `content/gallery.json` from that folder: filename stem = identity, so captions
survive re-imports and `g3.jpg` replaces `g3.svg` without touching any other file. Any of `.jpg .jpeg .png .webp .avif .svg`.

Suggested set (in priority order, because this is what a buyer of training actually looks for):
1 a wide shot of a full room mid-exercise · 2 you with a flipchart of *their* numbers · 3 roleplay pair with a manager watching ·
4 the certificate/graduation moment · 5 the ISTD award · 6 an audience listening, no stage visible (proves it's not theatre) ·
7–10 community work, because Bangladesh buys from people, not logos.

Alt text comes from the caption, so captions double as image SEO: write `What happened + for whom + where`
("3-day sales leadership cohort for Incepta senior area managers, Dhaka HQ"), not "IMG_2841".

## 5 · Translating without breaking the layout

Inline pattern in HTML:

```html
<p><span class="en">Bring your coverage sheet.</span>
     <span class="bn">কভারেজ শিট নিয়ে আসুন।</span></p>
```
Inline-only pieces use `<span class="bn i">`. Rules of thumb: keep the Bangla string within ±30% of the English
length so the mask reveals don't jump; numbers stay Western digits in Bangla UI labels (`৪ মিনিট` for prose,
`GMT+6` for technical), and never translate programme names people search for in English (`Train-the-Trainer (ToT)`).

## 6 · Syncing to Google Sheets / email (optional, 15 minutes)

Admin → Security → paste an Apps Script Web App URL as `admin.endpoint`. Minimal script:

```javascript
function doPost(e){
  var o = JSON.parse(e.postData.contents);                    // {kind, at, data}
  var sh = SpreadsheetApp.getActive().getSheetByName(o.kind) ||
           SpreadsheetApp.getActive().insertSheet(o.kind);
  sh.appendRow([o.at, JSON.stringify(o.data)]);
  if(o.kind === "leads" || o.kind === "appt")
    MailApp.sendEmail("training@futureiconbd.com",
      "New " + o.kind + " — index " + (o.data.score || "-"), o.data.report || JSON.stringify(o.data));
  return ContentService.createTextOutput(JSON.stringify({ok:true}));
}
```
Deploy → Web app → execute as *me*, access *anyone*. That single endpoint receives leads, appointments, funnel
events and admin saves. Until you add it, everything stays in the visitor's browser — which is a selling point,
not a gap.

## 7 · Local editing loop

```bash
node tools/serve.js          # :8000 — boards can PUT to /__save and write real files
# edit → save (writes content/*.json) → reload
node scripts/build.js        # regenerate sitemap / feeds / llms.txt / schema
git add -A && git commit -m "content: Oct cohort dates" && git push
```

`tools/serve.js` refuses any path that is not `content/<name>.json`, ignores broken JSON before writing, and the
save endpoint is a no-op on a static host (there is no write access) — so nothing about it reaches production.
