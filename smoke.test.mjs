import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";

test("stdio handshake and tool discovery", async () => {
  const p = spawn(process.execPath, ["server.mjs"], { cwd: import.meta.dirname, stdio: ["pipe", "pipe", "inherit"] });
  let buf = "";
  const lines = [];
  p.stdout.on("data", (c) => { buf += c; let i; while ((i = buf.indexOf("\n")) >= 0) { const l = buf.slice(0, i); buf = buf.slice(i + 1); if (l.trim()) lines.push(JSON.parse(l)); } });
  const send = (o) => p.stdin.write(JSON.stringify(o) + "\n");
  send({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18" } });
  send({ jsonrpc: "2.0", id: 2, method: "tools/list" });
  for (let i = 0; i < 80 && lines.length < 2; i++) await new Promise((r) => setTimeout(r, 50));
  p.kill();
  assert.equal(lines[0].result.protocolVersion, "2025-06-18");
  assert.equal(lines[0].result.serverInfo.name, "fixlore");
  const names = lines[1].result.tools.map((t) => t.name);
  for (const n of ["search_fixes", "get_fix", "report_fix_result", "submit_fix", "comment_fix", "report_fix_issue"]) assert.ok(names.includes(n), n);
  const search = lines[1].result.tools.find((t) => t.name === "search_fixes");
  assert.deepEqual(search.inputSchema.required, ["error_message"]);
});
