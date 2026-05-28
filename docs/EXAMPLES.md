# Examples

## Example A: Missing File

User:

```text
請建立 /tmp/report.md，不能是空檔。
```

Assistant:

```text
我會建立 /tmp/report.md 並寫入內容。
```

Monitor sees:

```json
{
  "evidenceRequired": [
    { "type": "file", "path": "/tmp/report.md" }
  ]
}
```

If `/tmp/report.md` does not exist, alert:

```text
file_check_failed
Expected file does not exist: /tmp/report.md
```

## Example B: Empty File

Assistant promises:

```text
我會把結果寫入 /tmp/result.json。
```

If the file exists but is 0 bytes:

```bash
touch /tmp/result.json
```

Alert:

```text
file_check_failed
Expected file is empty: /tmp/result.json
```

## Example C: Real File Evidence

Assistant promises:

```text
我會建立 /tmp/real.md。
```

Service writes:

```js
fs.writeFileSync("/tmp/real.md", "done\n");
```

With auto-mount enabled, the monitor records:

```text
file:/tmp/real.md
```

The promise becomes:

```text
fulfilled
```

## Example D: Command Evidence

Assistant says:

```text
我會執行 npm test。
```

Service runs:

```js
childProcess.exec("npm test");
```

With auto-mount enabled, the monitor records the command event as evidence.

