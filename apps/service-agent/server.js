#!/usr/bin/env node
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createEmptyState, evaluateAll, ingestEvent, serializeState } from "../../packages/core/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");
const panelDir = path.join(root, "apps", "panel");
const port = Number(process.env.ZJ_PORT || 47831);
const stateFile = process.env.ZJ_STATE || path.join(root, "var", "state.json");
const state = loadState();

setInterval(() => {
  evaluateAll(state);
  saveState();
}, 5000).unref();

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "GET" && req.url === "/api/state") {
      return json(res, serializeState(state));
    }

    if (req.method === "POST" && req.url === "/api/events") {
      const body = JSON.parse(await readBody(req));
      const alerts = ingestEvent(state, body);
      saveState();
      return json(res, { ok: true, alerts });
    }

    if (req.method === "POST" && req.url === "/api/check-now") {
      const alerts = evaluateAll(state, { force: true });
      saveState();
      return json(res, { ok: true, alerts });
    }

    return serveStatic(req, res);
  } catch (err) {
    return json(res, { ok: false, error: err.message }, 500);
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Zhaoyao-Jing service listening on http://127.0.0.1:${port}`);
});

function loadState() {
  try {
    return JSON.parse(fs.readFileSync(stateFile, "utf8"));
  } catch {
    return createEmptyState();
  }
}

function saveState() {
  fs.mkdirSync(path.dirname(stateFile), { recursive: true });
  fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", chunk => data += chunk);
    req.on("end", () => resolve(data || "{}"));
    req.on("error", reject);
  });
}

function json(res, payload, status = 200) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type"
  });
  res.end(JSON.stringify(payload, null, 2));
}

function serveStatic(req, res) {
  const url = req.url === "/" ? "/index.html" : req.url;
  const file = path.normalize(path.join(panelDir, url));
  if (!file.startsWith(panelDir) || !fs.existsSync(file)) {
    res.writeHead(404);
    res.end("not found");
    return;
  }
  const ext = path.extname(file);
  const type = ext === ".js" ? "text/javascript" : ext === ".css" ? "text/css" : "text/html";
  res.writeHead(200, { "content-type": `${type}; charset=utf-8` });
  fs.createReadStream(file).pipe(res);
}
