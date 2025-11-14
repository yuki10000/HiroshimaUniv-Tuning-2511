#!/usr/bin/env node
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const baseDir = path.resolve(__dirname);
const logsDir = path.join(baseDir, "logs");
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

// Default weights (sum to 100)
const WEIGHTS = {
  products: parseInt(process.env.WEIGHT_PRODUCTS || "70", 10),
  search: parseInt(process.env.WEIGHT_SEARCH || "25", 10),
  health: parseInt(process.env.WEIGHT_HEALTH || "5", 10),
};

function generateCombinedScriptContent() {
  // The generated k6 script uses __ENV for runtime overrides (K6_VUS, K6_DURATION, BASE_URL)
  return (
    'import http from "k6/http";\n' +
    'import { check, sleep } from "k6";\n\n' +
    "const BASE_URL = __ENV.BASE_URL || 'http://localhost:9000/api';\n" +
    "const VUS = __ENV.K6_VUS ? parseInt(__ENV.K6_VUS) : 50;\n" +
    "const DURATION = __ENV.K6_DURATION || '60s';\n\n" +
    "export let options = {\n" +
    "  stages: [\n" +
    '    { duration: "10s", target: Math.min(10, VUS) },\n' +
    "    { duration: DURATION, target: VUS },\n" +
    '    { duration: "10s", target: 0 },\n' +
    "  ],\n" +
    "  thresholds: {\n" +
    '    http_req_duration: ["p(95)<1000"],\n' +
    "  },\n" +
    "};\n\n" +
    "const WEIGHTS = { products: " +
    WEIGHTS.products +
    ", search: " +
    WEIGHTS.search +
    ", health: " +
    WEIGHTS.health +
    " };\n" +
    "const TOTAL = WEIGHTS.products + WEIGHTS.search + WEIGHTS.health;\n\n" +
    "function chooseAction() {\n" +
    "  const r = Math.random() * TOTAL;\n" +
    '  if (r < WEIGHTS.products) return "products";\n' +
    '  if (r < WEIGHTS.products + WEIGHTS.search) return "search";\n' +
    '  return "health";\n' +
    "}\n\n" +
    "export default function () {\n" +
    "  const action = chooseAction();\n" +
    '  if (action === "products") {\n' +
    "    const page = Math.floor(Math.random() * 10) + 1;\n" +
    "    const limit = 5;\n" +
    "    const res = http.get(BASE_URL + '/products?page=' + page + '&limit=' + limit);\n" +
    '    check(res, { "products status 200": (r) => r.status === 200 });\n' +
    '  } else if (action === "search") {\n' +
    '    const keywords = ["Pro","Phone","Max","Mini","Ultra","Plus","Neo"];\n' +
    "    const keyword = keywords[Math.floor(Math.random() * keywords.length)];\n" +
    "    const page = Math.floor(Math.random() * 3) + 1;\n" +
    '    const payload = JSON.stringify({ column: "name", keyword: keyword, page: page, limit: 5 });\n' +
    '    const params = { headers: { "Content-Type": "application/json" } };\n' +
    "    const res = http.post(BASE_URL + '/search', payload, params);\n" +
    '    check(res, { "search status 200": (r) => r.status === 200 });\n' +
    "  } else {\n" +
    "    const res = http.get(BASE_URL + '/health');\n" +
    '    check(res, { "health status 200": (r) => r.status === 200 });\n' +
    "  }\n" +
    "  sleep(1);\n" +
    "}\n"
  );
}

function runCombinedScript(combinedPath, outFile) {
  return new Promise((resolve, reject) => {
    console.log(`\n=== Running combined test -> ${outFile} ===`);
    const args = ["run", combinedPath, "--out", `json=${outFile}`];
    const proc = spawn("k6", args, { stdio: "inherit", env: process.env });
    proc.on("close", (code) => {
      if (code === 0) resolve(0);
      else reject(new Error(`combined test exited with code ${code}`));
    });
    proc.on("error", (err) => reject(err));
  });
}

(async function main() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const combinedName = `combined-${timestamp}`;
  const combinedPath = path.join(logsDir, `${combinedName}.js`);
  const outFile = path.join(logsDir, `${combinedName}.json`);

  // Write combined script
  fs.writeFileSync(combinedPath, generateCombinedScriptContent(), {
    encoding: "utf8",
  });

  try {
    await runCombinedScript(combinedPath, outFile);
  } catch (err) {
    console.error("Combined test failed:", err.message);
    process.exit(1);
  }

  console.log("\nCombined test completed successfully.");
})();
