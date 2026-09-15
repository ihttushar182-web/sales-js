# DATA-CHECKLIST — read before you send a single DM

Everything on this site that looks like a claim is **demo data** placed so the structure, rhythm and proof
*shape* are visible. Publishing it unchanged is the fastest way to lose the trust of a person who sells trust
for a living. Replace, then ship.

## A. Identity & contact (30 seconds, one file)

`assets/site.config.js` — the only file you need for links:

| Key | Currently | Must become |
|---|---|---|
| `email` | `ilias@yourdomain.com` | your real address |
| `whatsapp` | `8801XXXXXXXXX` | digits only, with country code |
| `booking` | `https://cal.com/YOUR_HANDLE/brand-audit` | your real scheduler URL |
| `linkedin` | `https://www.linkedin.com/in/YOUR_HANDLE` | your profile |
| `lead.name` | `Yousuf Efti` | `""` unless you want a default prospect |
| `formEndpoint` | `""` | Formspree / Apps Script URL (or leave blank) |
| `trackEndpoint` | `""` | optional analytics collector |

Also edit: `canonical` + `og:url` in all three HTML files (`https://yourdomain.com/` → your domain), and
`sitemap.xml` / `robots.txt`.

## B. Numbers you must be able to defend on a call

| Where | Placeholder | Rule |
|---|---|---|
| `index.html` §01 metrics | 6 yrs · 38 brands · +41% median lift · ৳2.8 Cr attributed | keep only what you can evidence |
| Hero "live funnel" card | 4,120 / 2,554 / 589 / 52 / 18 | label it *illustrative* (done) or replace with your real client data |
| Cases (3 cards) | 14→61, 18%→44%, ৳85k→৳220k, 1.6%→3.9%, 1.7×→3.4×, 9%→34%, +85% | need a named client's written OK, even if anonymised |
| Case #3 (individual expert brand) | reads close to a real prospect's situation | rewrite or get permission — never imply you worked with someone you didn't |
| `audit.html` header | "1,340 audits run" | your real number or delete the line |
| `pitch.html` burst + quotes | 6 / 38 / +41% | same as above |
| JSON-LD `aggregateRating` | 4.9 · 27 reviews | **delete unless you literally have 27 public reviews** — fake structured data is a Google policy violation |
| Prices | ৳75,000 / ৳210,000 / ৳560,000 | set your actual rates, then the `s` (strikethrough) anchor prices |
| Guarantee | "beat baseline in 45 days or the next build is free" | keep only a clause you will honour in writing |
| "2 clients per quarter · 1 open" | scarcity line | only if capacity is genuinely that tight |
| Footer perf line | "23 KB · 5 requests" | re-measure if you add assets |

## C. Claims to soften vs. state

- **State** (verifiable, structural): load weight, no framework, tracking installed on every stage, one-way page,
  fixed scope, milestone-linked deposit, the guarantee.
- **Soften** (needs a range + a source): anything with `%`, `×`, or `৳` about *results*. Say "median across N
  engagements, measured X–Y", and keep the footnote already present in §01.
- **Never**: client names without permission, screenshots of their dashboards, "top 1%" self-labels, or a
  testimonial you wrote yourself.

## D. Testimonials

The quotes in the cases are placeholders. To get real ones in 7 days, send each past client this — one line, no ask:
> "Which of these is truest for you after working with me: (a) enquiries rose, (b) you closed at a higher price,
> (c) the follow-up stopped leaking, (d) your team finally had a written process? Reply with the letter + one
> number if you have one and I'll draft 2 lines for you to approve."

Approve-before-publish protects you and makes saying yes trivial for them.

## E. Pre-flight

- [ ] `git grep -n "YOUR_HANDLE\|yourdomain\|8801XXXXXXXXX\|ilias@yourdomain"` returns nothing
- [ ] `git grep -n "demo\|placeholder"` reviewed — either removed or honestly labelled
- [ ] `?debug=1` on the deployed URL: page_view → cue_proof → cue_offers → opt → step_4 → audit_complete all fire
- [ ] Audit form delivers a lead into your inbox (test with your own number)
- [ ] Mobile: `pitch.html` reads in 30 s, one thumb-reachable button, no horizontal scroll
- [ ] LinkedIn/WhatsApp unfurl shows the `og-cover.jpg` card and the right title
- [ ] Lighthouse (mobile): Performance ≥ 95, Accessibility ≥ 95, Best practices 100, SEO 100
- [ ] Print the audit result page → the summary arrives legibly (some buyers print and pass it to a partner)

