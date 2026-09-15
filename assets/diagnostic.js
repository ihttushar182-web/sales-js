/* ==========================================================================
   diagnostic.js — Sales Credibility Index™
   40-question bank → 10 fresh questions per visit → scored 0-100 → report
   delivered by email / WhatsApp / download, and stored in the admin board.
   ========================================================================== */
(function () {
  "use strict";
  var FI = window.FI, $ = FI.$, $$ = FI.$$, esc = FI.esc;
  var S = { market: [], offer: [], pipeline: [], trust: [], conversion: [], retention: [] };

  /* scale = self-rating on a shared ladder · choice = bespoke options */
  var BANK = [
    { d: "market", t: "scale", en: "We can name our three most profitable customer segments without looking at a file.", bn: "কাগজপত্র না দেখেই আমরা আমাদের তিনটি লাভজনক কাস্টমার সেগমেন্ট বলে দিতে পারি।" },
    { d: "market", t: "scale", en: "Our positioning states who we are NOT for.", bn: "আমাদের পজিশনিং স্পষ্ট করে আমরা কার জন্য নই।" },
    { d: "market", t: "scale", en: "We know the price band our competitors close in, by SKU.", bn: "প্রতিতিযোগী কোন এসকেইউতে কোন দামে ক্লোজ করে তা আমরা জানি।" },
    { d: "market", t: "scale", en: "Marketing and sales agree on what a qualified lead is.", bn: "যোগ্য লিডের সংজ্ঞা নিয়ে মার্কেটিং ও সেলস একমত।" },
    { d: "market", t: "choice", en: "When a prospect asks 'why you rather than the other guy?', the answer is…", bn: "কাস্টমার জিজ্ঞেস করলে 'আপনি কেন, আরে কেন নয়?' — উত্তরটা…",
      o: [{ en: "A written, rehearsed line every rep can deliver", bn: "লিখিত, অনুশীলিত এক লাইন যা সব রিপ বলতে পারে", v: 3 },
          { en: "Something senior people know but reps cannot repeat", bn: "বড়রা জানে, রিপ্রেজেনটেটিভরা বলতে পারে না", v: 2 },
          { en: "Our quality / our price / our service (as everyone says)", bn: "আমাদের মান/দাম/সার্ভিস (যা সবাই বলে)", v: 1 },
          { en: "Nobody has ever written it down", bn: "কেউ কখনো লেখে নি", v: 0 }] },
    { d: "market", t: "scale", en: "We track share-of-shelf or share-of-mind, not just sales.", bn: "আমরা শুধু বিক্রি নয়, শেলফ শেয়ার/মাইন্ড শেয়ারও মাপি।" },
    { d: "market", t: "scale", en: "Win/loss reasons are recorded for every lost deal above a set value.", bn: "নির্দিষ্ট মূল্যের ঊর্ধ্বে হেরে যাওয়া প্রতিটি ডিলের কারণ লেখা থাকে।" },

    { d: "offer", t: "scale", en: "Our offers are priced by outcome, not by our availability.", bn: "আমাদের অফার আমার সময় অনুযায়ী নয়, ফলাফল অনুযায়ী দামকৃত।" },
    { d: "offer", t: "scale", en: "A prospect can tell in 30 seconds what they get, for how long, for what money.", bn: "৩০ সেকেন্ডে বোঝা যায় কী পাবেন, কতদিন, কত টাকায়।" },
    { d: "offer", t: "choice", en: "How many priced options does a client see before talking to you?", bn: "কথোপকথনের আগে ক্লায়েন্ট কয়টি নির্ধারিত মূল্যের অপশন দেখে?",
      o: [{ en: "Three: entry, core, premium", bn: "তিনটি: এন্ট্রি, কর, প্রিমিয়াম", v: 3 }, { en: "Two", bn: "দুইটি", v: 2 },
          { en: "One, negotiated on the call", bn: "একটি, কলে দরদাম", v: 1 }, { en: "None until I quote", bn: "কোট করার আগে নেই", v: 0 }] },
    { d: "offer", t: "scale", en: "We have a productised, repeatable version of our best service.", bn: "আমাদের সেরা সেবাটির একটি পুনরাবৃত্তিযোগ্য প্রোডাক্টাইজড সংস্করণ আছে।" },
    { d: "offer", t: "scale", en: "Guarantee, terms and what-is-excluded are written before the first call.", bn: "প্রথম কলের আগেই গ্যারান্টি, শর্ত ও বাদ যাচ্ছে তা লেখা থাকে।" },
    { d: "offer", t: "scale", en: "Raising prices is planned, not improvised under pressure.", bn: "দাম বাড়ানো পরিকল্পিত, চাপে হঠাৎ নয়।" },
    { d: "offer", t: "scale", en: "Every offer has a named next step within 72 hours.", bn: "প্রতিটি অফারের ৭২ ঘণ্টার মধ্যে একটি নির্দিষ্ট পরবর্তী ধাপ আছে।" },

    { d: "pipeline", t: "scale", en: "We know this week's lead count, not last quarter's average.", bn: "গত প্রান্তিকের গড় নয় — এই সপ্তাহের লিড সংখ্যা আমরা জানি।" },
    { d: "pipeline", t: "choice", en: "How long from first enquiry to first reply?", bn: "প্রথম এনকোয়ারি থেকে প্রথম উত্তর দিতে কেটে যায়—",
      o: [{ en: "Under 15 minutes in working hours", bn: "কাজের সময়ে ১৫ মিনিটের কম", v: 3 }, { en: "Same day", bn: "সেই দিনে", v: 2 },
          { en: "1–3 days", bn: "১–৩ দিন", v: 1 }, { en: "Depends who sees it first", bn: "কে আগে দেখে তার উপর", v: 0 }] },
    { d: "pipeline", t: "scale", en: "Every enquiry has an owner and a due date.", bn: "প্রতিটি এনকোয়ারির একজন মালিক ও একটি নির্ধারিত তারিখ আছে।" },
    { d: "pipeline", t: "scale", en: "We have a written follow-up sequence for the 24h / day-3 / day-7 window.", bn: "২৪ ঘণ্টা / দিন-৩ / দিন-৭ এর জন্য লিখিত ফলো-আপ সিকোয়েন্স আছে।" },
    { d: "pipeline", t: "scale", en: "Leads older than 30 days are either closed or archived, not parked.", bn: "৩০ দিনের পুরোনো লিড বন্ধ বা আর্কাইভ হয়, ঝুলিয়ে রাখা হয় না।" },
    { d: "pipeline", t: "scale", en: "Pipeline coverage is at least 3× the quarterly target.", bn: "পাইপলাইন কভারেজ প্রান্তিক টার্গেটের অন্তত ৩ গুণ।" },
    { d: "pipeline", t: "scale", en: "Nobody has to ask 'what happened to that client?' in a review meeting.", bn: "রিভিউ মিটিংয়ে কেউ জিজ্ঞেস করে না 'সেই ক্লায়েন্টের কী হলো?'" },

    { d: "trust", t: "scale", en: "Our best proof sits in the first screen a stranger sees.", bn: "অচেনা মানুষ প্রথম যা দেখে, সেখানেই আমাদের সেরা প্রমাণ থাকে।" },
    { d: "trust", t: "choice", en: "What does a stranger learn first about you?", bn: "এজন অচেনা মানুষ আপনার সম্পর্কে প্রথমে কী জানে?",
      o: [{ en: "The outcome you deliver, with numbers", bn: "আপনি যে ফল দেন, সংখ্যাসহ", v: 3 }, { en: "Who you have worked with", bn: "আপনি কার কার সাথে কাজ করেছেন", v: 2 },
          { en: "Your qualifications and history", bn: "আপনার যোগ্যতা ও ইতিহাস", v: 1 }, { en: "Nothing — a logo and a slogan", bn: "কিছুই না — শুধু লোগো ও স্লোগান", v: 0 }] },
    { d: "trust", t: "scale", en: "We have 3+ named, quotable client results per offer.", bn: "প্রতি অফারে ৩+ নামসহ, উদ্ধৃতিযোগ্য ক্লায়েন্ট ফলাফল আছে।" },
    { d: "trust", t: "scale", en: "Cases mention the objection the client had before buying.", bn: "কেসে ক্লায়েন্টের আগেভাগের সংশয়ের কথাও থাকে।" },
    { d: "trust", t: "scale", en: "Our response promise is met and visible in a report.", bn: "আমাদের সাড়ার প্রতিশ্রুতি মেটানো হয় ও রিপোর্টে দৃশ্যমান।" },
    { d: "trust", t: "scale", en: "Third parties (not us) can vouch for us in writing.", bn: "আমরা ছাড়া অন্যেরা লিখে আমাদের সাক্ষ্য দিতে পারেন।" },
    { d: "trust", t: "scale", en: "We publish prices or price ranges somewhere a buyer can find them.", bn: "ক্রেতা খুঁজে পায় এমন জায়গায় দাম বা দামের পরিসর প্রকাশ করি।" },

    { d: "conversion", t: "scale", en: "We measure visitor → enquiry and enquiry → paid separately.", bn: "ভিজিটর→এনকোয়ারি ও এনকোয়ারি→পেমেন্ট আলাদাভাবে মাপি।" },
    { d: "conversion", t: "choice", en: "Of ten qualified enquiries, how many become paid clients?", bn: "দশটি যোগ্য এনকোয়ারির কয়টি পেমেন্টে রূপ নেয়?",
      o: [{ en: "Four or more", bn: "চার বা তার বেশি", v: 3 }, { en: "Two to three", bn: "দুই-তিন", v: 2 },
          { en: "One", bn: "এক", v: 1 }, { en: "We don't count it", bn: "গনি না", v: 0 }] },
    { d: "conversion", t: "scale", en: "Every outbound message lands on a page with one action.", bn: "প্রতিটি আউটবাউন্ড বার্তা একটিমাত্র কাজের পেজে নামে।" },
    { d: "conversion", t: "scale", en: "We have tested at least two versions of our main page this year.", bn: "এ বছর প্রধান পাতার অন্তত দুটি সংস্করণ পরীক্ষা করেছি।" },
    { d: "conversion", t: "scale", en: "The ask (call, deposit, trial) is stated in the first 20 seconds of any pitch.", bn: "যেকোনো প্রেজেন্টেশনের প্রথম ২০ সেকেন্ডে অনুরোধটি স্পষ্ট থাকে।" },
    { d: "conversion", t: "scale", en: "Objections are answered on the page, before the call.", bn: "ওবজেকশনের উত্তর কলের আগে পাতাতেই দেওয়া থাকে।" },
    { d: "conversion", t: "scale", en: "Payments can be taken on the spot (mobile banking / card / link).", bn: "সেই মুহূর্তে পেমেন্ট নেওয়ার ব্যবস্থা আছে (বিকাশ/কার্ড/লিংক)।" },

    { d: "retention", t: "scale", en: "We know our repeat-purchase or renewal rate by number.", bn: "রিপিট ক্রয়/রি renewal হার আমরা সংখ্যায় জানি।" },
    { d: "retention", t: "choice", en: "When does the follow-up after a sale happen?", bn: "বিক্রির পর ফলো-আপ কখন হয়?",
      o: [{ en: "Scheduled: day 7, day 30, day 90", bn: "নির্ধারিত: দিন ৭, ০, ৯", v: 3 }, { en: "When someone remembers", bn: "কেউ মনে করলে", v: 1 },
          { en: "Only when they complain", bn: "অভিযোগ এলেই", v: 0 }, { en: "Never", bn: "কখনো না", v: 0 }] },
    { d: "retention", t: "scale", en: "We ask for a referral or review at a defined moment.", bn: "একটি নির্দিষ্ট মুহূর্তে আমরা রেফারেল/রিভিউ চাই।" },
    { d: "retention", t: "scale", en: "Top 20% clients get a named relationship owner.", bn: "সেরা ২০% ক্লায়েন্টের একজন নির্দিষ্ট দায়িত্বপ্রাপ্ত থাকেন।" },
    { d: "retention", t: "scale", en: "Churn reasons are written down and reviewed quarterly.", bn: "ক্লায়েন্ট হারানোর কারণ লেখা হয় ও প্রান্তিকে পর্যালোচনা হয়।" },
    { d: "retention", t: "scale", en: "We have an upsell path that a rep can explain in one breath.", bn: "আপসেলের পথ এমন যে এক শ্বাসে রিপ বুঝিয়ে বলতে পারে।" },
    { d: "retention", t: "scale", en: "Client data lives in a system, not only in someone's phone.", bn: "ক্লায়েন্ট ডেটা সিস্টেমে থাকে, শুধু কারও ফোনে নয়।" }
  ];

  var SCALE = {
    en: ["Not at all / never", "Sometimes, informal", "Usually written down", "Yes, and we review it", "Embedded — everyone does it"],
    bn: ["একদম না / কখনো না", "মাঝে মাঝে, অনানুষ্ঠানিক", "সাধারণত লিখিত থাকে", "হ্যাঁ, আমরা পর্যালোচনাও করি", "প্রতিষ্ঠিত — সবাই মানে"]
  };
  var DIM = {
    market: { en: "Market & position", bn: "বাজার ও পজিশন" }, offer: { en: "Offer & price", bn: "অফার ও মূল্য" },
    pipeline: { en: "Pipeline hygiene", bn: "পাইপলাইন শৃঙ্খলা" }, trust: { en: "Proof & trust", bn: "প্রমাণ ও বিশ্বাস" },
    conversion: { en: "Conversion mechanics", bn: "কনভার্শন কৌশল" }, retention: { en: "Retention & referral", bn: "ধরে রাখা ও রেফারেল" }
  };
  var FIX = {
    market: [[ "Write the 'why you' line, then rehearse it", "One sentence, 12 words, said identically by every person who takes a call. If it cannot be memorised it is a paragraph, not a position." ],
             [ "Pick the segment you will refuse", "Naming who you are not for is the cheapest credibility you can buy — and it shortens every qualification call." ]],
    offer: [[ "Publish three priced rungs", "Entry, core, premium. A buyer who sees one number argues about that number; one who sees three chooses a size." ],
            [ "Attach an outcome, not an input", "Rewrite each offer line as 'by day X you will have Y'. Deliverable lists read like invoices; outcomes read like decisions." ]],
    pipeline: [[ "Kill the 15-minute gap", "Speed is the single cheapest conversion lever in a service business: same-day replies convert several times higher than week-two replies." ],
                [ "Give every lead an owner and a date", "Unowned pipeline is not a pipeline, it is a wish list with timestamps. Two fields, one dashboard." ]],
    trust: [[ "Move proof above the biography", "Lead with the outcome and a number; let the CV answer the third question, not the first." ],
            [ "Publish three objection-shaped cases", "Situation, doubt, decision, result — with the objection the client had. Doubt acknowledged is doubt neutralised." ]],
    conversion: [[ "One page, one action, per message", "Every DM and post should land on a page with a single exit. That change moves reply→call more than any redesign." ],
                  [ "Instrument five numbers this week", "Visitor → enquiry, enquiry → call, call → paid, average value, response time. Whatever is not measured stays a story." ]],
    retention: [[ "Schedule day 7 / 30 / 90 now", "Three messages, written once, sent automatically by whoever owns the account. This is where renewal rates are made." ],
                 [ "Ask at the peak, not at the end", "Referrals requested within a week of a visible win convert far better than end-of-project asks." ]]
  };
  var BENCH = "Published B2B benchmark: a landing page converts 2–5% of visitors into a lead (median ~6.6% for dedicated landing pages); lead→MQL 31–41%; MQL→SQL 13–15%; opportunity→close 22–30%. Scores below 60 usually mean the leak is structural, not effort.";

  var q = [], idx = 0, answers = [], seed = 0;
  function shuffle(a, s) {
    for (var i = a.length - 1; i > 0; i--) { s = (s * 9301 + 49297) % 233280; var j = Math.floor(s / 233280 * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function build() {
    seed = FI.LS.get("fi_diag_seed", Math.floor(Math.random() * 99999)); FI.LS.set("fi_diag_seed", seed);
    var ov = FI.LS.get("fi_ov_diag", null), Dg = Object.assign({}, FI.S.diagnostic || {}, (ov && (ov.diag || (ov.bands || ov.questionCount ? ov : null))) || {});
    var n = Dg.questionCount || 10;
    var pool = [];
    Object.keys(S).forEach(function (d) { pool = pool.concat(BANK.filter(function (x) { return x.d === d; })); });
    shuffle(pool, seed);
    /* guarantee at least one question per dimension, then fill randomly */
    q = [];
    Object.keys(S).forEach(function (d) { var x = pool.filter(function (p) { return p.d === d; })[0]; if (x) q.push(x); });
    pool.forEach(function (x) { if (q.length < n && q.indexOf(x) < 0) q.push(x); });
    q = shuffle(q.slice(0, n), seed + 7);
    answers = new Array(q.length).fill(null);
  }
  function setSeed(n) { FI.LS.set("fi_diag_seed", n); build(); paint(); }

  /* ---------- render one question ---------- */
  function paint() {
    var host = $("#qcard"); if (!host) return;
    if (idx >= q.length) return result();
    var it = q[idx], bn = FI.lang() === "bn";
    var opts = it.t === "choice" ? it.o.slice() : SCALE[bn ? "bn" : "en"].map(function (t, i) { return { x: t, v: i }; });
    opts = shuffle(opts, seed + idx * 13);
    host.innerHTML = '<div class="top"><span class="qdim">' + esc(DIM[it.d][bn ? "bn" : "en"]) + "</span>" +
      '<span class="small num" style="margin-left:auto">' + (idx + 1) + " / " + q.length + "</span>" +
      '<button class="btn sm ghost" data-skip>Skip</button></div>' +
      '<div class="rail"><i style="width:' + (idx / q.length * 100) + '%"></i></div>' +
      '<div class="qbody"><p class="qq">' + esc(bn ? it.bn : it.en) + "</p>" +
      '<p class="qctx">' + (bn ? "সবচেয়ে সৎ উত্তরটিই সবচেয়ে দরকারি।" : "Answer the true one, not the impressive one.") + "</p>" +
      '<div class="opts">' + opts.map(function (o, i) {
        return '<button class="opt" data-v="' + o.v + '"><span class="k">' + (i + 1) + "</span><b>" +
          esc(o[bn ? "bn" : "en"] || o.x) + '</b><span class="v">' + (o.v < 0 ? "" : ["0", "+1", "+2", "+3"][o.v]) + "</span></button>";
      }).join("") + "</div></div>" +
      '<div class="qfoot"><span class="small">Keys 1–4 · ' + (bn ? "স্কোর তাৎক্ষণিক" : "score is instant") + "</span>" +
      '<span class="row">' + (idx ? '<button class="btn sm ghost" data-back>' + (bn ? "পেছনে" : "Back") + "</button>" : "") + "</span></div>";
    FI.track("q_" + (idx + 1) + "_" + it.d);
    $$("[data-v]", host).forEach(function (b) { b.addEventListener("click", function () { pick(+b.dataset.v, b); }); });
    var sk = $("[data-skip]", host); if (sk) sk.addEventListener("click", function () { answers[idx] = -1; idx++; paint(); });
    var bk = $("[data-back]", host); if (bk) bk.addEventListener("click", function () { idx--; paint(); });
    $$(".opt", host).forEach(function (o) { if (answers[idx] === +o.dataset.v) o.classList.add("picked"); });
  }
  function pick(v, el) {
    answers[idx] = v;
    $$(".opt").forEach(function (o) { o.classList.remove("picked"); }); el.classList.add("picked");
    var rail = $(".rail>i"); if (rail) rail.style.width = ((idx + 1) / q.length * 100) + "%";
    setTimeout(function () { idx++; paint(); }, 230);
  }
  addEventListener("keydown", function (e) {
    if (!$("#qcard") || $("#result").hidden === false) return;
    if (/^[1-5]$/.test(e.key)) { var b = $$(".opt")[+e.key - 1]; if (b) b.click(); }
  });

  /* ---------- scoring ---------- */
  function score() {
    var dims = {}, max = {};
    q.forEach(function (it, i) {
      var v = answers[i] == null ? 0 : Math.max(0, answers[i]);
      var top = it.t === "choice" ? Math.max.apply(null, it.o.map(function (o) { return o.v; })) : SCALE.en.length - 1;
      dims[it.d] = (dims[it.d] || 0) + Math.min(v, top); max[it.d] = (max[it.d] || 0) + top;
    });
    Object.keys(dims).forEach(function (k) { dims[k] = Math.round(dims[k] / (max[k] || 1) * 100); });
    var total = Math.round(Object.keys(dims).reduce(function (a, k) { return a + dims[k]; }, 0) / (Object.keys(dims).length || 1));
    var bands = D2().bands || [];
    var band = bands.filter(function (b) { return total >= b.min && total <= b.max; })[0] || { labelEn: "Unscored", adviceEn: "", labelBn: "অমাপা", adviceBn: "" };
    return { total: total, dims: dims, band: band };
  }

  /* ---------- result + report ---------- */
  var last = null;
  function D2() { var ov = FI.LS.get("fi_ov_diag", null); return Object.assign({}, FI.S.diagnostic || {}, (ov && (ov.diag || (ov.bands || ov.questionCount ? ov : null))) || {}); }
  function result() {
    var s = score(), bn = FI.lang() === "bn";
    last = s;
    var worst = Object.keys(s.dims).sort(function (a, b) { return s.dims[a] - s.dims[b]; });
    $("#qcard").closest(".diag").querySelector(".side").innerHTML =
      '<div class="gauge"><svg viewBox="0 0 200 200"><circle class="trk" cx="100" cy="100" r="84"></circle>' +
      '<circle class="arc" id="arc" cx="100" cy="100" r="84" transform="rotate(-90 100 100)"></circle></svg>' +
      '<span class="val"><b>' + s.total + "</b><br><span class='small'>/100 index</span></span></div>" +
      '<p class="center" style="font-family:var(--serif);font-size:1.3rem;margin-top:6px">' + esc(bn ? s.band.labelBn : s.band.labelEn) + "</p>" +
      '<p class="small center">' + esc(bn ? s.band.adviceBn || s.band.adviceEn : s.band.adviceEn) + "</p>" +
      '<div class="dims" style="margin-top:18px">' + Object.keys(s.dims).sort().map(function (k) {
        return '<div class="dim"><span>' + esc(DIM[k][bn ? "bn" : "en"]) + "</span><b class='num'>" + s.dims[k] + "</b>" +
          '<span class="bar"><i data-w="' + s.dims[k] + '"></i></span></div>';
      }).join("") + "</div>" +
      '<p class="small" style="margin-top:16px">' + BENCH + "</p>" +
      '<button class="btn sm ghost block" data-again style="margin-top:12px">' + (bn ? "আবার করুন (নতুন প্রশ্ন)" : "Run again with a fresh set") + "</button>";
    $$("[data-w]").forEach(function (i) { setTimeout(function () { i.style.width = i.dataset.w + "%"; }, 60); });
    var arc = $("#arc"); if (arc) { var C = 2 * Math.PI * 84; arc.setAttribute("stroke-dasharray", C); arc.style.strokeDashoffset = C * (1 - s.total / 100); }

    var fixes = worst.slice(0, 3).map(function (k) { return { d: k, v: s.dims[k], f: FIX[k][s.dims[k] < 34 ? 1 : 0] }; });
    $("#resultBody").innerHTML =
      '<h2>' + (bn ? "আপনার সেলস ক্রেডিবিলিটি রিপোর্ট" : "Your Sales Credibility Index report") + "</h2>" +
      '<p class="lead">' + (bn ? "স্কোর " + s.total + "/১০ · দুর্বলতম দুই-তিনটি জায়গা আগে ঠিক করুন — বাকিগুলো সেখান থেকেই ঠিক হবে।"
        : "Index " + s.total + "/100 · fix the two or three weakest dimensions first; the rest follow from there.") + "</p>" +
      "<ul class='rlist'>" + fixes.map(function (x, i) {
        return "<li><span class='n'>" + (i + 1) + "</span><div><b>" + esc(x.f[0]) + "</b><p>" + esc(x.f[1]) + "</p>" +
          "<p class='small'>" + esc(DIM[x.d][bn ? "bn" : "en"]) + " — " + x.v + "/100 · " +
          (i === 0 ? (bn ? "এই সপ্তাহে" : "this week") : i === 1 ? (bn ? "১৪ দিনে" : "in 14 days") : (bn ? "৩০ দিনে" : "in 30 days")) + "</p></div></li>";
      }).join("") + "</ul>" +
      '<div class="card" style="margin-top:16px"><span class="idx">' + (bn ? "৩০ দিনের লক্ষ্য" : "the 30-day target") + "</span>" +
      "<p style='margin-top:8px'>" + (bn ? "একটি সংখ্যা বেছে নিন — সাধারণত এনকোয়ারি→কল বা কল→পেমেন্ট। প্রতি শুক্রবার সেই একটি সংখ্যা দেখুন; বাকি সব মাপা বন্ধ রাখুন।"
        : "Pick one number — usually enquiry→call or call→paid. Look at that one number every Friday and stop measuring everything else for a month. Focus is the intervention.") + "</p></div>";
    $("#result").hidden = false; $("#capture").hidden = false;
    $("#qcard").style.display = "none";
    $("#result").scrollIntoView({ behavior: FI.reduced ? "auto" : "smooth", block: "start" });
    FI.track("diag_complete", { score: s.total });
    history.replaceState && history.replaceState(null, "", "#index-" + s.total);
  }

  /* ---------- the report itself (text), delivered by channel ---------- */
  function reportText(withContact) {
    var s = last || score(), bn = FI.lang() === "bn";
    var name = ($("#c-name").value || "").trim() || (bn ? "মূল্যায়ন" : "Assessment");
    var lines = [];
    lines.push("FUTURE ICON™ — SALES CREDIBILITY INDEX™");
    lines.push(name + " · " + new Date().toLocaleDateString("en-GB") + " · set " + seed);
    lines.push("Index: " + s.total + "/100 — " + (bn ? s.band.labelBn || s.band.labelEn : s.band.labelEn));
    lines.push("");
    lines.push(bn ? "ডিমেনশন অনুযায়ী স্কোর:" : "By dimension:");
    Object.keys(s.dims).sort().forEach(function (k) {
      lines.push("  " + (DIM[k][bn ? "bn" : "en"] + "                    ").slice(0, 22) + String(s.dims[k]).padStart(3) + "/100  " + ("▮".repeat(Math.round(s.dims[k] / 10))));
    });
    lines.push("");
    lines.push(bn ? "প্রাথমিক তিনটি সংশোধন:" : "First three fixes:");
    Object.keys(s.dims).sort(function (a, b) { return s.dims[a] - s.dims[b]; }).slice(0, 3).forEach(function (k, i) {
      var f = FIX[k][s.dims[k] < 34 ? 1 : 0];
      lines.push("  " + (i + 1) + ". " + f[0] + " — " + f[1]);
    });
    lines.push("");
    lines.push(bn ? "মূল্যায়ন পদ্ধতি (৪০টি প্রশ্নের ব্যাংক থেকে ১০টি)।" : "Method: 10 questions drawn from a 40-question bank; one question set per visit.");
    lines.push(BENCH);
    if (withContact) lines.push("\nMd Yousuf Efti, PhD · training@futureiconbd.com · +880 1754 325325");
    return lines.join("\n");
  }
  function wire() {
    /* capture form → report delivery */
    $("#captureForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var who = ($("#c-name").value || "").trim(), contact = ($("#c-contact").value || "").trim();
      $("#c-err").textContent = who.length < 2 ? "One word for the name is enough →" : (!/(@|\+?\d{9,})/.test(contact) ? "Add an email or a phone with 9+ digits →" : "");
      if ($("#c-err").textContent) return;
      var txt = reportText(true);
      var isMail = /@/.test(contact);
      var rec = { id: Date.now().toString(36), name: who, contact: contact, kind: isMail ? "email" : "whatsapp",
        teamSize: $("#c-size").value, industry: $("#c-ind").value, score: last.total, dims: last.dims,
        lang: FI.lang(), at: new Date().toISOString(), report: txt };
      FI.DB.add("leads", rec);
      $("#capBody").innerHTML = '<div class="ok"><h3 class="display">' + esc(FI.lang() === "bn" ? "রিপোর্ট তৈরি ✓" : "Your report is ready ✓") + "</h3>" +
        "<p class='small'>" + esc(FI.lang() === "bn" ? "নিচের যেকোনো একটি চ্যানেল বেছে নিন — কোনোটিই সাইন-আপ লাগে না।" : "Pick any channel below; none of them needs a sign-up.") + "</p>" +
        '<div class="row" style="margin-top:12px">' +
        '<a class="btn sm" href="mailto:' + (isMail ? encodeURIComponent(contact) : "") + '?subject=' + encodeURIComponent("Sales Credibility Index — " + last.total + "/100") + "&body=" + encodeURIComponent(txt) + '">' + esc(FI.lang() === "bn" ? "ইমেইলে পাঠান" : "Send by email") + "</a>" +
        '<a class="btn sm" target="_blank" rel="noopener" href="https://wa.me/' + contact.replace(/\D/g, "") + "?text=" + encodeURIComponent(txt.slice(0, 900)) + '">' + esc(FI.lang() === "bn" ? "হোয়াটসঅ্যাপে খুলুন" : "Open in WhatsApp") + "</a>" +
        '<button class="btn sm ghost" data-dl>' + esc(FI.lang() === "bn" ? ".txt ডাউনলোড" : "Download .txt") + "</button>" +
        '<button class="btn sm ghost" data-copy>' + esc(FI.lang() === "bn" ? "কপি" : "Copy") + "</button>" +
        '<a class="btn sm ghost" href="index.html?r=' + encode() + '#index-' + last.total + '">' + esc(FI.lang() === "bn" ? "শেয়ার লিঙ্ক" : "Shareable link") + "</a>" +
        '<a class="btn sm" href="book.html">' + esc(FI.lang() === "bn" ? "৩০ মিনিটের কল" : "Book 30 minutes") + "</a></div>" +
        "<p class='small' style='margin-top:10px'>" + esc(txt.slice(0, 240)).replace(/\n/g, "<br>") + "…</p></div>";
      $$("[data-dl]", $("#capBody"))[0].addEventListener("click", function () { FI.download("sales-credibility-index.txt", txt); });
      $$("[data-copy]", $("#capBody"))[0].addEventListener("click", function () { FI.copy(txt); });
      $("#captureForm").style.display = "none";
      FI.track("lead", { score: last.total, kind: rec.kind });
      if (FI.S.admin && FI.S.admin.endpoint) FI.toast("sent ✓");
    });
    $$("[data-again]").forEach(function (b) { b.addEventListener("click", function () { setSeed(Math.floor(Math.random() * 99999)); $("#result").hidden = true; $("#capture").hidden = true; $("#qcard").style.display = ""; $("#capBody").innerHTML = ""; }); });
    $$("[data-new-seed]").forEach(function (b) { b.addEventListener("click", function () { setSeed(Math.floor(Math.random() * 99999)); }); });
  }
  function encode() {
    try { return btoa(unescape(encodeURIComponent(JSON.stringify({ a: answers, s: seed })))); } catch (e) { return ""; }
  }
  function restore() {
    var r = new URLSearchParams(location.search).get("r"); if (!r) return false;
    try {
      var o = JSON.parse(decodeURIComponent(escape(atob(r))));
      build(); answers = o.a; FI.LS.set("fi_diag_seed", o.s); seed = o.s; idx = q.length; result(); return true;
    } catch (e) { return false; }
  }

  FI.ready.then(function () {
    if (!$("#qcard")) return;
    if (restore()) return;
    build(); paint(); wire();
    document.addEventListener("fi:lang", function () { if (idx < q.length) paint(); else result(); });
    $("#startBtn") && $("#startBtn").addEventListener("click", function () { $("#qcard").scrollIntoView({ behavior: "smooth", block: "center" }); });
  });
  window.FIDIAG = { BANK: BANK, build: build, score: score, reportText: reportText, get answers() { return answers; } };
})();
