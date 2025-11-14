import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:9000/api";
const ITERATIONS = __ENV.K6_ITERATIONS ? parseInt(__ENV.K6_ITERATIONS) : 20;

export let options = {
  vus: 1,
  iterations: ITERATIONS,
};

export default function () {
  const roll = Math.random() * 100;
  if (roll < 90) {
    const res = http.get(`${BASE_URL}/health`, { headers: { Accept: "application/json" } });
    check(res, { "health is ok": (r) => r.status === 200 });
  } else {
    // エラー生成 (test_error を使う)
    const res = http.get(`${BASE_URL}/health?test_error=true`, { headers: { Accept: "application/json" } });
    check(res, { "health error produced": (r) => r.status === 500 });
  }
  sleep(0.5);
}
