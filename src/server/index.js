import http from "http";

const PORT = process.env.PORT || 3000;
const store = new Map();

function isExpired(expireAt) {
  return Date.now() > expireAt;
}

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "POST" && req.url === "/api/store") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const { id, payload, ttl } = JSON.parse(body);
        
        if (!id || !payload) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Missing required fields: id and payload" }));
          return;
        }

        const expireAt = Date.now() + (ttl || 3600) * 1000;
        store.set(id, { payload, expireAt });

        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, id }));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON payload format" }));
      }
    });
    return;
  }

  if (req.method === "GET" && req.url.startsWith("/api/fetch/")) {
    const id = req.url.split("/").pop();
    const data = store.get(id);

    if (!data) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Payload not found or expired" }));
      return;
    }

    if (isExpired(data.expireAt)) {
      store.delete(id);
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Payload has expired" }));
      return;
    }

    store.delete(id);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ payload: data.payload }));
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Route not found" }));
});

setInterval(() => {
  for (const [id, data] of store.entries()) {
    if (isExpired(data.expireAt)) {
      store.delete(id);
    }
  }
}, 60000);

server.listen(PORT, () => {
  console.log(`GhostShare server running on port ${PORT}`);
});