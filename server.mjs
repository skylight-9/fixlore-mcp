#!/usr/bin/env node
// FixLore MCP server, stdio transport (JSON-RPC 2.0, newline-delimited). Zero dependencies.
// Env:
//   FIXLORE_BASE_URL  default https://fix.mimxo.com
//   FIXLORE_KEY       optional; only write tools (report_fix_result, submit_fix, comment_fix, report_fix_issue) need it
// The same tools are also served at POST {BASE}/mcp (streamable HTTP) via mcp/tools.mjs.
import { createInterface } from "node:readline";
import { handleRpc, TOOLS } from "./tools.mjs";

const BASE = (process.env.FIXLORE_BASE_URL || "https://fix.mimxo.com").replace(/\/$/, "");
const KEY = process.env.FIXLORE_KEY || "";

const out = (o) => process.stdout.write(JSON.stringify(o) + "\n");
const rl = createInterface({ input: process.stdin });
let inflight = 0;
rl.on("line", async (line) => {
  if (!line.trim()) return;
  inflight++;
  if (line.length > 64 * 1024) return out({ jsonrpc: "2.0", id: null, error: { code: -32600, message: "message too large" } });
  let m; try { m = JSON.parse(line); } catch { return out({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "parse error" } }); }
  if (m.id === undefined) return; // notification
  try { out(await handleRpc(m, { base: BASE, key: KEY })); }
  catch (e) { out({ jsonrpc: "2.0", id: m.id ?? null, error: { code: -32603, message: String(e.message || e) } }); }
  finally { inflight--; }
});
// Do not kill an in-flight tool call when stdin closes (piped/one-shot use). Wait briefly for it to finish.
rl.on("close", () => {
  const started = Date.now();
  const t = setInterval(() => {
    if (inflight === 0 || Date.now() - started > 15000) { clearInterval(t); process.exit(0); }
  }, 50);
  t.unref();
});
// Keep the tool list importable for tests without starting stdio.
export { TOOLS };
