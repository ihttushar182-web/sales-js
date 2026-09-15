/* sw.js — offline-fast, network-first for content so edits land immediately */
var C = "fi-v3";
var PRE = ["./", "index.html", "diagnostic.html", "courses.html", "blog.html", "gallery.html", "book.html",
  "assets/site.css", "assets/app.js", "assets/render.js", "assets/diagnostic.js", "assets/diagnostic.js",
  "assets/favicon.svg", "content/settings.json"];
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(C).then(function (c) { return c.addAll(PRE); }).catch(function () {}));
  self.skipWaiting();
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (k) { return Promise.all(k.filter(function (x) { return x !== C; }).map(function (x) { return caches.delete(x); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  var u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  var json = /\.json$/.test(u.pathname);
  e.respondWith(
    fetch(e.request).then(function (r) {
      if (r.ok) { var cp = r.clone(); caches.open(C).then(function (c) { c.put(e.request, cp); }); }
      return r;
    }).catch(function () { return caches.match(e.request).then(function (m) { return m || caches.match("index.html"); }); })
  );
});
