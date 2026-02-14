import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const ENDPOINT = __ENV.ENDPOINT || '/api/games';

// Target RPS (requests per second)
const RPS = Number(__ENV.RPS || 10);
const DURATION = __ENV.DURATION || '10s';
const PRE_VUS = Number(__ENV.PRE_VUS || 10);
const MAX_VUS = Number(__ENV.MAX_VUS || 100);
const TIMEOUT = __ENV.TIMEOUT || '10s';

export const options = {
  scenarios: {
    rps: {
      executor: 'constant-arrival-rate',
      rate: RPS,
      timeUnit: '1s',
      duration: DURATION,
      preAllocatedVUs: PRE_VUS,
      maxVUs: MAX_VUS,
    },
  },
  thresholds: {
    http_req_failed: ['rate<3'],
    http_req_duration: ['p(95)<2000'],
  },
};

export default function () {
  const res = http.get(`${BASE_URL}${ENDPOINT}`, { timeout: TIMEOUT });
  check(res, { 'status is 200': (r) => r.status === 200 });
  // Keep the VU alive; the executor controls the actual RPS.
  sleep(0.1);
}
