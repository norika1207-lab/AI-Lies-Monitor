import fs from "node:fs";
import childProcess from "node:child_process";
import { zhaoyao } from "./client.js";

const original = {
  writeFile: fs.writeFile,
  writeFileSync: fs.writeFileSync,
  appendFile: fs.appendFile,
  appendFileSync: fs.appendFileSync,
  exec: childProcess.exec,
  execFile: childProcess.execFile,
  spawn: childProcess.spawn
};

fs.writeFile = function patchedWriteFile(file, data, ...rest) {
  zhaoyao.file(String(file), { op: "writeFile", bytes: byteLength(data) });
  return original.writeFile.call(this, file, data, ...rest);
};

fs.writeFileSync = function patchedWriteFileSync(file, data, ...rest) {
  zhaoyao.file(String(file), { op: "writeFileSync", bytes: byteLength(data) });
  return original.writeFileSync.call(this, file, data, ...rest);
};

fs.appendFile = function patchedAppendFile(file, data, ...rest) {
  zhaoyao.file(String(file), { op: "appendFile", bytes: byteLength(data) });
  return original.appendFile.call(this, file, data, ...rest);
};

fs.appendFileSync = function patchedAppendFileSync(file, data, ...rest) {
  zhaoyao.file(String(file), { op: "appendFileSync", bytes: byteLength(data) });
  return original.appendFileSync.call(this, file, data, ...rest);
};

childProcess.exec = function patchedExec(command, ...rest) {
  zhaoyao.tool(String(command), { op: "exec" });
  return original.exec.call(this, command, ...rest);
};

childProcess.execFile = function patchedExecFile(file, args = [], ...rest) {
  zhaoyao.tool([file, ...args].join(" "), { op: "execFile" });
  return original.execFile.call(this, file, args, ...rest);
};

childProcess.spawn = function patchedSpawn(command, args = [], ...rest) {
  zhaoyao.tool([command, ...args].join(" "), { op: "spawn" });
  const child = original.spawn.call(this, command, args, ...rest);
  zhaoyao.process(`${command} ${args.join(" ")} pid=${child.pid}`, { op: "spawn", pid: child.pid });
  return child;
};

function byteLength(data) {
  if (typeof data === "string") return Buffer.byteLength(data);
  if (Buffer.isBuffer(data)) return data.length;
  return 0;
}
