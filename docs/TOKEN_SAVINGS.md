# Token Savings Panel

AI Lies Monitor now includes the Mercury Cache Panel tooling under:

```text
tools/token-savings/
```

This answers a second question:

```text
Even if the AI did not lie, did it waste your tokens and money?
```

## What It Reads

Local logs only:

```text
~/.claude/projects/*/*.jsonl
~/.codex/archived_sessions/rollout-*.jsonl
~/.codex/sessions/*/rollout-*.jsonl
```

## What It Reports

- Claude and Codex token usage
- cache reads
- cache writes
- expired cache writes
- estimated USD cost
- estimated savings from cache hits
- active sessions that are burning money

## Run

```bash
npm run tokens
open ~/Desktop/mercury-cache-panel.html
```

## Why This Belongs Here

AI deception has two costs:

1. The AI says it did work, but evidence is missing.
2. The AI keeps talking, planning, apologizing, and looping while burning tokens.

The promise/evidence monitor catches the first.

The token savings panel catches the second.

Together:

```text
less AI deception
less token waste
more verifiable work
```

## Source

Bundled from Norika Oda's Mercury Cache Panel project:

```text
https://github.com/norika1207-lab/mercury-cache-panel
```

