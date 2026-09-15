/* ==========================================================================
   sales-js · motion.js — reveal, counters, kinetic type, funnel tracking
   No deps. Runs ~1 listener per feature, rAF-batched. ~7 KB.
   ========================================================================== */
(function () {
  "use strict";
  var R = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var raf = function (fn) { var q = 0; return function () { if (q) return; q = 1; requestAnimationFrame(function () { q = 0; fn(); }); }; };

  /* ---- 1. funnel event tracking (UTM capture + local log + optional beacon) ---- */
  var EP = (window.SITE && window.SITE.trackEndpoint) || "";
  var log = [];
  try { log = JSON.parse(localStorage.getItem("sj_events") || "[]"); } catch (e) {}
  var utm = {};
  location.search.replace(/[^?&]+/g, function (m) {
    var p = m.split("="); if (/^utm_|^gclid|^ref|^src/.test(p[0])) utm[p[0]] = decodeURIComponent(p[1] || "");
  });
  if (Object.keys(utm).length) {
    var saved = {}; try { saved = JSON.parse(localStorage.getItem("sj_utm") || "{}"); } catch (e) {}
    Object.keys(utm).forEach(function (k) { saved[k] = utm[k]; });
    localStorage.setItem("sj_utm", JSON.stringify(saved));
  }
  function track(name, data) {
    var e = { t: name, ts: Date.now(), d: data || {}, u: localStorage.getItem("sj_utm") || "{}" };
    log.push(e); if (log.length > 60) log.shift();
    try { localStorage.setItem("sj_events", JSON.stringify(log)); } catch (x) {}
    if (EP && navigator.sendBeacon) { try { navigator.sendBeacon(EP, JSON.stringify(e)); } catch (x) {} }
    paintDbg();
  }
  window.sjTrack = track;

  var dbg = $("#dbg"), dbgCount = 0;
  function paintDbg() {
    if (!dbg || !dbg.classList.contains("on")) return;
    var last = log.slice(-6).reverse();
    dbg.innerHTML = "<div><span>events</span><b>" + log.length + "</b></div>" +
      last.map(function (e) { return "<div><span>" + e.t + "</span><b>" + new Date(e.ts).toLocaleTimeString() + "</b></div>"; }).join("");
  }
  if (location.search.indexOf("debug=1") > -1 && dbg) { dbg.classList.add("on"); paintDbg(); }

  /* ---- 2. scroll reveal + stagger ---- */
  var io = null;
  if ("IntersectionObserver" in window) {
    io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        el.classList.add("is-in");
        io.unobserve(el);
        if (el.hasAttribute("data-cue")) track(el.getAttribute("data-cue"), { stage: el.dataset.funnelStage || "", id: el.id || null });
        $$("[data-count]", el).concat(el.hasAttribute("data-count") ? [el] : []).forEach(count);
        $$("[data-scramble]", el).forEach(scramble);
        var g = el.querySelector ? el.querySelector("svg [data-draw]") : null;
        if (g) draw(g);
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.14 });
    $$("[data-reveal],[data-cue],.mask,.fstage,[data-draw]").forEach(function (el) { io.observe(el); });
    $$("[data-draw]").forEach(draw);
  } else {
    $$("[data-reveal],.mask").forEach(function (el) { el.classList.add("is-in"); });
  }
  // stagger siblings sharing a parent
  $$("[data-stagger]").forEach(function (p) {
    $$("[data-reveal]", p).forEach(function (el, i) { el.style.setProperty("--d", (i * 70) + "ms"); });
    $$(".mask", p).forEach(function (el, i) { el.style.setProperty("--d", (i * 90) + "ms"); });
  });

  /* ---- 3. number counters ---- */
  function count(el) {
    if (el.dataset.done) return; el.dataset.done = 1;
    var to = parseFloat(el.dataset.count), pre = el.dataset.pre || "", suf = el.dataset.suf || "";
    var dec = (el.dataset.dec | 0), dur = +(el.dataset.dur || 1400), t0 = 0;
    if (R || !to) { el.textContent = pre + fmt(to, dec) + suf; return; }
    function fmt(v, d) { return v.toFixed(d).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = pre + fmt(to * e, dec) + suf;
      if (p < 1) requestAnimationFrame(step); else track("metric_view", { to: to });
    }
    requestAnimationFrame(step);
  }

  /* ---- 4. kinetic scramble-decode (role rotator / headline accent) ---- */
  var GLY = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&$*/<>{}";
  function scramble(el) {
    if (el.dataset.sdone) return; el.dataset.sdone = 1;
    var words = (el.dataset.scramble || "").split("|");
    var i = 0;
    if (R) { el.textContent = words[0]; return; }
    function to(target, cb) {
      var from = el.textContent, len = Math.max(from.length, target.length), q = [], f = 0;
      for (var n = 0; n < len; n++) {
        q.push({ c: target[n] || "", s: Math.floor(Math.random() * 18), e: 18 + Math.floor(Math.random() * 22) });
      }
      (function run() {
        var out = "", done = 0;
        q.forEach(function (o, k) {
          if (f >= o.e) { done++; out += o.c; }
          else if (f >= o.s) { out += (o.c === " " ? " " : GLY[Math.floor(Math.random() * GLY.length)]); }
          else out += from[k] || "";
        });
        el.textContent = out;
        if (done === q.length) { cb && cb(); return; }
        f++; requestAnimationFrame(run);
      })();
    }
    (function cycle() {
      to(words[i], function () {
        i = (i + 1) % words.length;
        setTimeout(cycle, 2600);
      });
    })();
  }

  /* ---- 5. SVG line-draw ---- */
  function draw(node) {
    if (!node || node.dataset.don) return; node.dataset.don = 1;
    var len = 0;
    try { len = node.getTotalLength ? node.getTotalLength() : 1200; } catch (e) { len = 1200; }
    node.style.strokeDasharray = len; node.style.strokeDashoffset = R ? 0 : len;
    if (R) return;
    node.getBoundingClientRect();
    node.style.transition = "stroke-dashoffset 1.5s cubic-bezier(.16,1,.3,1) .1s";
    node.style.strokeDashoffset = 0;
  }

  /* ---- 6. nav progress + shrink ---- */
  var nav = $(".nav"), bar = $(".prog");
  var onScroll = raf(function () {
    var y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.width = (h > 0 ? (y / h) * 100 : 0).toFixed(2) + "%";
    if (nav) nav.dataset.solid = y > 40 ? "1" : "0";
    var dock = $(".dock");
    if (dock) dock.classList.toggle("up", y > innerHeight * 0.85 && y < h - innerHeight * 0.6);
    // parallax rails
    $$("[data-par]").forEach(function (el) {
      var r = el.getBoundingClientRect(), c = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
      el.style.setProperty("--py", (c * +el.dataset.par).toFixed(1) + "px");
    });
  });
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* ---- 7. cursor spotlight + magnetic buttons (pointer: fine only) ---- */
  var spot = $(".spot");
  if (matchMedia("(pointer:fine)").matches && !R) {
    var set = raf(function (e) {
      if (!spot) return;
      spot.style.setProperty("--sx", (e.clientX / innerWidth * 100) + "%");
      spot.style.setProperty("--sy", (e.clientY / innerHeight * 100) + "%");
    });
    addEventListener("pointermove", function (e) { spot && spot.classList.add("on"); set(e); }, { passive: true });
    $$(".btn.magnetic").forEach(function (b) {
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect(), x = (e.clientX - r.left - r.width / 2) / r.width, y = (e.clientY - r.top - r.height / 2) / r.height;
        b.style.transform = "translate(" + (x * 12).toFixed(1) + "px," + (y * 8).toFixed(1) + "px)";
        b.style.setProperty("--mx", (e.clientX - r.left) + "px"); b.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
      b.addEventListener("pointerleave", function () { b.style.transform = ""; });
    });
  }

  /* ---- 8. ticker: duplicate for seamless loop ---- */
  $$(".ticker-track").forEach(function (t) { t.innerHTML += t.innerHTML; });

  /* ---- 9. option cards + range readouts (shared by forms) ---- */
  $$(".opt").forEach(function (o) {
    var i = o.querySelector("input"); if (!i) return;
    var sync = function () { o.classList.toggle("sel", i.checked); };
    i.addEventListener("change", function () {
      sync();
      if (i.type === "radio") $$('[data-group="' + (i.dataset.group || "") + '"]').forEach(function (s) { if (s !== i && s.closest(".opt")) s.closest(".opt").classList.remove("sel"); });
      track("opt", { g: i.dataset.group || "", v: i.value });
    });
    i.addEventListener("focus", function () { o.style.borderColor = "var(--accent)"; });
    i.addEventListener("blur", function () { o.style.borderColor = ""; });
    sync();
  });
  $$("input[type=range]").forEach(function (r) {
    var out = $('[data-out="' + r.id + '"]');
    var upd = function () {
      if (out) out.textContent = (r.dataset.pre || "") + (+r.value).toLocaleString() + (r.dataset.suf || "");
      r.style.setProperty("--p", ((r.value - r.min) / (r.max - r.min) * 100) + "%");
    };
    r.addEventListener("input", upd); upd();
  });

  /* ---- 10. copy-to-clipboard (for DM/WhatsApp paste blocks) ---- */
  $$("[data-copy]").forEach(function (b) {
    b.addEventListener("click", function () {
      var src = $(b.dataset.copy); if (!src) return;
      var txt = ("value" in src && src.value) ? src.value : src.innerText;
      (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject())
        .then(function () { flash(b, "copied ✓"); track("copy", { from: b.dataset.copy }); })
        .catch(function () { src.select && src.select(); flash(b, "select + copy"); });
    });
  });
  function flash(el, msg) { var o = el.textContent; el.textContent = msg; el.style.color = "var(--accent)"; setTimeout(function () { el.textContent = o; el.style.color = ""; }, 1600); }

  /* ---- 11. live DM composer (WhatsApp / mailto deep links) ---- */
  function params() {
    var c = (window.SITE && SITE.lead) || {};
    return c;
  }
  $$("[data-wa]").forEach(function (a) {
    a.addEventListener("click", function () {
      var c = params();
      var msg = c.msg || "Hi " + (c.name || "") + " — I sent you a note on LinkedIn.";
      a.href = "https://wa.me/" + (c.phone || "").replace(/\D/g, "") + "?text=" + encodeURIComponent(msg);
      track("whatsapp_click");
    });
  });
  $$("[data-mail]").forEach(function (a) {
    a.addEventListener("click", function () {
      var c = params();
      a.href = "mailto:" + (c.email || "") + "?subject=" + encodeURIComponent(c.sub || "Your brand funnel") + "&body=" + encodeURIComponent(c.msg || "");
      track("email_click");
    });
  });
  /* ---- 11b. config bindings: keep links + strings sourced from one file (site.config.js) */
  $$("[data-href]").forEach(function (a) { var v = SITE && SITE[a.dataset.href]; if (v) a.href = v; });
  $$("[data-text]").forEach(function (el) { var v = SITE && SITE[el.dataset.text]; if (v) el.textContent = v; });
  // funnel links carry the personalised query string through the whole path (?to=Name&co=...)
  $$("[data-passthrough]").forEach(function (a) {
    a.addEventListener("click", function () {
      var qs = location.search; if (!qs || qs.length < 2) return;
      a.href = a.href.split("?")[0] + qs + (/[?&]/.test(a.href) ? "&" : "?") + "src=site";
    });
  });

  /* ---- 12. per-prospect personalisation: /pitch.html?to=Yousuf&co=Future+Icon&hook=workshops
     A public visitor sees the normal page; a visitor from your targeted DM link sees their own version. */
  (function personalise() {
    var q = new URLSearchParams(location.search), c = (window.SITE && SITE.lead) || {};
    var saved = {}; try { saved = JSON.parse(localStorage.getItem("sj_to") || "{}"); } catch (e) {}
    ["to", "co", "hook", "city"].forEach(function (k) { if (q.get(k)) saved[k] = q.get(k); });
    if (Object.keys(saved).length) localStorage.setItem("sj_to", JSON.stringify(saved));
    var d = {
      to: (saved.to || "").replace(/\+/g, " "), co: (saved.co || "").replace(/\+/g, " "), hook: saved.hook || ""
    };
    window.sjTo = d;
    var first = d.to ? d.to.split(" ")[0] : "";
    if (d.to) {
      $$("[data-to]").forEach(function (el) {
        var t = el.dataset.to;
        el.textContent = t === "full" ? d.to : t === "company" ? (d.co || d.to) : first;
      });
      $$("[data-hook]").forEach(function (el) { if (d.hook) el.textContent = d.hook.replace(/-/g, " "); });
      if (window.SITE) {
        SITE.lead = c;
        c.name = d.to; c.sub = (d.co ? d.co + " — " : "") + "brand + conversion funnel";
        c.msg = "Hi " + first + " — this is the follow-up to your LinkedIn" + (d.co ? " / " + d.co : "") +
          ". 2 minutes: what I fix, proof, and how we'd start in 14 days. Reply \u201caudit\u201d and I'll send the score.";
      }
      track("personalised", { to: d.to, co: d.co, hook: d.hook });
    }
    // banners that only make sense on a targeted link
    $$("[data-pshow]").forEach(function (el) { el.hidden = !d.to; });
    $$("[data-company]").forEach(function (el) {
      el.textContent = d.co || (c.name || "");
      if (!el.textContent) el.style.display = "none";
    });
  })();

  addEventListener("load", function () { track("page_view", { path: location.pathname, ref: document.referrer || "direct" }); });
  addEventListener("visibilitychange", function () { if (document.hidden) track("time_" + Math.round(performance.now() / 1000) + "s"); });
})();
