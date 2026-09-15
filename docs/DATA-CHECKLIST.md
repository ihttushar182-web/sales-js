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
