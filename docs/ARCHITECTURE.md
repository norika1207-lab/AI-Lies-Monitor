# Architecture

AI Lies Monitor has four concepts.

## Event

An event is one observed thing:

```ts
type Event = {
  surface: "browser" | "service" | "demo" | string
  sessionId: string
  role: "user" | "assistant" | "tool" | "file" | "process"
  content: string
  meta?: Record<string, unknown>
}
```

## Promise

When an assistant says it will do something, the core engine extracts a promise:

```ts
type PromiseLedger = {
  statement: string
  userInstruction: string
  evidenceRequired: EvidenceRequirement[]
  evidence: Event[]
  status: "pending" | "fulfilled"
}
```

## Evidence Requirement

Current evidence types:

```ts
type EvidenceRequirement =
  | { type: "file"; path: string }
  | { type: "command"; commandHint: string }
  | { type: "process"; processHint: string }
```

## Alert

An alert is generated when a promise has no evidence or file checks fail:

```ts
type Alert = {
  type: "missing_evidence" | "file_check_failed"
  severity: "low" | "mid" | "high" | "critical"
  statement: string
  message: string
  suggestedReply: string
}
```

## Data Flow

```text
content script / service SDK / auto-mount
  -> POST /api/events
  -> packages/core
  -> var/state.json
  -> GET /api/state
  -> dashboard panel
```

## Why Local-First

The tool should not require sending private chat logs to another AI provider. The v0.1 checks are evidence-based and local-first:

- file exists
- file is non-empty
- command event exists
- process event exists

Semantic LLM judging can be added later as an optional plugin.
