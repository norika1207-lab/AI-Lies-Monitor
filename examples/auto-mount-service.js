import fs from "node:fs";
import childProcess from "node:child_process";
import { zhaoyao } from "../packages/sdk/client.js";

await zhaoyao.user("請建立 /tmp/zj-auto-mounted.md 並寫入內容。");
await zhaoyao.assistant("我會建立 /tmp/zj-auto-mounted.md 並寫入內容。");

fs.writeFileSync("/tmp/zj-auto-mounted.md", "created by auto-mounted service\n");
childProcess.execSync("wc -c /tmp/zj-auto-mounted.md");

console.log("auto-mounted demo done");
