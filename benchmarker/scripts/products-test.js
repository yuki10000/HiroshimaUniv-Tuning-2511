import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:9000/api";
const VUS = __ENV.K6_VUS ? parseInt(__ENV.K6_VUS) : 50;
const DURATION = __ENV.K6_DURATION || "60s";

export let options = {
  stages: [
    { duration: "10s", target: Math.min(10, VUS) },
    { duration: DURATION, target: VUS },
    { duration: "10s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<1000"],
  },
};

export default function () {
  const page = Math.floor(Math.random() * 10) + 1;
  const limit = 5;
  const res = http.get(`${BASE_URL}/products?page=${page}&limit=${limit}`);
  check(res, { "products status 200": (r) => r.status === 200 });
  sleep(1);
}
