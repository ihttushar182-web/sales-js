#!/usr/bin/env node
/* tools/serve.js — the one command you need for editing.
     node tools/serve.js            → http://localhost:8000  (site + /admin.html)
   It serves the folder and accepts PUT /__save from the admin boards, so edits
   write straight back into content/*.json on your disk. No database, no build,
   no framework — and nothing is writable when the token is wrong.
   Deploy by committing; on a host there is no write access, so the boards fall
   back to JSON export (or to the Google Apps Script endpoint in settings).     */
const http = require("http"), fs = require("fs"), path = require("path"), url = require("url");
const ROOT = path.resolve(__dirname, "..");
const TOKEN = process.env.FI_TOKEN || "dev";
const MIME = { ".html": "text/html;charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json",
  ".svg": "image/svg+xml", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp",
  ".xml": "application/xml", ".txt": "text/plain", ".webmanifest": "application/manifest+json", ".ics": "text/calendar" };

http.createServer(function (req, res) {
  var u = url.parse(req.url, true), p = decodeURIComponent(u.pathname);

  if (p === "/__save" && req.method === "PUT") {
    if (u.query.t !== TOKEN) { res.writeHead(403); return res.end("bad token"); }
    var body = "";
    req.on("data", function (c) { body += c; if (body.length > 4e6) req.destroy(); });
    req.on("end", function () {
      try {
        var j = JSON.parse(body), file = path.join(ROOT, "content", path.basename(j.file));
        if (!/^content\/[\w.-]+\.json$/.test(path.relative(ROOT, file))) throw new Error("refused: " + j.file);
        JSON.parse(j.json);                                  /* never write broken JSON */
        fs.writeFileSync(file, j.json.replace(/\r?\n$/, "") + "\n");
        console.log("  saved " + path.basename(file) + " (" + (j.json.length / 1024).toFixed(1) + " KB)");
        res.writeHead(200, { "Content-Type": "application/json" }); res.end('{"ok":true}');
      } catch (e) { res.writeHead(400, { "Content-Type": "application/json" }); res.end(JSON.stringify({ ok: false, error: String(e.message) })); }
    });
    return;
  }

  if (p === "/__ping") { res.writeHead(200, { "Content-Type": "application/json" }); return res.end(JSON.stringify({ ok: true, writable: true, token: TOKEN === "dev" ? "default-token-change-me" : "ok" })); }

  /* collect anything a visitor posts when no real endpoint is configured */
  if (p === "/__lead" && (req.method === "POST" || req.method === "OPTIONS")) {
    var b2 = ""; req.on("data", function (c) { b2 += c; });
    req.on("end", function () {
      try { fs.appendFileSync(path.join(ROOT, "content", "inbox.jsonl"), b2 + "\n"); } catch (e) {}
      res.writeHead(204, { "Access-Control-Allow-Origin": "*" }); res.end();
    });
    return;
  }

  var f = path.join(ROOT, p === "/" ? "index.html" : p);
  if (!f.startsWith(ROOT)) { res.writeHead(403); return res.end("nope"); }
  fs.readFile(f, function (e, d) {
    if (e) {
      if (!path.extname(f)) return fs.readFile(path.join(ROOT, "404.html"), function (e2, d2) { res.writeHead(404, { "Content-Type": "text/html" }); res.end(d2 || "not found"); });
      res.writeHead(404); return res.end("not found");
    }
    res.writeHead(200, { "Content-Type": MIME[path.extname(f)] || "application/octet-stream",
      "Cache-Control": /\.(json|html)$/.test(f) ? "no-cache" : "public, max-age=604800",
      "X-Content-Type-Options": "nosniff" });
    res.end(d);
  });
}).listen(8000, "0.0.0.0", function () {
  console.log("\n  Future Icon site → http://localhost:8000");
  console.log("  Boards           → http://localhost:8000/admin.html   (passphrase: efti2026-change-me)");
  console.log("  Saving to disk   → PUT /__save?t=" + TOKEN + "   (FI_TOKEN env to change)\n");
});
