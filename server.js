const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 80;
const SECRETS_DIR = process.env.SECRETS_DIR || "/mnt/secrets";

const readSecrets = () => {
  try {
    if (!fs.existsSync(SECRETS_DIR)) return { _status: "no-dir", _msg: `${SECRETS_DIR} not found` };
    const files = fs.readdirSync(SECRETS_DIR).filter(f => fs.statSync(path.join(SECRETS_DIR, f)).isFile());
    if (!files.length) return { _status: "empty", _msg: "No secrets mounted" };
    const secrets = {};
    for (const f of files) secrets[f] = fs.readFileSync(path.join(SECRETS_DIR, f), "utf-8").trim();
    return secrets;
  } catch (e) { return { _status: "error", _msg: e.message }; }
};

const indexHtml = fs.readFileSync(path.join(__dirname, "index.html"), "utf-8");

http.createServer((req, res) => {
  if (req.url === "/healthz") { res.writeHead(200); res.end("ok"); return; }
  if (req.url === "/api/secrets") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(readSecrets(), null, 2));
    return;
  }
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(indexHtml);
}).listen(PORT, () => console.log(`test-app listening on :${PORT}`));
