#!/usr/bin/env node
// Node >=18 : fetch natif
const base = process.env.API_URL || "http://localhost:8080";

const tests = [
  { name: "OK",               method: "GET",  path: "/error-test/ok" },
  { name: "FORBIDDEN",        method: "GET",  path: "/error-test/forbidden" },
  { name: "VALIDATION (422)", method: "GET",  path: "/error-test/validation" },
  { name: "PRISMA P2002",     method: "GET",  path: "/error-test/prisma" },
  { name: "JWT EXPIRED",      method: "GET",  path: "/error-test/jwt-expired" },
  { name: "UNKNOWN (500)",    method: "GET",  path: "/error-test/unknown" },
  // JSON invalide : corps volontairement mal formé
  { name: "INVALID JSON (400)", method: "POST", path: "/error-test/json-invalid", body: '{"broken": true' },
];

function pad(str, n) { return (str + " ".repeat(n)).slice(0, n); }

async function run() {
  console.log(`\nRunning error tests against ${base}\n`);
  for (const t of tests) {
    const url = base + t.path;
    try {
      const res = await fetch(url, {
        method: t.method,
        headers: t.body ? { "Content-Type": "application/json" } : undefined,
        body: t.body ?? undefined,
      });

      let payload = null;
      try { payload = await res.json(); } catch { /* non-JSON */ }

      const ok = res.ok;
      const status = res.status;
      const code = payload?.error?.code ?? "-";
      const msg  = payload?.error?.message ?? (ok ? "OK" : res.statusText);
      const traceId = payload?.error?.traceId ?? payload?.traceId ?? "-";

      console.log(
        `${pad(t.name, 20)} | ${pad(t.method, 6)} ${pad(t.path, 22)} → ${status}  ${pad(code, 20)}  ${msg}  (traceId=${traceId})`
      );

      if (payload?.error?.details) {
        console.log("  details:", JSON.stringify(payload.error.details, null, 2));
      }
    } catch (e) {
      console.error(`${t.name} failed:`, e.message);
    }
  }
  console.log("\nDone.\n");
}

run();