---

# Part B — the Yousuf Efti site: what is real, what is demo

The site you are reading is a **working sample built before any interview**, so some figures were modelled, not
collected. This table is the honest split. Anything marked **demo** must be replaced with a real number or the claim
must be deleted — publishing an invented result is the one thing that can turn this asset into a liability.

## Real (taken from his public profile / banner / verified pages)
| Claim | Source | Where it appears |
|---|---|---|
| 1,350+ trainings & sessions; 5 countries (BDG, IND, NEP, THA, MYS, SIN) | his LinkedIn banner | index stats, `llms.txt`, Person schema `description` |
| 1,305+ sessions | Taponel Ltd bio | footnote on index |
| 47,830 followers, 500+ connections | LinkedIn header | outreach page only (not his site) |
| Founder & CEO Future Icon™; Sales Leadership Trainer at 10 Minute School; Chairperson T&D at BOLD; Course Author at Thriving Skills; Consultant at FutureLeaders™; MD at Digital Fast Aid Hospital; ex-Area Manager / Professional Medical Rep at Opsonin Pharma; ex-Manager CSR at McDonald's | LinkedIn experience | Person schema `jobTitle`, `worksFor`, `alumniOf` |
| PhD in Management (Universiti Putra Malaysia); PGD-MPD (Malaysia); MBA Marketing (University of Dhaka); BSc Pharmacy (DU); Post Graduate Certificate in European Business (UK); IFC-LPI Certified (Netherlands); Certified Management Consultant (BCSIR); GGAF | LinkedIn + Taponel bio | hero, `knowsAbout` |
| ISTI International Best Trainer Award — South Asia, 2022; Best Trainer Award, Transcom Foods | LinkedIn honour | `award` in schema, trust section |
| Opsonin Pharma 15 years | Grow Learn Connect bio | trust copy |
| +880 1754 325325 · training@futureiconbd.com · www.futureiconbd.com | banner contact strip | `settings.json → contact` everywhere |
| +880 1776 888555 (WhatsApp) | Taponel Ltd listing | **two phone numbers exist in public record — confirm which is the public lead line before publishing** |
| Runs 5 organisations; 15+ years in pharma sales; community work (Eid shirts, winter blankets) | growlearnconnect.org | `llms.txt`, about copy |

## Demo — replace or delete before publishing
| Where | Number | Why it is unsafe as-is |
|---|---|---|
| index stats | **24,500 professionals trained** | modelled from 1,350 sessions × ~18 pax. Use his own count or say "across 1,350+ sessions" |
| index stats | **47,830 followers** | true today, but it is a vanity metric on *his* site; keep it on your outreach page instead |
| index results band | **4,200+ salespeople** | modelled; not sourced |
| hero card | **38 enterprise clients · 4 years avg tenure** | invented |
| lead magnet | **900 L&D managers on the list** | invented |
| courses | **all 8 prices (৳6,500 – ৳750,000), seatsLeft, enrolled, rating 4.8–4.9** | invented market-rate estimates — and `rating`/`enrolled` feed `Course` schema: **delete `aggregateRating` unless he can show the source reviews** |
| courses | dates `2026-08 → 2026-12` | placeholders; swap for the real calendar |
| index FAQ | **৳9.6 Cr / +41% / 72% completion / 27% faster ramp-up** | invented benchmark outcomes — replace with a named client's approved figure or cut the sentence |
| diagnostic copy | "12-question index", "8 minutes", "1,500+ completed" | the tool is **10** questions in 4 minutes; `1,500+` is invented — change to "used in classrooms" or delete |
| articles | all 5 bodies, `2017` article from the earlier build, and the benchmark tables | the funnel benchmarks are published industry ranges (cited in README) but **his own case numbers are composites**; label them "illustrative" until he gives a client-approved figure |
| gallery | captions `g1…g10`, "Cohort 12", "Dhaka" | placeholders — rewritten when real photos arrive |

## To ask him for (10 minutes, changes everything)
1. One approved client result: sector, cohort size, metric moved, % move, period, and whether the client is named.
2. Real programme prices + the next 3 cohort dates.
3. Which phone is the public lead line (+880 1754 325325 vs +880 1776 888555).
4. Review source (Google GBP / ThriveSarts / internal survey) → then and only then keep `rating` in JSON.
5. 10 photos (see `docs/CONTENT-GUIDE.md` §4 list).
6. Does he want a paid product on the site (webinar → cohort funnel) or corporate-only (diagnostic → in-house proposal)? The site works for both; the hero should say which one first.
