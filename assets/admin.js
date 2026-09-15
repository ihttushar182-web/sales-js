/* ==========================================================================
   admin.js — the boards Yousuf uses: leads, appointments, posts, courses,
   gallery, diagnostic, booking settings, SEO/AEO audit, security.
   Static-friendly: edits live in localStorage, and every board can export the
   exact content/*.json to commit. If settings.admin.endpoint is set, records
   POST there too (Google Apps Script → Sheets + Gmail).
   ========================================================================== */
(function () {
  "use strict";
  var FI = window.FI, $ = FI.$, $$ = FI.$$, esc = FI.esc;
  var KEY = { posts: "fi_ov_posts", courses: "fi_ov_courses", gallery: "fi_ov_gallery", diag: "fi_ov_diag", booking: "fi_ov_booking", seo: "fi_ov_seo" };
  function bn() { return FI.lang() === "bn"; }
  function L(a, b) { return bn() ? b : a; }
/* Overrides are stored bare (the array, or the settings sub-object) so a page can read
     them without knowing the admin shape; a wrapped {name:…} from an earlier save still works. */
  function unwrap(o, key) { if (!o) return null; if (Array.isArray(o)) return o; return o[key] !== undefined ? o[key] : o; }
  function ov(name, fallback) { var o = FI.LS.get(KEY[name], null); var u = unwrap(o, name); return u === null ? fallback : u; }

  var DISK = null; /* null = unknown, true = tools/serve.js is running and writable */
  fetch("__ping").then(function (r) { return r.ok ? r.json() : null; }).then(function (j) { DISK = !!(j && j.writable); if (DISK) { var t = $("[data-disk]"); if (t) { t.textContent = "● " + L("disk write enabled", "ডিস্ক লেখা চালু"); t.style.color = "var(--accent2)"; } } }).catch(function () { DISK = false; });
  /* Which file each board owns. Lists replace the whole file; settings boards merge one key. */
  var FILES = { posts: "posts.json", courses: "courses.json", gallery: "gallery.json", diag: "settings.json", booking: "settings.json", seo: "settings.json" };
  var INSET = { diag: "diagnostic", booking: "booking", seo: "seo" };
  function setOv(name, val) {
    FI.LS.set(KEY[name], val);
    if (!DISK) { FI.toast(L("saved on this device — Export JSON (or Publish) to make it live", "এই ডিভাইসে সংরক্ষিত — প্রকাশে JSON এক্সপোর্ট করুন")); return; }
    var obj = val;
    if (INSET[name]) { var base = FI.S || {}; obj = Object.assign({}, base); obj[INSET[name]] = Object.assign({}, base[INSET[name]] || {}, val); }
    else if (name === "gallery") {
      /* gallery.json is {note, albums, items} — the board edits the items array only */
      var bg = FI.LS.get("fi_base_gallery", null) || {};
      obj = { $note: bg.$note || "Rebuilt from assets/img/gallery/ by scripts/build.js — captions and albums are kept here.",
        albums: bg.albums || Array.from(new Set((val || []).map(function (x) { return x.album; }).filter(Boolean))), items: val };
    }
    fetch("__save?t=" + (FI.LS.get("fi_tok", "dev")), { method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file: FILES[name], json: JSON.stringify(obj, null, 2) }) })
      .then(function (r) { return r.json(); })
      .then(function (j) { FI.toast(j.ok ? L("written to content/" + FILES[name] + " ✓ reload to see it live", "content/" + FILES[name] + "-এ লেখা হয়েছে ✓") : L("disk refused: " + j.error, "ডিস্ক লেখেনি: " + j.error)); })
      .catch(function () { FI.toast(L("device only — export the JSON to publish", "শুধু ডিভাইসে — প্রকাশে এক্সপোর্ট করুন")); });
  }
  function dl(name, obj) { FI.download(name, JSON.stringify(obj, null, 2), "application/json"); }
  function sync(kind, payload) {
    var ep = FI.S.admin && FI.S.admin.endpoint; if (!ep) return Promise.resolve("no endpoint");
    return fetch(ep, { method: "POST", headers: { "Content-Type": "text/plain" }, body: JSON.stringify({ kind: kind, data: payload }) }).then(function () { return "sent"; }).catch(function (e) { return "failed: " + e; });
  }
  function load(name) { return FI.loadJSON("content/" + name + ".json").then(function (j) { FI.LS.set("fi_base_" + name, j); return j; }); }

  /* ---------------- login ---------------- */
  function sha(s) {
    if (!(window.crypto && crypto.subtle)) return Promise.resolve(shaFallback(s));
    return crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)).then(function (b) {
      return [].map.call(new Uint8Array(b), function (x) { return x.toString(16).padStart(2, "0"); }).join("");
    });
  }
  function shaFallback(s) { var h = 5381; for (var i = 0; i < s.length; i++) h = ((h << 5) + h) ^ s.charCodeAt(i); return "fallback-" + (h >>> 0); }
  function gate() {
    if (sessionStorage.getItem("fi_adm") === "1") return boot();
    document.body.innerHTML = '<main class="shell"><form class="login card" id="lg" style="padding:26px">' +
      '<span class="idx">' + L("editor login", "সম্পাদক লগইন") + '</span><h1 class="display" style="margin:8px 0 6px">' + L("Yousuf Efti — back office", "ইউসুফ ইফতি — ব্যাক অফিস") + "</h1>" +
      '<p class="small">' + L("Passphrase from <code>content/settings.json</code>. Nothing leaves this browser.", "<code>content/settings.json</code>-এর পাসফ্রেজ। কিছুই ব্রাউজারের বাইরে যায় না।") + "</p>" +
      '<label class="field" style="margin-top:14px"><span>' + L("Passphrase", "পাসফ্রেজ") + '</span><input class="input" id="pw" type="password" autocomplete="current-password" required></label>' +
      '<p class="err" id="lge"></p><button class="btn block" type="submit">' + L("Open the boards", "বোর্ড খুলুন") + "</button>" +
      '<p class="small" style="margin-top:12px">' + L("Tip for the demo build: default is <b>efti2026-change-me</b>.", "ডেমোর জন্য ডিফল্ট: <b>efti2026-change-me</b>।") + "</p></form></main>";
    $("#lg").addEventListener("submit", function (e) {
      e.preventDefault();
      sha($("#pw").value).then(function (h) {
        var want = (FI.S.admin || {}).passphraseSha256;
        if (h === want || (String(want).indexOf("fallback-") === 0 && h === String(want))) { sessionStorage.setItem("fi_adm", "1"); location.reload(); }
        else $("#lge").textContent = L("That passphrase does not match.", "পাসফ্রেজ মেলেনি।");
      });
    });
  }

  /* ---------------- shell ---------------- */
  var BOARDS = [
    ["overview", "Overview", "ওভারভিউ", "◎"], ["leads", "Leads", "লিড", "✉"], ["appts", "Appointments", "অ্যাপয়েন্টমেন্ট", "◷"],
    ["posts", "Articles", "প্রবন্ধ", "¶"], ["courses", "Programmes", "প্রোগ্রাম", "▤"], ["gallery", "Gallery", "গ্যালারি", "▣"],
    ["diag", "Diagnostic", "ডায়াগনস্টিক", "◔"], ["booking", "Booking", "বুকিং", ""], ["seo", "SEO / AEO", "এসইও", "⌕"], ["sec", "Security", "নিরাপত্তা", "⚿"]
  ];
  function boot() {
    var host = $("#boards"); if (!host) return;
    host.innerHTML = BOARDS.map(function (b, i) {
      return '<button data-b="' + b[0] + '" aria-selected="' + (i === 0) + '"><span>' + b[3] + "</span> " +
        "<span class='en'>" + b[1] + '</span><span class="bn i">' + b[2] + "</span></button>";
    }).join("") + '<button data-b="logout"><span>⎋</span> ' + L("Log out", "লগ আউট") + "</button>";
    host.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      if (b.dataset.b === "logout") { sessionStorage.removeItem("fi_adm"); location.href = "index.html"; return; }
      $$("[data-b]", host).forEach(function (x) { x.setAttribute("aria-selected", String(x === b)); });
      render(b.dataset.b);
    });
    if (location.hash) { var t = location.hash.slice(1); if (BOARDS.some(function (b) { return b[0] === t; })) { $('[data-b="' + t + '"]').setAttribute("aria-selected", "true"); return render(t); } }
    render("overview");
  }
  function head(title, sub) {
    return '<h2>' + title + (sub ? '<span class="small" style="display:block;font-family:var(--sans);font-size:.82rem;margin-top:4px">' + sub + "</span>" : "") + "</h2>";
  }
  function tbl(cols, rows, actions) {
    return '<div style="overflow:auto"><table class="tbl"><thead><tr>' + cols.map(function (c) { return "<th>" + c + "</th>"; }).join("") +
      "</tr></thead><tbody>" + (rows.length ? rows.map(function (r, i) { return "<tr><td>" + r.join("</td><td>") + "</td>" + (actions ? "<td>" + actions(i, r) + "</td>" : "") + "</tr>"; }).join("") :
        '<tr><td colspan="' + (cols.length + 1) + '" class="small">nothing here yet</td></tr>') + "</tbody></table></div>";
  }
  var el = $("#board");
  function render(b) {
    el.innerHTML = '<p class="small">loading…</p>';
    ({ overview: bOverview, leads: bLeads, appts: bAppts, posts: bPosts, courses: bCourses, gallery: bGallery, diag: bDiag, booking: bBooking, seo: bSeo, sec: bSec }[b] || bOverview)(el);
    el.scrollIntoView({ block: "nearest" });
    location.hash = b;
  }

  /* ---------------- 1 · overview ---------------- */
  function bOverview(host) {
    var ev = FI.LS.get("fi_ev", []), leads = FI.DB.all("leads"), appt = FI.DB.all("appt");
    function n(t) { return ev.filter(function (e) { return e.t.indexOf(t) === 0; }).length; }
    var kpi = [["Index submissions", leads.length], ["Avg index", leads.length ? Math.round(leads.reduce(function (a, x) { return a + x.score; }, 0) / leads.length) : "—"],
      ["Appointments", appt.filter(function (a) { return a.status !== "cancelled"; }).length], ["Diagnostic runs", n("diag_complete")],
      ["Section cues", n("cue_")], ["Slot picks", n("slot_pick")], ["Downloads", n("download_")], ["Events logged", ev.length]];
    host.innerHTML = head(L("Control room", "কন্ট্রোল রুম"), L("Everything below is stored in this browser unless an endpoint is configured in settings.", "এন্ডপয়েন্ট না দিলে সব এই ব্রাউজারেই থাকে।")) +
      '<div class="row" style="margin-bottom:10px"><span class="chip" data-disk>○ ' + L("checking disk access…", "ডিস্ক অ্যাক্সেস দেখছি…") + '</span></div><div class="kpis">' + kpi.map(function (k) { return '<div class="kpi"><b>' + k[1] + "</b><span>" + k[0] + "</span></div>"; }).join("") + "</div>" +
      '<div class="grid g2" style="margin-top:18px"><div class="card"><span class="idx">' + L("funnel map", "ফানেল মানচিত্র") + "</span>" +
      '<ul class="mods" style="margin-top:10px">' + ["index.html → hero cue → offer ladder (diagnostic / checklist / book)",
        "diagnostic.html → 10 questions → index → capture → report channel",
        "book.html → day → slot → details → .ics + WhatsApp confirm",
        "article.html → share → book · courses.html → enrol → dashboard → book"].map(function (x) { return "<li><span>" + x + "</span></li>"; }).join("") + "</ul></div>" +
      '<div class="card"><span class="idx">' + L("last activity", "সাম্প্রতিক কার্যকলাপ") + "</span><div style='margin-top:10px'>" +
      (ev.slice(-9).reverse().map(function (e) { return "<div class='drow'><div class='t'><b>" + e.t + "</b><span>" + new Date(e.ts).toLocaleString("en-GB") + "</span></div></div>"; }).join("") || "<p class='small'>no events yet</p>") +
      "</div></div></div>" +
      '<div class="row" style="margin-top:18px"><a class="btn sm" href="diagnostic.html?debug=1">' + L("Open diagnostic with tracking", "ট্র্যাকিংসহ ডায়াগনস্টিক") + '</a>' +
      '<a class="btn sm ghost" href="index.html" target="_blank">' + L("View site", "সাইট দেখুন") + "</a>" +
      '<button class="btn sm ghost" data-clear>' + L("Clear local records", "লোকাল রেকর্ড মুছুন") + "</button></div>";
    $("[data-clear]").addEventListener("click", function () { ["leads", "appt", "enrol"].forEach(function (k) { FI.DB.put(k, []); }); FI.LS.set("fi_ev", []); render("overview"); });
  }

  /* ---------------- 2 · leads ---------------- */
  function bLeads(host) {
    var leads = FI.DB.all("leads");
    host.innerHTML = head(L("Diagnostic leads", "ডায়াগনস্টিক লিড"), L("Sorted newest first. CSV export is ready for your CRM.", "নতুন আগে। সিএসভি ক্রমে দেওয়া যাবে।")) +
      tbl([L("When", "কখন"), "Name", L("Contact", "যোগাযোগ"), L("Index", "ইনডেক্স"), L("Weakest", "দুর্বল"), L("Team", "টিম")],
        leads.map(function (x) {
          var worst = Object.keys(x.dims || {}).sort(function (a, b) { return x.dims[a] - x.dims[b]; })[0] || "—";
          return [new Date(x.at).toLocaleString("en-GB"), "<b>" + esc(x.name) + "</b>", esc(x.contact), x.score + "/100", worst + " " + (x.dims[worst] | 0), esc(x.teamSize || "")];
        }),
        function (i) {
          var x = leads[i];
          var wa = x.kind === "whatsapp" ? "https://wa.me/" + x.contact.replace(/\D/g, "") : null;
          var mail = "mailto:" + x.contact + "?subject=" + encodeURIComponent("Your Sales Credibility Index") + "&body=" + encodeURIComponent(x.report || "");
          return '<a class="btn sm ghost" target="_blank" rel="noopener" href="' + (wa || mail) + '">' + (wa ? "WhatsApp" : "Email") + "</a> " +
            '<button class="btn sm ghost" data-del="' + x.id + '">✕</button>';
        }) +
      '<div class="row" style="margin-top:14px"><button class="btn sm" data-csv>Export CSV</button>' +
      '<button class="btn sm ghost" data-push>' + L("Push to endpoint", "এন্ডপয়েন্টে পাঠান") + "</button></div>";
    $("[data-csv]").addEventListener("click", function () {
      FI.download("leads.csv", "date,name,contact,index,team,sector,report\n" + leads.map(function (x) {
        return [new Date(x.at).toISOString(), '"' + x.name + '"', x.contact, x.score, '"' + (x.teamSize || "") + '"', '"' + (x.industry || "") + '"', '"' + (x.report || "").replace(/\n/g, " | ").replace(/"/g, "'") + '"'].join(",");
      }).join("\n"), "text/csv");
    });
    $("[data-push]").addEventListener("click", function () { sync("leads", leads).then(function (r) { FI.toast(r); }); });
    host.addEventListener("click", function (e) { var d = e.target.closest("[data-del]"); if (d) { FI.DB.del("leads", d.dataset.del); render("leads"); } });
  }

  /* ---------------- 3 · appointments ---------------- */
  function bAppts(host) {
    var a = FI.DB.all("appt").slice().sort(function (x, y) { return (x.day + x.time).localeCompare(y.day + y.time); });
    host.innerHTML = head(L("Appointments board", "অ্যাপয়েন্টমেন্ট বোর্ড"), L("One column per day. Cancel releases the slot back to the public calendar.", "বাতিল করলে স্লট আবার খালি হয়।")) +
      tbl([L("Day", "দিন"), L("Time", "সময়"), "Name", L("Org", "প্রতিষ্ঠান"), L("Contact", "যোগাযোগ"), L("Team", "টিম"), L("Topic", "বিষয়"), L("Status", "অবস্থা")],
        a.map(function (x) {
          return [x.day, "<b>" + x.time + "</b>", esc(x.name), esc(x.org || ""), esc(x.contact), esc(x.size || ""), esc((x.topic || "").slice(0, 60)),
            '<span class="chip ' + (x.status === "confirmed" ? "g" : "") + '">' + x.status + "</span>"];
        }),
        function (i) {
          var x = a[i];
          return '<button class="btn sm ghost" data-ok="' + x.id + '">✓</button> ' +
            '<a class="btn sm ghost" target="_blank" rel="noopener" href="' + (/@/.test(x.contact) ? "mailto:" + x.contact : "https://wa.me/" + x.contact.replace(/\D/g, "")) + '?subject=' + encodeURIComponent("Our call " + x.day + " " + x.time) + '">✉</a> ' +
            '<button class="btn sm ghost" data-cancel="' + x.id + '">✕</button>';
        }) +
      '<div class="row" style="margin-top:14px"><button class="btn sm" data-icsall>' + L("Export all as .ics", "সব .ics-এ এক্সপোর্ট") + "</button>" +
      '<a class="btn sm ghost" href="#booking">' + L("Booking settings", "বুকিং সেটিংস") + "</a></div>";
    host.addEventListener("click", function (e) {
      var ok = e.target.closest("[data-ok]"), c = e.target.closest("[data-cancel]");
      if (ok) { a.filter(function (x) { return x.id === ok.dataset.ok; })[0].status = "done"; FI.DB.put("appt", a); render("appts"); }
      if (c) { FI.DB.del("appt", c.dataset.cancel); render("appts"); }
    });
    $("[data-icsall]").addEventListener("click", function () {
      FI.download("appointments.ics", a.map(function (x) { return (window.FIBOOK ? FIBOOK.ics(x) : "").split("\r\n").filter(function (l) { return !/BEGIN:VCALENDAR|END:VCALENDAR/.test(l); }).join("\r\n"); }).join("\r\n"), "text/calendar");
    });
  }

  /* ---------------- 4 · posts ---------------- */
  function bPosts(host) {
    load("posts").then(function (j) {
      var posts = ov("posts", j.posts || []);
      host.innerHTML = head(L("Articles & blog", "প্রবন্ধ ও ব্লগ"), L("Edit here, then export <code>content/posts.json</code> into the repo (or set an endpoint to sync).", "এখানে সম্পাদনা, তারপর <code>content/posts.json</code> এক্সপোর্ট করুন।")) +
        tbl(["Slug", L("Title", "শিরোনাম"), L("Date", "তারিখ"), "Read", L("Tags", "ট্যাগ"), L("Bangla", "বাংলা")],
          posts.map(function (p) { return ['<code>' + p.slug + "</code>", "<b>" + esc(p.titleEn) + "</b>", p.date, p.read + " min", p.tags.join(", "), p.bodyBn ? "✓" : "—"]; }),
          function (i) { return '<button class="btn sm" data-edit="' + i + '">' + L("Edit", "সম্পাদনা") + "</button>"; }) +
        '<div class="row" style="margin-top:14px"><button class="btn sm" data-new>+ ' + L("New article", "নতুন প্রবন্ধ") + '</button>' +
        '<button class="btn sm ghost" data-exp>' + L("Export posts.json", "posts.json এক্সপোর্ট") + '</button>' +
        '<button class="btn sm ghost" data-reset>' + L("Reset to file", "ফাইলে ফিরুন") + "</button>" +
        '<button class="btn sm ghost" data-rss>' + L("Rebuild feeds (CLI)", "ফিড রিবিল্ড (CLI)") + "</button></div>" +
        '<div id="ed"></div>';
      $("[data-exp]").addEventListener("click", function () { dl("posts.json", { posts: posts }); });
      $("[data-reset]").addEventListener("click", function () { localStorage.removeItem(KEY.posts); render("posts"); });
      $("[data-rss]").addEventListener("click", function () { FI.copy("node scripts/build.js"); FI.toast("copied: node scripts/build.js"); });
      $("[data-new]").addEventListener("click", function () { edit({ slug: "new-article-" + Date.now().toString(36).slice(-4), date: new Date().toISOString().slice(0, 10), read: 4, tags: ["draft"], author: "Md Yousuf Efti, PhD", titleEn: "", titleBn: "", excerptEn: "", excerptBn: "", cover: "/assets/img/blog/leadership.svg", courseId: "", takeaways: [], bodyEn: "<p></p>", bodyBn: "" }, posts.length); });
      host.addEventListener("click", function (e) { var b = e.target.closest("[data-edit]"); if (b) edit(posts[+b.dataset.edit], +b.dataset.edit); });
      function edit(p, i) {
        var f = function (k, l, ta) { return '<label class="field' + (ta || l.indexOf("body") === 0 ? " full" : "") + '"><span>' + l + '</span>' +
          (ta || l.indexOf("body") === 0 ? '<textarea class="input" rows="' + (l.indexOf("body") === 0 ? 12 : 2) + '" data-f="' + k + '">' + esc(p[k] || "") + "</textarea>"
            : '<input class="input" data-f="' + k + '" value="' + esc(p[k] == null ? "" : p[k]) + '">') + "</label>"; };
        $("#ed").innerHTML = '<div class="card" style="margin-top:16px"><span class="idx">' + L("editing", "সম্পাদনা") + " · " + esc(p.slug) + "</span>" +
          '<div class="editor" style="margin-top:12px">' + f("titleEn", "Title (English)") + f("titleBn", "শিরোনাম (বাংলা)") +
          f("excerptEn", "Excerpt / meta description (EN)") + f("excerptBn", "সারসংক্ষেপ (বাংলা)") +
          f("date", L("Date YYYY-MM-DD", "তারিখ")) + f("read", "read (min)") + f("cover", L("Cover path", "কভার পাথ")) +
          f("tags", L("Tags, comma separated", "ট্যাগ, কমা দিয়ে")) + f("courseId", L("Linked programme id", "যুক্ত প্রোগ্রাম id")) +
          f("bodyEn", L("Body (HTML)", "মূল লেখা (HTML)"), "t") + f("bodyBn", "মূল লেখা (HTML, বাংলা)", "t") + "</div>" +
          '<div class="row" style="margin-top:10px"><button class="btn sm" data-save>' + L("Save draft to device", "ডিভাইসে সংরক্ষণ") + "</button>" +
          '<button class="btn sm ghost" data-kill>' + L("Delete article", "মুছে ফেলুন") + '</button><button class="btn sm ghost" data-close>' + L("Close", "বন্ধ") + "</button></div></div>";
        $$("#ed [data-f]").forEach(function (x) { x.addEventListener("input", function () { p[x.dataset.f] = x.value; }); });
        $("[data-save]").addEventListener("click", function () {
          p.tags = String(p.tags).split(",").map(function (s) { return s.trim(); }).filter(Boolean);
          p.read = +p.read || 3; posts[i] = p; setOv("posts", posts); render("posts");
        });
        $("[data-kill]").addEventListener("click", function () { posts.splice(i, 1); setOv("posts", posts); render("posts"); });
        $("[data-close]").addEventListener("click", function () { $("#ed").innerHTML = ""; });
      }
    });
  }

  /* ---------------- 5 · courses ---------------- */
  function bCourses(host) {
    load("courses").then(function (j) {
      var cs = ov("courses", j.courses || []);
      host.innerHTML = head(L("Programmes & prices", "প্রোগ্রাম ও মূল্য"), L("Seats and dates feed the public cards and the dashboard. ৳ amounts are per cohort unless noted.", "আসন ও তারিখ পাবলিক কার্ডে বসে।")) +
        tbl(["id", L("Title", "শিরোনাম"), L("Price ৳", "মূল্য"), L("Next cohort", "পরবর্তী ব্যাচ"), L("Seats left", "আসন"), L("Feat", "ফিচারড"), L("Modules", "মডিউল")],
          cs.map(function (c) { return ['<code>' + c.id + "</code>", "<b>" + esc(c.titleEn) + "</b>", c.price, c.nextCohort, c.seatsLeft, c.featured ? "✓" : "—", c.modules.length]; }),
          function (i) { return '<button class="btn sm" data-edit="' + i + '">' + L("Edit", "সম্পাদনা") + "</button>"; }) +
        '<div class="row" style="margin-top:14px"><button class="btn sm ghost" data-exp>' + L("Export courses.json", "courses.json এক্সপোর্ট") + '</button>' +
        '<button class="btn sm ghost" data-reset>' + L("Reset to file", "ফাইলে ফিরুন") + "</button></div><div id=\"ed2\"></div>";
      $("[data-exp]").addEventListener("click", function () { dl("courses.json", { currency: "BDT", courses: cs }); });
      $("[data-reset]").addEventListener("click", function () { localStorage.removeItem(KEY.courses); render("courses"); });
      host.addEventListener("click", function (e) {
        var b = e.target.closest("[data-edit]"); if (!b) return;
        var c = cs[+b.dataset.edit];
        $("#ed2").innerHTML = '<div class="card" style="margin-top:16px"><div class="editor">' +
          ["price", "seatsLeft", "nextCohort", "rating", "enrolled"].map(function (k) {
            return '<label class="field"><span>' + k + '</span><input class="input" data-k="' + k + '" value="' + esc(c[k]) + '"></label>';
          }).join("") +
          '<label class="field"><span>summaryEn</span><textarea class="input" rows="3" data-k="summaryEn">' + esc(c.summaryEn) + '</textarea></label>' +
          '<label class="field"><span>summaryBn</span><textarea class="input" rows="3" data-k="summaryBn">' + esc(c.summaryBn) + "</textarea></label>" +
          '<label class="field"><span>format</span><input class="input" data-k="format" value="' + esc(c.format) + '"></label>' +
          '<label class="field"><span>featured</span><input type="checkbox" data-k="featured" ' + (c.featured ? "checked" : "") + '></label>' +
          "</div><div class='row' style='margin-top:10px'><button class='btn sm' data-save2>Save</button><button class='btn sm ghost' data-close2>Close</button></div></div>";
        $$("#ed2 [data-k]").forEach(function (x) {
          x.addEventListener("input", function () { c[x.dataset.k] = x.type === "checkbox" ? x.checked : (isNaN(+x.value) ? x.value : +x.value); });
        });
        $("[data-save2]").addEventListener("click", function () { cs[+b.dataset.edit] = c; setOv("courses", cs); render("courses"); });
        $("[data-close2]").addEventListener("click", function () { $("#ed2").innerHTML = ""; });
      });
    });
  }

  /* ---------------- 6 · gallery ---------------- */
  function bGallery(host) {
    load("gallery").then(function (j) {
      var g = ov("gallery", j.items || []);
      host.innerHTML = head(L("Photo gallery", "ফটো গ্যালারি"),
        L("Permanent way to add photos: drop files into <code>assets/img/gallery/</code> and run <code>node scripts/build.js</code> — it rebuilds this list and keeps your captions. Edits here are for quick fixes.",
          "ছবি যোগ করার স্থায়ী পদ্ধতি: ফাইল <code>assets/img/gallery/</code>-এ দিন, তারপর <code>node scripts/build.js</code> চালান।")) +
        tbl(["#", L("Album", "অ্যালবাম"), L("Caption (EN)", "ক্যাপশন"), L("src", "উৎস")],
          g.map(function (x, i) { return [i + 1, x.album, '<input class="input" data-i="' + i + '" value="' + esc(x.captionEn) + '">', "<code>" + x.src + "</code>"]; }),
          function (i) { return '<button class="btn sm ghost" data-del="' + i + '">✕</button>'; }) +
        '<div class="row" style="margin-top:14px"><button class="btn sm ghost" data-exp>' + L("Export gallery.json", "gallery.json এক্সপোর্ট") + '</button>' +
        '<button class="btn sm ghost" data-reset>' + L("Reset", "রিসেট") + '</button><input class="input" id="addurl" placeholder="/assets/img/gallery/new.jpg" style="max-width:280px">' +
        '<button class="btn sm" data-add>+ ' + L("Add by path", "পাথ দিয়ে যোগ") + "</button></div>";
      host.addEventListener("input", function (e) { var t = e.target.closest("[data-i]"); if (t) g[+t.dataset.i].captionEn = t.value; });
      $("[data-del]") && host.addEventListener("click", function (e) { var d = e.target.closest("[data-del]"); if (d) { g.splice(+d.dataset.del, 1); setOv("gallery", g); render("gallery"); } });
      $("[data-add]").addEventListener("click", function () {
        var v = $("#addurl").value.trim(); if (!v) return;
        g.unshift({ src: v, album: "Future Icon", captionEn: "New session photo", captionBn: "নতুন সেশনের ছবি", w: 1200, h: 800 }); setOv("gallery", g); render("gallery");
      });
      $("[data-exp]").addEventListener("click", function () { dl("gallery.json", { albums: Array.from(new Set(g.map(function (x) { return x.album; }))), items: g }); });
      $("[data-reset]").addEventListener("click", function () { localStorage.removeItem(KEY.gallery); render("gallery"); });
    });
  }

  /* ---------------- 7 · diagnostic ---------------- */
  function bDiag(host) {
    var D = FI.S.diagnostic || {}, diag = ov("diag", { questionCount: D.questionCount || 10 });
    var bank = (window.FIDIAG && FIDIAG.BANK) || [];
    var byDim = {}; bank.forEach(function (q) { byDim[q.d] = (byDim[q.d] || 0) + 1; });
    host.innerHTML = head(L("Sales Credibility Index™", "সেলস ক্রেডিবিলিটি ইনডেক্স™"),
      L("The bank is code-managed in <code>assets/diagnostic.js</code> so wording stays auditable. The settings below change how many questions are asked and how bands are labelled.",
        "প্রশ্নের ব্যাংক <code>assets/diagnostic.js</code>-এ; নিচের সেটিংস প্রশ্নের সংখ্যা ও ব্যান্ড বদলায়।")) +
      '<div class="kpis">' + Object.keys(byDim).map(function (k) { return '<div class="kpi"><b>' + byDim[k] + "</b><span>" + k + "</span></div>"; }).join("") +
      '<div class="kpi"><b>' + bank.length + "</b><span>total questions</span></div></div>" +
      '<div class="card" style="margin-top:16px"><div class="editor">' +
      '<label class="field"><span>' + L("Questions per session (6–20)", "প্রতি সেশনে প্রশ্ন (৬–২০)") + '</span><input type="number" min="6" max="20" value="' + diag.questionCount + '" data-k="questionCount"></label>' +
      D.bands.map(function (b, i) {
        return '<label class="field"><span>band ' + (i + 1) + " · " + b.min + "–" + b.max + '</span><input class="input" data-band="' + i + '" value="' + esc(b.labelEn) + '"></label>';
      }).join("") +
      '</div><div class="row" style="margin-top:10px"><button class="btn sm" data-save>' + L("Save", "সংরক্ষণ") + '</button>' +
      '<a class="btn sm ghost" href="diagnostic.html" target="_blank">' + L("Preview", "প্রিভিউ") + "</a>" +
      '<button class="btn sm ghost" data-reset>Reset</button></div></div>' +
      '<div class="card" style="margin-top:14px"><span class="idx">' + L("bank preview", "ব্যাংক প্রিভিউ") + "</span>" +
      '<ul class="mods" style="margin-top:8px;max-height:300px;overflow:auto">' +
      bank.slice(0, 12).map(function (q) { return "<li><span>[" + q.d + "] " + esc(q.en) + "</span></li>"; }).join("") + "</ul>" +
      '<p class="small">+' + (bank.length - 12) + " more…</p></div>";
    var bands = D.bands.slice();
    $$("[data-band]").forEach(function (x) { x.addEventListener("input", function () { bands[+x.dataset.band].labelEn = x.value; }); });
    $("[data-save]").addEventListener("click", function () {
      diag.questionCount = +$('[data-k="questionCount"]').value || 10;
      diag.bands = bands; setOv("diag", diag); FI.toast(L("saved — the diagnostic reads this on next load", "সংরক্ষিত — পরের লোডে প্রয়োগ হবে"));
    });
    $("[data-reset]").addEventListener("click", function () { localStorage.removeItem(KEY.diag); render("diag"); });
  }

  /* ---------------- 8 · booking ---------------- */
  function bBooking(host) {
    var B = JSON.parse(JSON.stringify(FI.S.booking || {})), saved = FI.LS.get(KEY.booking, null);
    if (saved) B = Object.assign(B, saved);
    host.innerHTML = head(L("Appointment settings", "অ্যাপয়েন্টমেন্ট সেটিংস"), L("Slots are generated from these rules; taken slots come from this board.", "স্লট এই নিয়ম থেকে তৈরি; বোর্ডের বুকিং গুনে যায়।")) +
      '<div class="card"><div class="editor">' +
      '<label class="field"><span>duration (min)</span><input type="number" value="' + B.durationMin + '" data-b="durationMin"></label>' +
      '<label class="field"><span>buffer (min)</span><input type="number" value="' + B.bufferMin + '" data-b="bufferMin"></label>' +
      '<label class="field"><span>' + L("days shown ahead", "আগে কত দিন দেখাবে") + '</span><input type="number" value="' + B.advanceDays + '" data-b="advanceDays"></label>' +
      '<label class="field"><span>platform</span><input class="input" value="' + esc(B.platform) + '" data-b="platform"></label>' +
      '<label class="field"><span>meeting url</span><input class="input" value="' + esc(B.meetingUrl) + '" data-b="meetingUrl"></label>' +
      '<label class="field"><span>' + L("open days (0=Sun)", "খোলা দিন (০=রবি)") + '</span><input class="input" value="' + B.openDays.join(",") + '" data-b="openDays"></label>' +
      '<label class="field full"><span>' + L("working windows", "কাজের সময়") + '</span><textarea class="input" rows="2" data-b="slots">' + esc(B.slots.map(function (s) { return s.start + "-" + s.end; }).join("\n")) + "</textarea></label>" +
      '<label class="field full"><span>' + L("fee / conditions", "মূল্য / শর্ত") + '</span><input class="input" value="' + esc(B.feeEn) + '" data-b="feeEn"></label>' +
      '</div><div class="row" style="margin-top:10px"><button class="btn sm" data-save>' + L("Save for this device", "এই ডিভাইসে সংরক্ষণ") + '</button>' +
      '<button class="btn sm ghost" data-exp>' + L("Export settings.json", "settings.json এক্সপোর্ট") + '</button>' +
      '<a class="btn sm ghost" href="book.html" target="_blank">' + L("Test the calendar", "ক্যালেন্ডার পরীক্ষা") + "</a></div></div>";
    $$("[data-b]").forEach(function (x) {
      x.addEventListener("input", function () {
        var k = x.dataset.b;
        if (k === "openDays") B[k] = x.value.split(",").map(function (v) { return +v.trim(); }).filter(function (v) { return !isNaN(v); });
        else if (k === "slots") B[k] = x.value.split(/\n+/).map(function (l) { var m = l.split("-").map(function (s) { return s.trim(); }); return { start: m[0], end: m[1] }; });
        else B[k] = isNaN(+x.value) ? x.value : +x.value;
      });
    });
    $("[data-save]").addEventListener("click", function () { FI.LS.set(KEY.booking, B); FI.toast(L("saved", "সংরক্ষিত")); });
    $("[data-exp]").addEventListener("click", function () {
      FI.loadJSON("content/settings.json").then(function (s) { s.booking = B; dl("settings.json", s); });
    });
  }

  /* ---------------- 9 · SEO / AEO auditor ---------------- */
  var PAGES = ["index.html", "diagnostic.html", "courses.html", "blog.html", "gallery.html", "book.html"];
  function bSeo(host) {
    host.innerHTML = head(L("Google / AI readiness", "গুগল ও এআই প্রস্তুতি"),
      L("Reads the live pages in this browser and checks the 14 things ranking actually depends on. Nothing is sent anywhere.", "এই ব্রাউজারে পাতা পড়ে র‍্যাঙ্কিং নির্ভর ১৪টি বিষয় যাচাই করে।")) +
      '<div class="row" style="margin-bottom:14px"><button class="btn sm" data-run>' + L("Run audit", "অডিট চালান") + '</button>' +
      '<a class="btn sm ghost" href="robots.txt" target="_blank">robots.txt</a><a class="btn sm ghost" href="sitemap.xml" target="_blank">sitemap.xml</a>' +
      '<a class="btn sm ghost" href="llms.txt" target="_blank">llms.txt</a><a class="btn sm ghost" href="feed.json" target="_blank">feed.json</a>' +
      '<a class="btn sm ghost" href="manifest.webmanifest" target="_blank">manifest</a></div><div id="auditout"><p class="small">idle</p></div>';
    $("[data-run]").addEventListener("click", function () {
      $("#auditout").innerHTML = '<p class="small">reading…</p>';
      Promise.all(PAGES.map(function (p) {
        return fetch(p).then(function (r) { return r.text(); }).then(function (h) { return check(p, h); }).catch(function () { return { p: p, err: "unreachable" }; });
      })).then(function (rows) {
        var total = rows.reduce(function (a, r) { return a + (r.score || 0); }, 0), avg = Math.round(total / rows.length);
        $("#auditout").innerHTML = '<div class="kpis" style="margin-bottom:14px"><div class="kpi"><b>' + avg + "</b><span>avg score /100</span></div>" +
          '<div class="kpi"><b>' + rows.length + "</b><span>pages read</span></div></div>" +
          '<div style="overflow:auto"><table class="tbl"><thead><tr><th>page</th><th>score</th><th>checks</th></tr></thead><tbody>' +
          rows.map(function (r) {
            return "<tr><td><code>" + r.p + "</code></td><td><b style='color:" + (r.score > 85 ? "var(--accent2)" : r.score > 65 ? "var(--accent)" : "var(--danger)") + "'>" + (r.score || 0) + "</b></td><td>" +
              r.items.map(function (i) { return '<span class="chip ' + (i.ok ? "g" : "a") + '" title="' + esc(i.fix || "") + '">' + i.label + "</span>"; }).join(" ") + "</td></tr>";
          }).join("") + "</tbody></table></div>" +
          '<p class="small" style="margin-top:10px">' + L("Amber = fix before launch. Hover a chip for the exact fix. Green = pass.", "হলুদ = লঞ্চের আগে ঠিক করুন। চিপে হোভার করলে সমাধান।") + "</p>";
      });
    });
    function check(p, h) {
      var m = function (re) { return (h.match(re) || [])[1] || ""; };
      var title = m(/<title>([^<]*)<\/title>/i), desc = m(/name="description" content="([^"]*)"/i);
      var imgs = (h.match(/<img\b[^>]*>/gi) || []), noAlt = imgs.filter(function (i) { return !/alt="[^"]+"/.test(i); });
      var words = h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
      var items = [
        { label: "title 30–65", ok: title.length >= 30 && title.length <= 65, fix: "Set a 30–65 char title with the outcome + name. Now: " + title.length },
        { label: "meta desc 120–165", ok: desc.length >= 120 && desc.length <= 165, fix: "120–165 chars. Now: " + desc.length },
        { label: "canonical", ok: /rel="canonical"/.test(h), fix: "add <link rel=canonical> with the real domain" },
        { label: "h1 ×1", ok: (h.match(/<h1\b/gi) || []).length === 1, fix: "exactly one h1 per page" },
        { label: "og:title", ok: /property="og:title"/.test(h), fix: "needed for LinkedIn/WhatsApp unfurl" },
        { label: "og:image", ok: /og:image/.test(h) && /\.(jpg|png|webp)/.test(h), fix: "1200×630 image, absolute URL" },
        { label: "twitter:card", ok: /twitter:card/.test(h), fix: "summary_large_image" },
        { label: "viewport", ok: /name="viewport"/.test(h), fix: "required for mobile-first indexing" },
        { label: "lang attr", ok: /<html[^>]*\blang=/.test(h), fix: "lang on <html> for bilingual signals" },
        { label: "JSON-LD", ok: /application\/ld\+json/.test(h), fix: "Person/Organization/Course/BlogPosting/FAQ" },
        { label: "img alt", ok: imgs.length === 0 || noAlt.length === 0, fix: (noAlt.length + " image(s) without alt text") },
        { label: "words 350+", ok: words >= 350, fix: "thin page: " + words + " words — add substance before launch" },
        { label: "internal links 6+", ok: (h.match(/href="(?![a-z]+:|#)[^"]+\.html/gi) || []).length >= 6, fix: "link to sibling pages for crawl depth" },
        { label: "no lorem/TODO", ok: !/lorem ipsum|TODO|FIX ME/i.test(h), fix: "remove placeholder text before indexing" }
      ];
      return { p: p, score: Math.round(items.filter(function (i) { return i.ok; }).length / items.length * 100), items: items };
    }
  }

  /* ---------------- 10 · security ---------------- */
  function bSec(host) {
    host.innerHTML = head(L("Access & sync", "প্রবেশাধিকার ও সিঙ্ক"),
      L("This is a client-side gate for a static site — good for a demo and for the editor's own convenience, not a substitute for a real backend if the boards must be public.", "স্ট্যাটিক সাইটের জন্য ক্লায়েন্ট-সাইড গেট; পাবলিক ব্যাকএন্ড দরকার হলে সার্ভার দরকার।")) +
      '<div class="grid g2"><div class="card"><span class="idx">' + L("passphrase", "পাসফ্রেজ") + "</span>" +
      '<p class="small" style="margin:8px 0 12px">' + L("Pick a new one, then paste the hash into <code>content/settings.json → admin.passphraseSha256</code>.", "নতুন পাসফ্রেজ দিন, হ্যাশটি settings.json-এ বসান।") + "</p>" +
      '<label class="field"><span>' + L("new passphrase", "নতুন পাসফ্রেজ") + '</span><input class="input" id="np" type="text"></label>' +
      '<p class="err" id="sh"></p><button class="btn sm" data-hash>' + L("Generate hash", "হ্যাশ তৈরি") + "</button>" +
      '<div class="row" style="margin-top:12px"><button class="btn sm ghost" data-copy>' + L("Copy hash", "হ্যাশ কপি") + "</button></div></div>" +
      '<div class="card"><span class="idx">' + L("sync endpoint", "সিঙ্ক এন্ডপয়েন্ট") + "</span>" +
      '<p class="small" style="margin:8px 0 12px">' + L("Paste a Google Apps Script Web App URL to receive leads/appointments as JSON (write to Sheets + send Gmail). Leave blank for local-only.", "Apps Script Web App URL দিলে লিড শিটে যাবে। ফাঁকা রাখলে শুধু লোকাল।") + "</p>" +
      '<label class="field"><span>admin.endpoint</span><input class="input" id="ep" placeholder="https://script.google.com/macros/s/AKfy…/exec" value="' + esc((FI.S.admin || {}).endpoint || "") + '"></label>' +
      '<div class="row"><button class="btn sm" data-ep>' + L("Save + export settings", "সংরক্ষণ + এক্সপোর্ট") + '</button><button class="btn sm ghost" data-test>' + L("Test", "পরীক্ষা") + "</button></div>" +
      '<p class="small" id="epr" style="margin-top:10px"></p></div></div>' +
      '<div class="card" style="margin-top:16px"><span class="idx">' + L("what is stored where", "কোথায় কী জমা হয়") + "</span>" +
      '<ul class="mods" style="margin-top:10px">' + [
        "leads, appointments, enrolments → this browser (localStorage key fi_leads / fi_appt / fi_enrol) + endpoint if set",
        "funnel events → localStorage fi_ev (last 120) + endpoint beacon if set",
        "admin edits → localStorage override, exported as content/*.json to publish",
        "visitors' diagnostic answers → never leave their device unless they send the report"
      ].map(function (x) { return "<li><span>" + esc(x) + "</span></li>"; }).join("") + "</ul></div>";
    $("[data-hash]").addEventListener("click", function () { sha($("#np").value).then(function (h) { $("#sh").style.color = "var(--accent)"; $("#sh").textContent = h; }); });
    $("[data-copy]").addEventListener("click", function () { FI.copy($("#sh").textContent); });
    $("[data-ep]").addEventListener("click", function () {
      FI.loadJSON("content/settings.json").then(function (s) { s.admin.endpoint = $("#ep").value.trim(); dl("settings.json", s); });
    });
    $("[data-test]").addEventListener("click", function () {
      var ep = $("#ep").value.trim(); if (!ep) return $("#epr").textContent = L("no endpoint set", "এন্ডপয়েন্ট নেই");
      sync("ping", { at: new Date().toISOString(), from: location.href }).then(function (r) { $("#epr").textContent = "endpoint says: " + r; });
    });
  }

  FI.ready.then(gate);
})();
