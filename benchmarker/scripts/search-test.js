import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:9000/api";
const VUS = __ENV.K6_VUS ? parseInt(__ENV.K6_VUS) : 50;
const DURATION = __ENV.K6_DURATION || "60s";

export let options = {
  stages: [
    { duration: "10s", target: Math.min(5, VUS) },
    { duration: DURATION, target: Math.min(20, VUS) },
    { duration: "10s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<1000"],
  },
};

export default function () {
  const keywords = ["Pro", "Phone", "Max", "Mini", "Ultra", "Plus", "Neo"];
  const keyword = keywords[Math.floor(Math.random() * keywords.length)];
  const page = Math.floor(Math.random() * 3) + 1;
  const payload = JSON.stringify({ column: "name", keyword: keyword, page: page, limit: 5 });
  const params = { headers: { "Content-Type": "application/json" } };
  const res = http.post(`${BASE_URL}/search`, payload, params);
  check(res, { "search status 200": (r) => r.status === 200 });
  sleep(1);
}
