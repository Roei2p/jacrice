const http = require("http");
const path = require("path");
const { loadEnv } = require("./env");
const { sendWhatsAppMessage } = require("./green-api");

loadEnv(path.join(__dirname, ".env"));

const PORT = process.env.PORT || 3001;

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  if (req.method === "POST" && req.url === "/send") {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", async () => {
      let phone, message;
      try {
        ({ phone, message } = JSON.parse(body || "{}"));
      } catch {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Body must be valid JSON: {\"phone\": \"...\", \"message\": \"...\"}" }));
        return;
      }
      if (!phone || !message) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: 'Both "phone" and "message" are required.' }));
        return;
      }
      try {
        const result = await sendWhatsAppMessage(phone, message);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true, result }));
      } catch (err) {
        res.writeHead(502, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: 'Not found. POST /send {"phone", "message"} or GET /health' }));
});

server.listen(PORT, () => {
  console.log(`JACRICE WhatsApp sender listening on http://localhost:${PORT}`);
  console.log(`Test it:  curl -X POST http://localhost:${PORT}/send -H "Content-Type: application/json" -d '{"phone":"0501234567","message":"בדיקה"}'`);
});
