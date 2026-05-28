# AI Lies Monitor / 照妖鏡

AI Lies Monitor is a local-first monitor for AI agents and chatbots.

It watches the gap between what the user asked, what the AI promised, and what actually happened underneath: files, commands, processes, logs, and artifacts.

中文名：照妖鏡。  
目的：AI 一邊說「我會做」，底下卻沒有 create file、沒有 command、沒有 PID、檔案還是 0 byte 時，讓使用者立刻看到。

## What It Detects

AI Lies Monitor is not a generic toxicity or AI-writing detector. It focuses on execution honesty:

- User gave an instruction.
- AI said it would do it.
- AI claimed it created a file, ran a command, started a service, or produced an artifact.
- The monitor checks evidence.
- If evidence is missing, stale, empty, or unverifiable, the user gets an alert.

Examples:

- AI: "I created `/tmp/report.md`."  
  Monitor: file does not exist.

- AI: "I wrote the results."  
  Monitor: file exists but is 0 bytes.

- AI: "I started the server."  
  Monitor: no PID/process evidence.

- AI: "I ran the benchmark."  
  Monitor: no command/tool event and no output artifact.

## Surfaces

This repo contains three ways to use the monitor.

### 1. Browser Extension

Path: `apps/browser-extension/`

The extension watches browser chat UIs such as ChatGPT, Claude, and Gemini. It extracts user messages and assistant messages, then sends them to the local monitor service.

Current supported host patterns:

- `https://chatgpt.com/*`
- `https://claude.ai/*`
- `https://gemini.google.com/*`

### 2. Dashboard Panel

Path: `apps/panel/`

The panel shows:

- open promises
- missing evidence
- missing files
- empty files
- suggested replies the user can paste back to the AI

### 3. Service Agent / Auto-Mount

Path: `apps/service-agent/` and `packages/sdk/`

Any local service can report AI events to the monitor through HTTP. Node services can also be auto-mounted without editing the service code:

```bash
NODE_OPTIONS="--import ./packages/sdk/auto-mount.js" node server.js
```

The auto-mount layer records:

- `fs.writeFile/writeFileSync/appendFile/appendFileSync` as file evidence
- `child_process.exec/execFile/spawn` as command evidence
- spawned PID as process evidence

## Quick Start

Requirements:

- Node.js 20+
- npm

Clone and run:

```bash
git clone https://github.com/norika1207-lab/AI-Lies-Monitor.git
cd AI-Lies-Monitor
npm run check
npm run service
```

Open:

```text
http://127.0.0.1:47831
```

## Demo 1: AI Promises a File but Does Not Create It

Start the service:

```bash
npm run service
```

In another terminal:

```bash
npm run demo
curl -s -X POST http://127.0.0.1:47831/api/check-now
```

The demo sends:

```text
User: 請建立 /tmp/zhaoyao-jing-demo-report.md，不能是空檔。
AI: 我會建立 /tmp/zhaoyao-jing-demo-report.md 並寫入報告內容。
```

But the file is not created. The panel reports:

```text
missing_evidence
file_check_failed: Expected file does not exist: /tmp/zhaoyao-jing-demo-report.md
```

Suggested reply:

```text
你說會建立 /tmp/zhaoyao-jing-demo-report.md，但目前檢查結果是 missing。
請貼 raw ls/stat/wc output，或承認沒有完成。
```

## Demo 2: Auto-Mounted Service Really Creates the File

Run:

```bash
npm run demo:auto-mount
curl -s -X POST http://127.0.0.1:47831/api/check-now
```

The demo uses `NODE_OPTIONS=--import ./packages/sdk/auto-mount.js`, then writes:

```text
/tmp/zj-auto-mounted.md
```

The promise becomes:

```text
status: fulfilled
evidence: file:/tmp/zj-auto-mounted.md
```

This is the intended behavior: the monitor should not punish a real action.

## HTTP API

Send a user instruction:

```bash
curl -X POST http://127.0.0.1:47831/api/events \
  -H 'content-type: application/json' \
  -d '{
    "surface": "service",
    "sessionId": "s1",
    "role": "user",
    "content": "幫我建立 /tmp/report.md，不要空檔"
  }'
```

Send an assistant promise:

```bash
curl -X POST http://127.0.0.1:47831/api/events \
  -H 'content-type: application/json' \
  -d '{
    "surface": "service",
    "sessionId": "s1",
    "role": "assistant",
    "content": "我會建立 /tmp/report.md 並寫入內容。"
  }'
```

Send file evidence:

```bash
curl -X POST http://127.0.0.1:47831/api/events \
  -H 'content-type: application/json' \
  -d '{
    "surface": "service",
    "sessionId": "s1",
    "role": "file",
    "content": "/tmp/report.md"
  }'
```

Force a check:

```bash
curl -X POST http://127.0.0.1:47831/api/check-now
```

Read state:

```bash
curl http://127.0.0.1:47831/api/state
```

## Browser Extension Install

1. Start the local service:

```bash
npm run service
```

2. Open Chrome or Edge:

```text
chrome://extensions
```

3. Enable Developer Mode.
4. Click "Load unpacked".
5. Select:

```text
apps/browser-extension
```

6. Open ChatGPT, Claude, or Gemini. The extension will send observed user/assistant turns to the local monitor.

## Node SDK

Manual SDK:

```js
import { ZhaoyaoJingClient } from "./packages/sdk/client.js";

const monitor = new ZhaoyaoJingClient({
  surface: "my-service",
  sessionId: "job-123"
});

await monitor.user("Create /tmp/result.json");
await monitor.assistant("I will create /tmp/result.json.");
await monitor.file("/tmp/result.json");
```

Auto-mount:

```bash
NODE_OPTIONS="--import ./packages/sdk/auto-mount.js" \
ZJ_SESSION_ID="my-ai-service" \
node server.js
```

## Architecture

```text
Browser chat UI / AI service / local agent
  -> event stream
  -> core promise ledger
  -> evidence requirements
  -> file/command/process checks
  -> dashboard alerts
```

Core package:

```text
packages/core/index.js
```

The core engine does not know or care whether the AI is Claude, ChatGPT, Gemini, Cursor, Devin, or a custom agent. It only tracks:

```text
instruction -> commitment -> evidence -> alert
```

## Current Limitations

This is v0.1:

- Browser DOM extraction is heuristic and will need per-site tuning.
- File checks are local-first. Remote hosts need service-side reporting or SSH adapters.
- Python auto-mount is not implemented yet.
- Shell history/process watchers are planned.
- LLM semantic judging is not included. The first release is evidence-based, not vibe-based.

## Roadmap

- Python SDK and `sitecustomize.py` auto-mount.
- VS Code / Cursor / Continue integration.
- Remote SSH evidence adapter.
- Process watcher for PID liveness and empty-heartbeat logs.
- Browser sidebar overlay.
- Team audit log export.
- False-positive reporting and user-tunable rule profiles.

## License

MIT. See `LICENSE`.
