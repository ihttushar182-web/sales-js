/* ==========================================================================
   sales-js · funnel.js — the 4-step diagnostic funnel (Structure B)
   Qualify → quantify → score → convert. Pure JS, works with no backend.
   ========================================================================== */
(function () {
  "use strict";
  var R = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var track = window.sjTrack || function () {};

  var form = $("#qform"); if (!form) return;
  var panes = $$(".pane", form), i = 0;
  var rail = $("#railFill"), stepNow = $("#stepNow"), stepOf = $("#stepOf");

  /* ---------- nav between steps ---------- */
  function show(n) {
    i = Math.max(0, Math.min(panes.length - 1, n));
    panes.forEach(function (p, k) { p.classList.toggle("on", k === i); });
    if (rail) rail.style.width = (((i + 1) / panes.length) * 100) + "%";
    if (stepNow) stepNow.textContent = String(i + 1).padStart(2, "0");
    if (stepOf) stepOf.textContent = String(panes.length).padStart(2, "0");
    $$(".qbox .steps b").forEach(function (b, k) {
      b.parentElement.classList.toggle("done", k <= i);
    });
    var h = $$("h2", panes[i])[0];
    if (h) h.setAttribute("tabindex", "-1"), h.focus({ preventScroll: true });
    var box = form.closest(".qbox");
    if (box && i > 0) {
      var r = box.getBoundingClientRect();
      if (r.top < 0 || r.top > innerHeight * .5) scrollTo({ top: scrollY + r.top - 20, behavior: R ? "auto" : "smooth" });
    }
    track("step_" + (i + 1));
  }
  $$("[data-next]", form).forEach(function (b) { b.addEventListener("click", function () { if (valid(panes[i])) show(i + 1); }); });
  $$("[data-prev]", form).forEach(function (b) { b.addEventListener("click", function () { show(i - 1); }); });
  form.addEventListener("keydown", function (e) { if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") { e.preventDefault(); (i < panes.length - 1 ? show(i + 1) : finish()); } });

  /* ---------- validation (light, human) ---------- */
  function valid(pane) {
    var err = $(".err", pane); if (err) err.textContent = "";
    var need = $$("[data-req]", pane);
    for (var n = 0; n < need.length; n++) {
      var f = need[n];
      var ok = f.type === "radio" || f.type === "checkbox"
        ? !!pane.querySelector('[name="' + f.name + '"]:checked')
        : f.value.trim().length > 1;
      if (!ok) {
        if (err) err.textContent = f.dataset.msg || "Pick one to continue →";
        var first = pane.querySelector('[name="' + f.name + '"]'); if (first) first.focus();
        if (pane.animate && !R) pane.animate([{ transform: "translateX(0)" }, { transform: "translateX(-7px)" }, { transform: "translateX(6px)" }, { transform: "translateX(0)" }], { duration: 260 });
        return false;
      }
    }
    return true;
  }

  /* ---------- live readouts: money already leaking ---------- */
  var money = $("#leakNow");
  function moneyCalc() {
    var leads = +$("#f-leads").value, conv = +$("#f-conv").value, ticket = +$("#f-ticket").value;
    var cur = $("#f-cur") ? $("#f-cur").value : "৳";
    var monthly = leads * conv / 100 * ticket;
    var target = leads * Math.min(conv * 2, 12) / 100 * ticket; // realistic lift ceiling 12%
    var gap = Math.max(0, target - monthly);
    var txt = function (v) { return cur + Math.round(v).toLocaleString(); };
    if (money) money.textContent = gap > 0 ? cur + Math.round(gap).toLocaleString() + "/mo already leaving" : "no material leak at these numbers";
    set("m-now", txt(monthly)); set("m-tgt", txt(target)); set("m-gap", cur + Math.round(gap).toLocaleString());
    return { cur: cur, monthly: monthly, target: target, gap: gap, leads: leads, conv: conv, ticket: ticket };
  }
  function set(id, v) { var el = document.getElementById(id); if (el) el.textContent = v; }
  $$('input[type=range]', form).forEach(function (r) { r.addEventListener("input", moneyCalc); });
  if ($("#f-cur")) $("#f-cur").addEventListener("change", moneyCalc);

  /* ---------- scoring ---------- */
  function score(m) {
    var s = 30, why = [];
    var stage = (form.querySelector('[data-group="stage"]:checked') || {}).value || "";
    var breakpt = (form.querySelector('[data-group="break"]:checked') || {}).value || "";
    var hasPage = !!form.querySelector('[data-group="have"][value="page"]:checked');
    if (m.conv < 2) { s += 18; why.push("lead→sale conversion under 2%"); }
    else if (m.conv < 5) { s += 10; why.push("conversion under the 5% median"); }
    else { s -= 4; why.push("conversion is already above median — the fix is volume + price, not copy"); }
    if (!hasPage) { s += 14; why.push("no dedicated one-way landing page for outbound traffic"); }
    if (breakpt === "trust") { s += 12; why.push("traffic arrives but does not believe yet"); }
    if (breakpt === "offer") { s += 12; why.push("interest exists but the offer is unclear/priced wrong"); }
    if (breakpt === "traffic") { s += 6; why.push("top-of-funnel starvation"); }
    if (breakpt === "followup") { s += 14; why.push("leads go cold — no 7-touch follow-up system"); }
    if (m.ticket < 20000) { s += 6; why.push("ticket size limits how much can be spent per acquisition"); }
    if (stage === "solo") { s += 4; }
    if (stage === "scale") { s -= 6; }
    s = Math.max(12, Math.min(94, s));
    return { s: s, why: why, stage: stage, breakpt: breakpt, hasPage: hasPage };
  }

  var VERDICT = {
    hi: ["Built, under-extracted", "Your funnel works but it is under-priced and under-captured. We widen ticket + retention first."],
    mid: ["Visible, not believed", "People find you, then stall. Positioning and proof placement are the cheapest revenue you have."],
    lo: ["Leaking at every seam", "Attention is arriving with nowhere to land. We build the one-way page, then the follow-up system."]
  };
  function fixes(r, m) {
    var out = [];
    var f = {
      trust: ["Put the proof where the doubt is", "Re-order your page so a named outcome + 3 quantified results appear before any bio. Trust is a sequence problem, not a branding problem."],
      offer: ["Turn workshops into a ladder", "One entry offer, one core offer, one retainer. Priced per outcome, not per day, so a bad month for you is not a bad month for them."],
      traffic: ["Warm the 48k before you chase the 480", "A weekly DM-to-post loop with one measurable per-post CTA. Same audience, new destination URL, tracked."],
      followup: ["Install the 7-touch spine", "Reply → 24h recap → day-3 case → day-7 invite → day-14 audit offer → day-30 value → day-45 archive. No lead dies in silence."]
    };
    (r.breakpt && f[r.breakpt] ? [f[r.breakpt]] : []).forEach(function (x) { out.push(x); });
    if (!r.hasPage) out.push(["Ship a one-way page for every outbound message", "Every DM you send should land on a page with one link out. That single change moves reply→call rates more than any redesign."]);
    out.push(["Instrument before you optimise", "Page-view, stage-scroll, CTA-click, submit. If a number is not measured, it is a story."]);
    out.push(["Price the outcome, not the hours", "Move your core offer to a fixed-scope sprint with a 45-day benchmark clause. It converts fear into a decision."]);
    return out.slice(0, 3);
  }

  /* ---------- submit + result render ---------- */
  function finish() {
    if (!valid(panes[panes.length - 1])) return;
    var m = moneyCalc();
    var r = score(m);
    var name = ($("#f-name").value || "there").trim().split(" ")[0];
    var contact = ($("#f-contact").value || "").trim();
    var band = r.s >= 66 ? "hi" : r.s >= 40 ? "mid" : "lo";
    var v = VERDICT[band];

    // fill the DOM
    set("r-name", name); set("r-score", r.s); set("r-verdict", v[0]); set("r-blurb", v[1]);
    set("r-gap", m.cur + Math.round(m.gap).toLocaleString());
    set("r-now", m.cur + Math.round(m.monthly).toLocaleString());
    set("r-target", m.cur + Math.round(m.target).toLocaleString());
    $("#r-fixes").innerHTML = fixes(r, m).map(function (x, k) {
      return "<li><span class='n'>" + (k + 1) + "</span><div><b>" + x[0] + "</b><p>" + x[1] +
        "</p><small>impact window: " + ["72 hours", "14 days", "30 days"][k] + "</small></div></li>";
    }).join("");
    var whyTxt = r.why.length ? r.why.join(" · ") : "no major leaks detected";
    var summary = [
      "BRAND FUNNEL AUDIT — " + name + " (" + new Date().toLocaleDateString() + ")",
      "Score: " + r.s + "/100 — " + v[0],
      "Leads/mo: " + m.leads + " · conv: " + m.conv + "% · ticket: " + m.cur + m.ticket.toLocaleString(),
      "Monthly now: " + m.cur + Math.round(m.monthly).toLocaleString() + " → realistic: " + m.cur + Math.round(m.target).toLocaleString() + " (+" + m.cur + Math.round(m.gap).toLocaleString() + "/mo)",
      "Break point: " + (r.breakpt || "unspecified") + " · stage: " + (r.stage || "unspecified"),
      "Category: " + (($("#f-cat") && $("#f-cat").value) || "—") + " · best window: " + (($("#f-when") && $("#f-when").value) || "—"),
      "Client note: " + (($("#f-note") && $("#f-note").value) || "—"),
      "Signals: " + whyTxt,
      "Contact: " + contact
    ].join("\n");
    $("#r-summary").value = summary;

    // animate the gauge
    var arc = $("#arc");
    if (arc) {
      var C = 2 * Math.PI * 84;
      arc.setAttribute("stroke-dasharray", C);
      arc.setAttribute("stroke-dashoffset", C);
      arc.classList.toggle("good", band === "hi");
      requestAnimationFrame(function () { arc.style.strokeDashoffset = C * (1 - r.s / 100); });
    }

    // hand-off links
    var wa = $("#r-wa"), mail = $("#r-mail");
    if (wa) wa.href = "https://wa.me/" + (SITE.whatsapp || "").replace(/\D/g, "") + "?text=" + encodeURIComponent(summary.slice(0, 700));
    if (mail) mail.href = "mailto:" + (SITE.email || "") + "?subject=" + encodeURIComponent("Audit result — " + name + " (" + r.s + "/100)") + "&body=" + encodeURIComponent(summary);

    $("#qbox").classList.add("hidden");
    $("#result").hidden = false;
    $("#result").classList.add("on");
    try { history.replaceState(null, "", "#result"); } catch (e) {}
    track("audit_complete", { score: r.s, gap: Math.round(m.gap) });

    var payload = { to: SITE.email, name: name, contact: contact, score: r.s, summary: summary };
    if (SITE.formEndpoint) {
      fetch(SITE.formEndpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        .then(function () { track("lead_sent"); })
        .catch(function () { track("lead_send_failed"); });
    }
    try { localStorage.setItem("sj_last_audit", summary); } catch (e) {}
  }
  $("#submitBtn") && $("#submitBtn").addEventListener("click", finish);

  /* prefill from a personalised outreach link: ?name=Yousuf&conv=1.5&leads=80 */
  (function prefill() {
    var q = new URLSearchParams(location.search);
    [["name", "#f-name"], ["contact", "#f-contact"], ["leads", "#f-leads"], ["conv", "#f-conv"], ["ticket", "#f-ticket"]].forEach(function (p) {
      if (q.get(p[0]) && $(p[1])) { $(p[1]).value = q.get(p[0]); $(p[1]).dispatchEvent(new Event("input", { bubbles: true })); }
    });
    if (q.get("break")) {
      var el = form.querySelector('[value="' + q.get("break") + '"]');
      if (el) { el.checked = true; el.dispatchEvent(new Event("change", { bubbles: true })); show(2); }
    }
  })();

  show(0); moneyCalc();
})();
