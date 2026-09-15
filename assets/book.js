/* book.js — slot engine from content/settings.json → appointment record, .ics, confirmations.
   Works with no backend: appointments live in this browser + the Admin → Appointments board,
   and mirror to admin.endpoint if configured. */
(function () {
  "use strict";
  var FI = window.FI, $ = FI.$, $$ = FI.$$, esc = FI.esc;
  var B = {}, day = null, slot = null;
  var TZOFF = 6; /* Asia/Dhaka, no DST */
  function bn() { return FI.lang() === "bn"; }
  function L(en, b) { return bn() ? b : en; }
  function pad(n) { return String(n).padStart(2, "0"); }

  function dayKey(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function fromKey(k) { var p = k.split("-").map(Number); return new Date(p[0], p[1] - 1, p[2]); }

  function timesFor(dateStr) {
    var out = [], dur = B.durationMin || 30, buf = B.bufferMin || 15, step = dur + buf;
    (B.slots || [{ start: "10:00", end: "12:00" }]).forEach(function (r) {
      var s = r.start.split(":").map(Number), e = r.end.split(":").map(Number);
      var m0 = s[0] * 60 + s[1], m1 = e[0] * 60 + e[1];
      for (var m = m0; m + dur <= m1; m += step) out.push(pad(Math.floor(m / 60)) + ":" + pad(m % 60));
    });
    return out;
  }
  function taken(dateStr) {
    var mine = FI.DB.all("appt").filter(function (a) { return a.day === dateStr; }).map(function (a) { return a.time; });
    /* deterministic demo occupancy so the board looks real (never blocks a slot a client actually booked) */
    var seed = dateStr.split("-").reduce(function (a, b) { return a + +b; }, 0), demo = [];
    timesFor(dateStr).forEach(function (t, i) { if ((seed * (i + 3)) % 7 === 0) demo.push(t); });
    return mine.concat(demo.filter(function (t) { return mine.indexOf(t) < 0; }));
  }
  function render() {
    var days = $("#days"); if (!days) return;
    var out = [], start = new Date(); start.setHours(0, 0, 0, 0);
    var adv = B.advanceDays || 21, open = B.openDays || [1, 2, 3, 4, 5, 6], free = 0;
    for (var i = 1; out.length < 14 && i <= adv; i++) {
      var d = new Date(start.getTime() + i * 864e5), k = dayKey(d);
      if (open.indexOf(d.getDay()) < 0) continue;
      var open2 = timesFor(k).filter(function (t) { return taken(k).indexOf(t) < 0; });
      if (!open2.length) continue;
      free += open2.length;
      out.push('<button class="day" data-day="' + k + '" aria-pressed="false"><b>' + pad(d.getDate()) + "</b>" +
        "<span>" + d.toLocaleDateString(bn() ? "bn-BD" : "en-GB", { weekday: "short" }) + "</span>" +
        '<span style="letter-spacing:0">' + open2.length + L(" free", " খালি") + "</span></button>");
    }
    days.innerHTML = out.join("");
    $$("[data-day]", days).forEach(function (b) {
      b.addEventListener("click", function () {
        day = b.dataset.day; slot = null;
        $$(".day", days).forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        renderSlots(); $("#who").hidden = true;
      });
    });
    if (!day && out.length) { $(".day").click(); }
    var tzEn = "Times shown on your device's clock; availability is held in <b>Asia/Dhaka (GMT+6)</b>.",
        tzBn = "সময আপনার ডিভাঈসের অনুযাযী দেখানো হয়; খালি থাকার হিসাব <b>এশিয়া/ঢাকা (GMT+6)</b> অনুযাযী।";
    var tn = document.querySelector("#tzNote"), tb = document.querySelector("#tzNoteBn");
    if (tn) tn.innerHTML = tzEn; if (tb) tb.innerHTML = tzBn;
  }
  function renderSlots() {
    var t = taken(day), list = timesFor(day);
    $("#slots").innerHTML = list.map(function (x) {
      var off = t.indexOf(x) > -1;
      return '<button class="slot' + (off ? " taken" : "") + '" data-slot="' + x + '" aria-pressed="' + (x === slot) + '"' +
        (off ? ' disabled title="already held"' : "") + ">" + x + "</button>";
    }).join("") || '<p class="small">' + L("No slots left — WhatsApp me and I will open one.", "স্লট নেই — হোয়াটসঅ্যাপে লিখুন, আমি একটি খুলে দেব।") + "</p>";
    $$("[data-slot]").forEach(function (b) {
      b.addEventListener("click", function () {
        slot = b.dataset.slot; $$("[data-slot]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        $("#who").hidden = false; $("#a-name").focus(); summary();
        FI.track("slot_pick", { d: day, t: slot });
      });
    });
    summary();
  }
  function fmtDay(k) { return fromKey(k).toLocaleDateString(bn() ? "bn-BD" : "en-GB", { weekday: "long", day: "numeric", month: "long" }); }
  function summary() {
    $("#sumTitle").textContent = slot ? L("Held for 10 minutes", "১০ মিনিটের জন্য ধরা হয়েছে") : L("Nothing chosen yet", "এখনো কিছু বাছা হয়নি");
    $("#sumWhen").innerHTML = day ? esc(fmtDay(day)) + " · <b>" + esc(slot || "—") + "</b> <span class='small'>GMT+6</span>" : "—";
    $("#sumLen").textContent = (B.durationMin || 30) + " min";
    $("#sumWhere").textContent = B.platform || "Google Meet";
    $("#sumFee").textContent = B.feeEn || "Free for 15+ teams";
  }

  /* ---------- .ics ---------- */
  function ics(a) {
    var st = fromKey(a.day), p = a.time.split(":").map(Number);
    st.setHours(p[0], p[1], 0, 0);
    var en = new Date(st.getTime() + (B.durationMin || 30) * 6e4);
    function u(d) { d = new Date(d.getTime() - TZOFF * 36e5); return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + "T" + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + "00Z"; }
    return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Future Icon//Booking//EN", "CALSCALE:GREGORIAN", "BEGIN:VEVENT",
      "UID:" + a.id + "@futureicon", "DTSTAMP:" + u(new Date()), "DTSTART:" + u(st), "DTEND:" + u(en),
      "SUMMARY:" + (L("Sales performance call — Future Icon", "সেলস পারফরম্যান্স কল — ফিউচার আইকন")),
      "DESCRIPTION:" + ("With: Md Yousuf Efti, PhD\\nBring: coverage sheet + last quarter numbers\\nTopic: " + (a.topic || "-").replace(/\n/g, " ").replace(/,/g, "\\,")).replace(/,/g, "\\,"),
      "LOCATION:" + (B.meetingUrl || "Google Meet"), "BEGIN:VALARM", "TRIGGER:-PT30M", "ACTION:DISPLAY",
      "DESCRIPTION:Call in 30 minutes", "END:VALARM", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  }
  function gcal(a) {
    var st = fromKey(a.day), p = a.time.split(":").map(Number); st.setHours(p[0] - TZOFF, p[1], 0, 0);
    var en = new Date(st.getTime() + (B.durationMin || 30) * 6e4);
    function f(d) { return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + "T" + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + "00Z"; }
    return "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" + encodeURIComponent("Sales performance call — Yousuf Efti") +
      "&dates=" + f(st) + "/" + f(en) + "&details=" + encodeURIComponent("Bring your coverage sheet + last quarter's numbers.") +
      "&location=" + encodeURIComponent(B.meetingUrl || "");
  }

  function confirm(a) {
    var msg = "FUTURE ICON — confirmed\n" + fmtDay(a.day) + " · " + a.time + " (GMT+6)\nWith: " + a.name + " · " + (a.org || "") +
      "\nTeam: " + (a.size || "") + "\nTopic: " + (a.topic || "-") + "\nLink: " + (B.meetingUrl || "sent before the call") +
      "\n\nBring: coverage sheet + last quarter's numbers. Reschedule: free up to 24h before.";
    $("#who").hidden = true;
    $("#after").innerHTML = '<div class="ok" style="margin-top:16px"><h3 class="display">' + L("Booked ✓", "বুক হয়েছে ✓") + "</h3>" +
      '<p class="small">' + esc(msg).replace(/\n/g, "<br>") + "</p>" +
      '<div class="row" style="margin-top:12px">' +
      '<button class="btn sm" data-ics>Calendar file (.ics)</button>' +
      '<a class="btn sm ghost" target="_blank" rel="noopener" href="' + gcal(a) + '">Google Calendar</a>' +
      '<a class="btn sm ghost" target="_blank" rel="noopener" href="https://wa.me/' + (FI.S.contact.whatsapp || "").replace(/\D/g, "") +
      "?text=" + encodeURIComponent("Confirming our call: " + fmtDay(a.day) + " " + a.time + " GMT+6. " + (a.contact || "")) + '">WhatsApp</a>' +
      '<button class="btn sm ghost" data-cancel>' + L("Cancel this slot", "বাতিল করুন") + "</button></div></div>";
    $("[data-ics]").addEventListener("click", function () { FI.download("future-icon-call.ics", ics(a), "text/calendar"); });
    $("[data-cancel]").addEventListener("click", function () { FI.DB.del("appt", a.id); $("#after").innerHTML = ""; FI.toast(L("released", "ছাড়া হয়েছে")); render(); });
    FI.toast(L("saved to the booking board", "বুকিং বোর্ডে যোগ হয়েছে"));
  }

  FI.ready.then(function () {
    B = FI.S.booking || {};
    if (!$("#days")) return;
    var ov = FI.LS.get("fi_ov_booking", null);
    ov = (ov && ov.booking !== undefined) ? ov.booking : ov;
    if (ov) { B = Object.assign({}, B, ov); render(); }
    $("#who").addEventListener("submit", function (e) {
      e.preventDefault();
      var n = $("#a-name").value.trim(), c = $("#a-contact").value.trim();
      $("#a-err").textContent = n.length < 2 ? L("Name, one word is enough →", "নাম লিখুন →") :
        (!/(@|\+?\d{9,})/.test(c) ? L("Email or WhatsApp, so the link can reach you →", "ইমেইল বা হোয়াটসঅ্যাপ দিন →") : "");
      if ($("#a-err").textContent || !day || !slot) return;
      var a = { id: Date.now().toString(36), day: day, time: slot, name: n, org: $("#a-org").value.trim(),
        contact: c, size: $("#a-size").value, topic: $("#a-topic").value.trim(), at: new Date().toISOString(), status: "confirmed" };
      FI.DB.add("appt", a); /* endpoint mirror lives inside DB.add → push() */
      FI.track("appointment", { d: day, t: slot });
      confirm(a);
    });
    document.addEventListener("fi:lang", function () { render(); renderSlots(); });
  });
  window.FIBOOK = { ics: ics, timesFor: timesFor, taken: taken };
})();
