import fs from "node:fs";

const endpoint = "http://127.0.0.1:47831/api/events";
const missing = "/tmp/zhaoyao-jing-demo-report.md";
try { fs.unlinkSync(missing); } catch {}

await post({ role: "user", content: "請建立 /tmp/zhaoyao-jing-demo-report.md，不能是空檔。" });
await post({ role: "assistant", content: "我會建立 /tmp/zhaoyao-jing-demo-report.md 並寫入報告內容。" });

console.log("Demo events sent. Wait 30 seconds or click Check now in panel:");
console.log("http://127.0.0.1:47831");

async function post(event) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ surface: "demo", sessionId: "demo", ...event })
  });
  console.log(await res.text());
}
