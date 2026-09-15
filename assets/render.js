/* ==========================================================================
   render.js — content JSON → DOM (courses, dashboard, articles, gallery)
   Re-renders on language change. Bilingual fields come from the JSON.
   ========================================================================== */
(function () {
  "use strict";
  var FI = window.FI, $ = FI.$, $$ = FI.$$, esc = FI.esc, pick = FI.pick;
  var CACHE = {};
  /* admin boards write an override (fi_ov_posts / _courses / _gallery) so Yousuf can edit
     without a deploy; exporting the JSON and committing it makes it permanent for everyone. */
  /* Admin edits are stored under fi_ov_<name> (a bare array for posts/courses/gallery items,
     a bare sub-object for the settings boards) and always win over content/<name>.json — that is
     how Yousuf's own edits show on the public pages with no server. An older wrapped save
     {name: value} is still read correctly. */
  function unwrap(o, key) { if (!o) return null; if (Array.isArray(o)) return o; return o[key] !== undefined ? o[key] : o; }
  function data(p) {
    var key = (p.match(/(\w+)\.json/) || [])[1];
    var raw = key ? FI.LS.get("fi_ov_" + key, null) : null;
    if (CACHE[p] && !raw) return Promise.resolve(CACHE[p]);
    return FI.loadJSON(p).then(function (j) {
      var ov = unwrap(raw, key), out = j;
      if (ov !== null) {
        if (Array.isArray(j)) out = Array.isArray(ov) ? ov : j;
        else if (Array.isArray(ov)) out = Object.assign({}, j, { items: ov });
        else out = Object.assign({}, j, ov || {});
      }
      if (!raw) CACHE[p] = out;
      return out;
    });
  }

  function fallback(el, msg) {
    if (!el) return;
    if (!el.dataset.fallback) return;
    el.innerHTML = '<p class="small">' + esc(el.dataset.fallback) + "</p>";
  }
  function ready(fn) { FI.ready.then(function () { fn(FI.S); }); document.addEventListener("fi:lang", function () { fn(FI.S); }); }
  function pct(a, b) { return Math.max(4, Math.min(100, Math.round(a / b * 100))); }

  /* ---------- courses ---------- */
  function courseCard(c, full) {
    var seats = Math.max(0, c.seatsLeft | 0), taken = pct(Math.max(1, 40 - seats), 40);
    return '<article class="card course" id="' + esc(c.id) + '" data-rev>' +
      '<div class="top"><span class="idx">' + esc(c.badge || (full ? "" : "programme")) + "</span>" +
      '<span class="tag">' + esc(c.rating) + " ★ · " + FI.fmt(c.enrolled) + "</span></div>" +
      "<h3 class=\"display\">" + esc(pick(c, "title")) + "</h3>" +
      "<p>" + esc(pick(c, "summary")) + "</p>" +
      (full ? '<ul class="mods">' + c.modules.map(function (m) { return "<li><span>" + esc(pick(m, "")) + "</span></li>"; }).join("") + "</ul>" +
        '<div class="row"><span class="chip">' + esc(c.level) + '</span><span class="chip">' + esc(c.format) + "</span>" +
        c.tags.map(function (t) { return '<span class="chip a">' + esc(t) + "</span>"; }).join("") + "</div>" : "") +
      '<div><div class="between" style="gap:8px"><span class="small"><span class="en">Seats left in next cohort</span><span class="bn i">পরবর্তী ব্যাচে আসন</span> <b class="num">' + seats + "</b></span>" +
      '<span class="small num">' + FI.date(c.nextCohort) + "</span></div>" +
      '<div class="seats" style="margin-top:6px"><i style="--p:' + taken + '%"></i></div></div>' +
      '<div class="between" style="margin-top:4px"><span class="price">' + FI.money(c.price) +
      "<small>" + esc(c.priceNote) + "</small></span>" +
      '<button class="btn sm' + (full ? "" : " ghost") + '" data-enrol="' + esc(c.id) + '">' +
      (full ? 'Enrol / request <span class="ar">→</span>' : "Details →") + "</button></div>" +
      (full ? '<div class="row"><span class="chip g">' + c.outcomes.length + " outcomes</span></div>" +
        '<details style="margin-top:6px"><summary class="small" style="cursor:pointer">What participants leave with</summary>' +
        '<ul class="mods" style="margin-top:8px">' + c.outcomes.map(function (o) { return "<li><span>" + esc(o) + "</span></li>"; }).join("") + "</ul></details>" : "") +
      "</article>";
  }
  function renderCourses() {
    var teasers = $$("[data-course-list],#courseTeaser"); if (!teasers.length) return Promise.resolve();
    return data("content/courses.json").then(function (j) {
      var cs = j.courses || [];
      teasers.forEach(function (el) {
        if (el.id === "courseTeaser") el.innerHTML = cs.filter(function (c) { return c.featured; }).slice(0, 3).map(function (c) { return courseCard(c, false); }).join("");
        else el.innerHTML = cs.map(function (c) { return courseCard(c, true); }).join("");
      });
      var grid = $("#dashBoard");
      if (grid) renderDash(cs);
      FI.observe();
      wireEnrol(cs);
    }).catch(function () { teasers.forEach(fallback); });
  }

  /* ---------- enrolment → dashboard ---------- */
  function wireEnrol(cs) {
    $$("[data-enrol]").forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.dataset.enrol, c = cs.filter(function (x) { return x.id === id; })[0];
        var en = FI.DB.all("enrol"), has = en.filter(function (x) { return x.id === id; })[0];
        if (!has) {
          FI.DB.add("enrol", { id: id, title: c.titleEn, progress: 0, added: Date.now() });
          FI.toast(FI.lang() === "bn" ? "ড্যাশবোর্ডে যোগ হয়েছে" : "Added to your dashboard ↓");
        }
        var target = $("#dashBoard");
        if (target) { target.scrollIntoView({ behavior: "smooth", block: "center" }); renderDash(cs); }
        else location.href = "courses.html#dashBoard";
        FI.track("enrol_click", { id: id });
      });
    });
  }
  function renderDash(cs) {
    var el = $("#dashBoard"); if (!el) return;
    var en = FI.DB.all("enrol");
    var items = !en.length ? cs.slice(0, 2).map(function (c) { return { id: c.id, title: c.titleEn, titleBn: c.titleBn, progress: 0, sample: true }; }) :
      en.map(function (e) { var c = cs.filter(function (x) { return x.id === e.id; })[0] || {}; return Object.assign({}, e, c); });
    var total = items.reduce(function (a, b) { return a + (b.progress | 0); }, 0) / (items.length || 1);
    el.innerHTML = '<div class="card" style="grid-column:1/-1"><div class="row between">' +
      "<div><span class='idx'>" + (FI.lang() === "bn" ? "আপনার অগ্রগতি" : "your progress") + "</span>" +
      "<h3 class='display' style='margin-top:6px'>" + FI.fmt(total) + "% · " + items.length + " programme" + (items.length > 1 ? "s" : "") + "</h3></div>" +
      "<div class='row'>" + (en.length ? '<button class="btn sm ghost" data-reset>Reset demo</button>' : '<span class="chip">sample data</span>') +
      "<a class='btn sm' href='book.html'>" + (FI.lang() === "bn" ? "কল বুক" : "Book a call") + "</a></div></div></div>" +
      items.map(function (it) {
        return '<div class="card"><div class="row" style="gap:14px"><span class="ring" style="--p:' + (it.progress | 0) + '"><b>' + (it.progress | 0) + '%</b></span>' +
          '<div class="t" style="flex:1"><b>' + esc(pick(it, "title") || it.title) + "</b>" +
          "<span>" + (FI.lang() === "bn" ? "পরবর্তী সেশন " : "next session ") + FI.date(it.nextCohort || "2026-10-05") + " · " + esc(it.format || "in-house") + "</span></div>" +
          '<div class="row" style="gap:6px"><button class="btn sm ghost" data-prog="-15">−</button>' +
          '<button class="btn sm" data-prog="15">+</button></div></div>' +
          (it.modules ? '<ul class="mods" style="margin-top:12px">' + it.modules.slice(0, 3).map(function (m) { return "<li><span>" + esc(pick(m, "")) + "</span></li>"; }).join("") + "</ul>" : "") +
          '<div class="between" style="margin-top:12px"><span class="chip ' + (it.progress >= 70 ? "g" : "") + '">' + (it.progress >= 70 ? "certificate ready" : it.sample ? "preview" : "in progress") + "</span>" +
          '<button class="btn sm ghost" data-dl="' + esc(it.id) + '">' + (FI.lang() === "bn" ? "নোট ডাউনলোড" : "Download notes") + "</button></div></div>";
      }).join("") +
      '<div class="card"><span class="idx">' + (FI.lang() === "bn" ? "প্রথম ৩০ দিন" : "first 30 days") + "</span>" +
      "<h3 class='display' style='margin:8px 0'>" + (FI.lang() === "bn" ? "প্রতি সপ্তাহে কী ঘটবে" : "what happens each week") + "</h3>" +
      ["W1 · baseline pulled from your MIS, coverage sheet audited", "W2 · live cohort day 1 + roleplay video review",
       "W3 · manager scorecards to your GM, peer coaching pairs set", "W4 · clinic call on the two hardest territories"].map(function (x) {
        return "<div class='drow'><div class='t'><span>" + esc(x) + "</span></div></div>";
      }).join("") + "</div>";

    el.addEventListener("click", function (e) {
      var p = e.target.closest("[data-prog]");
      if (p) {
        var card = p.closest(".card"), i = [].slice.call(el.children).indexOf(card) - 1;
        var en2 = FI.DB.all("enrol"); var rec = en2[i] || { id: items[i].id, title: items[i].title, progress: 0 };
        rec.progress = Math.max(0, Math.min(100, (rec.progress | 0) + +p.dataset.prog));
        if (!en2[i]) FI.DB.add("enrol", rec); else { en2[i] = rec; FI.DB.put("enrol", en2); }
        renderDash(cs); FI.track("progress", { id: rec.id, p: rec.progress }); return;
      }
      if (e.target.closest("[data-reset]")) { FI.DB.put("enrol", []); renderDash(cs); FI.toast("reset"); return; }
      var d = e.target.closest("[data-dl]");
      if (d) {
        var it = items.filter(function (x) { return x.id === d.dataset.dl; })[0] || {};
        FI.download((it.id || "notes") + "-action-plan.txt",
          "FUTURE ICON — ACTION PLAN\n" + (it.title || "") + "\n\n" +
          (it.modules || []).map(function (m, k) { return (k + 1) + ". " + (m.en || "") + "\n   → my move this week: ____________________"; }).join("\n") +
          "\n\nBaseline metrics I will report on:\n 1. coverage of A-class outlets  ____%\n 2. drop size               ____\n 3. qualified calls/day   ____\n\n— Md Yousuf Efti, PhD · training@futureiconbd.com");
        FI.toast("downloaded");
      }
    }, { once: false });
  }

  /* ---------- articles ---------- */
  function postCard(p) {
    return '<article class="post" data-rev><a href="article.html?slug=' + encodeURIComponent(p.slug) + '" class="cover">' +
      '<img src="' + esc(FI.url(p.cover)) + '" alt="' + esc(p.titleEn) + '" loading="lazy" decoding="async" width="1200" height="800">' +
      "</a><div class=\"meta\"><span>" + FI.date(p.date) + "</span><span>" + p.read + " min</span>" +
      p.tags.map(function (t) { return '<span class="chip">' + esc(t) + "</span>"; }).join("") + "</div>" +
      '<h3 class="display"><a href="article.html?slug=' + encodeURIComponent(p.slug) + '">' + esc(pick(p, "title")) + "</a></h3>" +
      '<p class="small">' + esc(pick(p, "excerpt")) + "</p></article>";
  }
  function renderPosts() {
    var teasers = $$("[data-post-list],#postTeaser"); if (!teasers.length) return Promise.resolve();
    return data("content/posts.json").then(function (j) {
      var ps = (j.posts || []).slice().sort(function (a, b) { return b.date.localeCompare(a.date); });
      teasers.forEach(function (el) {
        if (el.id === "postTeaser") el.innerHTML = ps.slice(0, 3).map(postCard).join("");
        else {
          var q = (new URLSearchParams(location.search).get("q") || "").toLowerCase();
          var tag = (location.hash || "").replace("#", "");
          var list = ps.filter(function (p) {
            return (!q || (p.titleEn + p.titleBn + p.excerptEn + (p.excerptBn || "")).toLowerCase().indexOf(q) > -1) &&
              (!tag || p.tags.indexOf(tag) > -1);
          });
          el.innerHTML = (list.length ? list.map(postCard).join("") : '<p class="small">No articles match that filter yet.</p>') +
            (ps.filter(function (p) { return !p.bodyBn; }).length ? '<p class="small" style="margin-top:14px">' +
              ps.filter(function (p) { return !p.bodyBn; }).length + " article(s) awaiting the Bangla translation pass.</p>" : "");
          var tags = {}; ps.forEach(function (p) { p.tags.forEach(function (t) { tags[t] = (tags[t] || 0) + 1; }); });
          var box = $("#tagList");
          if (box) box.innerHTML = Object.keys(tags).sort().map(function (t) {
            return '<a class="tag" href="#' + t + '">' + t + " · " + tags[t] + "</a>";
          }).join(" ");
        }
      });
      FI.observe();
    }).catch(function () { teasers.forEach(fallback); });
  }

  function renderArticle() {
    var host = $("#article"); if (!host) return Promise.resolve();
    return data("content/posts.json").then(function (j) {
      var slug = new URLSearchParams(location.search).get("slug");
      var p = (j.posts || []).filter(function (x) { return x.slug === slug; })[0] || (j.posts || [])[0];
      var bn = FI.lang() === "bn";
      var body = (bn && p.bodyBn) ? p.bodyBn : p.bodyEn;
      document.title = p.titleEn + " — Yousuf Efti";
      if (bn && p.titleBn) document.title = p.titleBn + " — ইউসুফ ইফতি";
      host.innerHTML = '<div class="grid" style="grid-template-columns:1fr">' +
        '<div class="meta"><a href="blog.html">← ' + (bn ? "সব প্রবন্ধ" : "All articles") + "</a><span>" + FI.date(p.date) + "</span>" +
        (p.updated ? "<span>updated " + FI.date(p.updated) + "</span>" : "") + "<span>" + p.read + " min read</span>" +
        p.tags.map(function (t) { return '<a class="chip" href="blog.html#' + t + '">' + esc(t) + "</a>"; }).join("") + "</div>" +
        '<h1 class="display" style="margin:12px 0 10px">' + esc(pick(p, "title")) + "</h1>" +
        '<p class="lede">' + esc(pick(p, "excerpt")) + "</p>" +
        '<img src="' + esc(FI.url(p.cover)) + '" alt="' + esc(p.titleEn) + '" width="1200" height="800" decoding="async" style="border-radius:var(--r);margin:18px 0">' +
        (p.takeaways ? '<div class="card" style="margin-bottom:20px"><span class="idx">' + (bn ? "মূল কথা" : "takeaways") + '</span><ul class="mods" style="margin-top:8px">' +
          p.takeaways.map(function (t) { return "<li><span>" + esc(t) + "</span></li>"; }).join("") + "</ul></div>" : "") +
        '<div class="prose dropcap">' + body + "</div>" +
        '<div class="between" style="margin-top:26px;padding-top:18px;border-top:1px solid var(--line2)">' +
        '<div class="row"><span class="mark" style="width:40px;height:40px;border-radius:12px;display:grid;place-items:center;background:var(--accent);color:var(--ink);font-family:var(--mono);font-weight:700">YE</span>' +
        "<div><b>" + (bn ? "মোঃ ইউসুফ ইফতি, পিএইচডি" : "Md Yousuf Efti, PhD") + "</b><br><span class='small'>" +
        (bn ? "সেলস লিডারশিপ ট্রেনার · সিইও, ফিউচার আইকন" : "Sales Leadership Trainer · CEO, Future Icon™") + "</span></div></div>" +
        '<div class="row"><button class="btn sm ghost" data-share>' + (bn ? "শেয়ার" : "Copy link") + '</button><a class="btn sm" href="book.html">' +
        (bn ? "৩০ মিনিটের কল" : "Book 30 minutes") + "</a></div></div>" +
        (p.courseId ? '<a class="card hi" style="margin-top:20px" href="courses.html#' + p.courseId + '"><span class="idx">' + (bn ? "এই লেখার প্রোগ্রাম" : "the programme behind this") + "</span>" +
          "<h3 class='display'>" + esc(p.courseId.replace(/-/g, " ")) + "</h3><p>" + (bn ? "এই পদ্ধতিটি ২-৩ দিনের কোর্সে অনুশীলন করা হয় →" : "Trained as a 2–3 day cohort with roleplay and scorecards →") + "</p></a>" : "") +
        "</div>";
      var sh = $("[data-share]", host); if (sh) sh.addEventListener("click", function () { FI.copy(location.href); FI.track("share_article", { s: p.slug }); });
      FI.observe();
      injectArticleSchema(p);
    });
  }
  function injectArticleSchema(p) {
    var s = document.createElement("script"); s.type = "application/ld+json";
    s.textContent = JSON.stringify({ "@context": "https://schema.org", "@type": "BlogPosting", headline: p.titleEn,
      alternativeHeadline: p.titleBn || null, inLanguage: FI.lang() === "bn" ? "bn" : "en", description: p.excerptEn,
      datePublished: p.date, dateModified: p.updated || p.date, image: p.cover, author: { "@type": "Person", name: p.author },
      publisher: { "@type": "Organization", name: "Future Icon™" }, mainEntityOfPage: location.href });
    document.head.appendChild(s);
  }

  /* ---------- gallery ---------- */
  function renderGallery() {
    var hosts = $$("[data-gallery],#galStrip"); if (!hosts.length) return Promise.resolve();
    return data("content/gallery.json").then(function (j) {
      var items = j.items || [];
      hosts.forEach(function (el) {
        var limit = +el.dataset.limit || items.length;
        el.innerHTML = items.slice(0, limit).map(function (g) {
          return '<figure tabindex="0" data-caption="' + esc(pick(g, "caption")) + '"><img src="' + esc(FI.url(g.src)) +
            '" alt="' + esc(pick(g, "caption")) + '" loading="lazy" decoding="async" width="' + (g.w || 1200) + '" height="' + (g.h || 800) + '">' +
            "<figcaption>" + esc(pick(g, "caption")) + "</figcaption></figure>";
        }).join("");
      });
      var alb = $("#albumList");
      if (alb) alb.innerHTML = "<a class='tag' href='#'>All · " + items.length + "</a> " + (j.albums || []).map(function (a) {
        return "<a class='tag' href='#'>" + esc(a) + "</a>";
      }).join(" ");
      FI.observe();
    }).catch(function () { hosts.forEach(fallback); });
  }

  /* ---------- boot ---------- */
  FI.ready.then(function () { renderCourses(); renderPosts(); renderGallery(); renderArticle(); });
  document.addEventListener("fi:lang", function () { renderCourses(); renderPosts(); renderGallery(); renderArticle(); });
  window.FIR = { data: data, renderCourses: renderCourses, renderGallery: renderGallery };
})();
