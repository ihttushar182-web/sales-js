/* ==========================================================================
   yousufefti.com · app.js — settings, theme, bilingual, motion, 3D, tracking
   Shared by every page. No framework, no jQuery, no build step.
   ========================================================================== */
window.FI = (function () {
  "use strict";
  var R = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var LS = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  var raf = function (fn) { var q = 0; return function () { if (q) return; q = 1; requestAnimationFrame(function () { q = 0; fn(); }); }; };

  /* ---------- config + content ---------- */
  var S = { theme: { default: "dark" }, lang: { default: "en" }, contact: {}, brand: {}, proof: {}, booking: {}, admin: {}, seo: {} };
  function url(p) { return (p || "").replace(/^https?:\/\/[^/]+/, "") || p; }
  function loadJSON(path) {
    return fetch(path, { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error(path + " " + r.status);
      return r.json();
    });
  }
  var ready = loadJSON("content/settings.json").then(function (j) {
    S = Object.assign(S, j);
    try { var ob = JSON.parse(localStorage.getItem("fi_ov_booking") || "null"); if (ob) S.booking = Object.assign({}, S.booking, ob.booking || ob); } catch (e) {}
    document.documentElement.dataset.ready = "1";
    applyContact(); return S;
  }).catch(function () { document.documentElement.dataset.ready = "empty"; return S; });

  function applyContact() {
    var c = S.contact || {};
    $$("[data-wa]").forEach(function (a) { a.href = "https://wa.me/" + (c.whatsapp || "").replace(/\D/g, "") + "?text=" + encodeURIComponent(a.dataset.msg || "Assalamualaikum — I would like to book a sales performance call."); });
    $$("[data-tel]").forEach(function (a) { a.href = "tel:+" + (c.whatsapp || "").replace(/\D/g, ""); });
    $$("[data-mail]").forEach(function (a) { if (c.email) a.href = "mailto:" + c.email + "?subject=" + encodeURIComponent(a.dataset.sub || "Training enquiry"); });
    $$("[data-lin]").forEach(function (a) { if (c.linkedin) a.href = c.linkedin; });
    $$("[data-fb]").forEach(function (a) { if (c.facebook) a.href = c.facebook; });
  }

  /* ---------- i18n (classes in DOM + data-bn for JS-rendered) ---------- */
  var lang = LS.get("fi_lang", null) || S.lang.default;
  function setLang(l) {
    lang = l === "bn" ? "bn" : "en";
    var h = document.documentElement;
    h.setAttribute("lang", lang === "bn" ? "bn" : "en");
    h.dataset.lang = lang;
    LS.set("fi_lang", lang);
    $$("[data-lang]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.lang === lang)); });
    var t = document.querySelector("title");
    if (t && h.dataset.titleEn) { if (lang === "bn") { h.dataset.titleBnSaved = h.dataset.titleBnSaved || t.textContent; t.textContent = h.dataset.titleBn || t.textContent; } else if (h.dataset.titleBnSaved) t.textContent = h.dataset.titleBnSaved; }
    document.dispatchEvent(new CustomEvent("fi:lang", { detail: lang }));
    track("lang_" + lang);
  }
  function pick(o, base) { return lang === "bn" && o[base + "Bn"] ? o[base + "Bn"] : o[base + "En"] || o[base] || ""; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* ---------- theme ---------- */
  function setTheme(t) {
    var h = document.documentElement, all = (S.theme && S.theme.cycle) || ["light", "bright", "dark"];
    if (all.indexOf(t) < 0) t = "dark";
    h.dataset.theme = t; LS.set("fi_theme", t);
    $$("[data-theme-set]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.themeSet === t)); });
    var m = $('meta[name="theme-color"]'); if (m) m.content = t === "light" ? "#f6f4ef" : t === "bright" ? "#0a0f1e" : "#080c14";
    track("theme_" + t);
  }
  var prefersLight = matchMedia("(prefers-color-scheme: light)").matches;
  function initChrome() {
    setTheme(LS.get("fi_theme", null) || (S.theme && S.theme.default) || (prefersLight ? "light" : "dark"));
    setLang(LS.get("fi_lang", null) || S.lang.default);
    $$("[data-theme-set]").forEach(function (b) { b.addEventListener("click", function () { setTheme(b.dataset.themeSet); }); });
    $$("[data-lang]").forEach(function (b) { b.addEventListener("click", function () { setLang(b.dataset.lang); }); });
    var burger = $("#burger"), mnav = $("#mnav");
    if (burger && mnav) burger.addEventListener("click", function () {
      var on = mnav.classList.toggle("on"); burger.setAttribute("aria-expanded", String(on));
    });
    // current page in nav
    $$("nav a[href]").forEach(function (a) {
      if (a.getAttribute("href").replace(/^\.\//, "") === location.pathname.split("/").pop() && location.pathname !== "/") a.setAttribute("aria-current", "page");
    });
  }

  /* ---------- funnel tracking ---------- */
  var ev = LS.get("fi_ev", []);
  function track(name, d) {
    var e = { t: name, ts: Date.now(), d: d || null, p: location.pathname };
    ev.push(e); if (ev.length > 120) ev = ev.slice(-120);
    LS.set("fi_ev", ev);
    var q = new URLSearchParams(location.search);
    if (S.admin && S.admin.endpoint && navigator.sendBeacon) { try { navigator.sendBeacon(S.admin.endpoint, JSON.stringify({ kind: "event", event: e, to: q.get("to") || "" })); } catch (x) {} }
    paintDbg();
  }
  function paintDbg() {
    var box = $("#dbg"); if (!box || !box.classList.contains("on")) return;
    box.innerHTML = "<div><span>events</span><b>" + ev.length + "</b></div>" +
      ev.slice(-7).reverse().map(function (e) { return "<div><span>" + e.t + "</span><b>" + new Date(e.ts).toLocaleTimeString() + "</b></div>"; }).join("");
  }
  if (location.search.indexOf("debug=1") > -1) { var b = $("#dbg"); if (b) { b.classList.add("on"); paintDbg(); } }

  /* ---------- reveal + counters + 3d funnel ---------- */
  function observe() {
    if (!("IntersectionObserver" in window)) { $$("[data-rev],.mask,.pyr").forEach(function (e) { e.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target; el.classList.add("in"); io.unobserve(el);
        if (el.dataset.cue) track("cue_" + el.dataset.cue, el.dataset.meta ? JSON.parse(el.dataset.meta) : null);
        $$("[data-count]", el).concat(el.hasAttribute("data-count") ? [el] : []).forEach(count);
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.12 });
    $$("[data-rev],[data-cue],.mask,.pyr,[data-obs]").forEach(function (el) { io.observe(el); });
  }
  function count(el) {
    if (el.dataset.done) return; el.dataset.done = 1;
    var to = parseFloat(el.dataset.count), pre = el.dataset.pre || "", suf = el.dataset.suf || "", dec = el.dataset.dec | 0;
    var loc = lang === "bn" ? "bn-BD" : "en-US";
    var fmt = function (v) { return v.toLocaleString(loc, { minimumFractionDigits: dec, maximumFractionDigits: dec }); };
    if (R || !to) { el.textContent = pre + fmt(to) + suf; return; }
    var t0 = 0, dur = +(el.dataset.dur || 1500);
    (function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = pre + fmt(to * e) + suf;
      if (p < 1) requestAnimationFrame(step);
    })(0);
  }
  function stagger() {
    $$("[data-stagger]").forEach(function (p) {
      $$("[data-rev]", p).forEach(function (el, i) { el.style.setProperty("--d", i * 70 + "ms"); });
      $$(".mask", p).forEach(function (el, i) { el.style.setProperty("--d", i * 90 + "ms"); });
    });
  }

  /* ---------- 3D tilt (pointer only) ---------- */
  function tilt() {
    if (!matchMedia("(pointer:fine)").matches || R) return;
    $$(".tilt").forEach(function (el) {
      var f = raf(function (e) {
        var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        el.style.setProperty("--ry", (x * 14).toFixed(2) + "deg"); el.style.setProperty("--rx", (-y * 12).toFixed(2) + "deg");
      });
      el.addEventListener("pointermove", f);
      el.addEventListener("pointerleave", function () { el.style.setProperty("--ry", "0deg"); el.style.setProperty("--rx", "0deg"); });
    });
    var spot = $(".grain");
    $$(".btn").forEach(function (b) {
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.setProperty("--mx", (e.clientX - r.left) + "px"); b.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
      void spot;
    });
  }

  /* ---------- nav: progress, shrink, dock, active ---------- */
  function chromeScroll() {
    var bar = $(".prog"), dock = $(".dock");
    var f = raf(function () {
      var h = document.documentElement.scrollHeight - innerHeight, y = scrollY;
      if (bar) bar.style.width = (h > 0 ? y / h * 100 : 0).toFixed(2) + "%";
      if (dock) dock.classList.toggle("up", y > innerHeight * .8 && y < h - innerHeight * .5);
    });
    addEventListener("scroll", f, { passive: true }); f();
  }

  /* ---------- marquee seamless ---------- */
  function marquees() { $$(".ticker>div").forEach(function (d) { d.innerHTML += d.innerHTML; }); }

  /* ---------- gallery lightbox ---------- */
  function lightbox() {
    var gal = $(".gal"); if (!gal) return;
    var lb = document.createElement("div"); lb.className = "lb";
    lb.innerHTML = '<div style="max-width:min(1100px,92vw)"><img alt=""><p class="cap"></p></div>' +
      '<button class="nav-b prev" aria-label="Previous">←</button><button class="nav-b next" aria-label="Next">→</button><button aria-label="Close">✕</button>';
    document.body.appendChild(lb);
    var img = $("img", lb), cap = $(".cap", lb), list = [], n = 0;
    function open(i) { n = i; render(); lb.classList.add("on"); document.body.style.overflow = "hidden"; }
    function render() { var f = list[n]; img.src = f.querySelector("img").src; cap.textContent = (f.dataset.caption || "") + "  ·  " + (n + 1) + "/" + list.length; }
    function close() { lb.classList.remove("on"); document.body.style.overflow = ""; }
    gal.addEventListener("click", function (e) {
      var f = e.target.closest("figure"); if (!f) return;
      list = $$(".gal figure"); open(list.indexOf(f)); track("gallery_open", { i: n });
    });
    lb.addEventListener("click", function (e) {
      if (e.target === lb || e.target.textContent === "✕") return close();
      if (e.target.classList.contains("next")) { n = (n + 1) % list.length; render(); }
      if (e.target.classList.contains("prev")) { n = (n - 1 + list.length) % list.length; render(); }
    });
    addEventListener("keydown", function (e) {
      if (!lb.classList.contains("on")) return;
      if (e.key === "Escape") close(); if (e.key === "ArrowRight") { n = (n + 1) % list.length; render(); }
      if (e.key === "ArrowLeft") { n = (n - 1 + list.length) % list.length; render(); }
    });
    lb.close = close;
  }

  /* ---------- download helper (checklists, reports, .ics) ---------- */
  function download(name, text, type) {
    var b = new Blob([text], { type: type || "text/plain;charset=utf-8" }), u = URL.createObjectURL(b);
    var a = document.createElement("a"); a.href = u; a.download = name; a.click();
    setTimeout(function () { URL.revokeObjectURL(u); }, 4000); track("download_" + name);
  }
  function toast(msg) {
    var t = $("#toast");
    if (!t) { t = document.createElement("div"); t.id = "toast"; document.body.appendChild(t);
      t.style.cssText = "position:fixed;left:50%;bottom:26px;transform:translateX(-50%) translateY(20px);z-index:99;" +
        "background:var(--accent);color:var(--ink);padding:12px 18px;border-radius:999px;font-weight:600;font-size:.9rem;" +
        "box-shadow:var(--shadow);opacity:0;transition:.4s cubic-bezier(.16,1,.3,1)"; }
    t.textContent = msg; t.style.opacity = 1; t.style.transform = "translateX(-50%)";
    clearTimeout(toast.x); toast.x = setTimeout(function () { t.style.opacity = 0; t.style.transform = "translateX(-50%) translateY(20px)"; }, 2600);
  }
  function copy(txt) {
    (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(function () { toast("copied ✓"); }, function () { toast("press Ctrl/⌘+C"); });
  }

  /* ---------- lead + appointment store (shared by diagnostic/booking/admin) ---------- */
  var DB = {
    all: function (k) { return LS.get("fi_" + k, []); },
    add: function (k, o) { var a = DB.all(k); o.id = (o.id || Date.now().toString(36)); a.unshift(o); LS.set("fi_" + k, a.slice(0, 400)); push(k, o); return o; },
    put: function (k, a) { LS.set("fi_" + k, a); },
    del: function (k, id) { DB.put(k, DB.all(k).filter(function (x) { return String(x.id) !== String(id); })); }
  };
  function push(kind, payload) {
    if (!S.admin || !S.admin.endpoint) return;
    fetch(S.admin.endpoint, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" }, body: JSON.stringify({ kind: kind, at: new Date().toISOString(), data: payload }) }).catch(function () {});
  }

  /* ---------- boot ---------- */
  function boot() { initChrome(); observe(); stagger(); tilt(); chromeScroll(); marquees(); lightbox(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  ready.then(function () { document.dispatchEvent(new CustomEvent("fi:ready")); applyContact(); });

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () {}); });
  }

/* ── reading progress (#rp) + magnetic CTA light ───────────────────────── */
  (function(){
    var rp = $("#rp"), raf = 0;
    if (rp){
      var tick=function(){raf=0;if(!rp)return;var h=document.documentElement,d=h.scrollHeight-innerHeight;
        rp.style.setProperty("--w",(d>0?Math.min(100,Math.max(0,h.scrollTop/d*100)):0)+"%");};
      addEventListener("scroll",function(){if(!raf)raf=requestAnimationFrame(tick)},{passive:true});tick();
    }
    if (matchMedia("(hover:hover)").matches && !matchMedia("(prefers-reduced-motion:reduce)").matches){
      $$(".magnetic").forEach(function(el){
        el.addEventListener("pointermove",function(e){var r=el.getBoundingClientRect();
          el.style.setProperty("--mx",((e.clientX-r.left)/r.width*100)+"%");
          el.style.setProperty("--my",((e.clientY-r.top)/r.height*100)+"%");});
      });
    }
  })();

  return {
    S: S, ready: ready, loadJSON: loadJSON, url: url, $: $, $$: $$, LS: LS, esc: esc, pick: pick, lang: function () { return lang; },
    setLang: setLang, setTheme: setTheme, reduced: R, track: track, DB: DB, toast: toast, copy: copy, download: download, observe: observe,
    money: function (n) { return "৳" + Number(n || 0).toLocaleString(lang === "bn" ? "bn-BD" : "en-US"); },
    date: function (s, o) { try { return new Date(s).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-GB", o || { day: "numeric", month: "short", year: "numeric" }); } catch (e) { return s; } },
    fmt: function (n, d) { return Number(n || 0).toLocaleString(lang === "bn" ? "bn-BD" : "en-US", { maximumFractionDigits: d || 0 }); }
  };
})();
