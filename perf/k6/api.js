import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const MAX_VUS = Number(__ENV.MAX_VUS || 8);
const RAMP_UP = __ENV.RAMP_UP || '10s';
const HOLD = __ENV.HOLD || '20s';
const RAMP_DOWN = __ENV.RAMP_DOWN || '10s';
const TIMEOUT = __ENV.TIMEOUT || '10s';

export const options = {
  scenarios: {
    browse: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: RAMP_UP, target: MAX_VUS },
        { duration: HOLD, target: MAX_VUS },
        { duration: RAMP_DOWN, target: 0 }
      ],
      gracefulRampDown: '10s'
    }
  },
  thresholds: {
    // Local/dev biasanya fluctuating. Ini masih wajar untuk "health + light load".
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<1500']
  }
};

export default function () {
  const params = { timeout: TIMEOUT };

  // 1) list games
  const g = http.get(`${BASE_URL}/api/products`, params);
  check(g, { 'GET /api/products -> 200': (r) => r.status === 200 });

  // 2) list vouchers
  const v = http.get(`${BASE_URL}/api/variants`, params);
  check(v, { 'GET /api/variants -> 200': (r) => r.status === 200 });

  // 3) flashsales (opsional, jika endpoint memang ada)
  const testFlashsales = String(__ENV.TEST_FLASHSALES || '').toLowerCase() === 'true';
  if (testFlashsales) {
    const f = http.get(`${BASE_URL}/api/flashsales`, params);
    check(f, { 'GET /api/flashsales -> 200': (r) => r.status === 200 });
  }

  sleep(1);
}
