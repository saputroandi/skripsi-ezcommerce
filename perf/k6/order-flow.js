import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

function jsonHeaders(extra = {}) {
  return { headers: { 'Content-Type': 'application/json', ...extra } };
}

export const options = {
  scenarios: {
    orderFlow: {
      executor: 'constant-arrival-rate',
      rate: Number(__ENV.RATE || 2), // iterations per second
      timeUnit: '1s',
      duration: __ENV.DURATION || '1m',
      preAllocatedVUs: Number(__ENV.PRE_VUS || 10),
      maxVUs: Number(__ENV.MAX_VUS || 50),
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.02'],
    http_req_duration: ['p(95)<1500'],
  },
};

export default function () {
  const email = __ENV.EMAIL;
  const password = __ENV.PASSWORD;

  if (!email || !password) {
    // Skip protected flow if creds are not provided.
    const ping = http.get(`${BASE_URL}/api/products`);
    check(ping, { 'fallback status 200': (r) => r.status === 200 });
    sleep(1);
    return;
  }

  // Login
  const loginRes = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({ email, password }),
    jsonHeaders()
  );

  check(loginRes, {
    'login status 200': (r) => r.status === 200,
    'login has token': (r) => !!(r.json('token')),
  });

  const token = loginRes.json('token');
  if (!token) {
    sleep(1);
    return;
  }

  // Create order
  const gameId = Number(__ENV.GAME_ID || 1);
  const voucherPackageId = Number(__ENV.VOUCHER_PACKAGE_ID || 1);
  const uid = __ENV.UID || '123456';

  const orderRes = http.post(
    `${BASE_URL}/api/orders`,
    JSON.stringify({ gameId, voucherPackageId, uid }),
    jsonHeaders({ Authorization: `Bearer ${token}` })
  );

  check(orderRes, { 'create order status ok-ish': (r) => r.status === 201 || r.status === 200 || r.status === 400 });

  // Optional: if API returns an order id, try pay
  const orderId = orderRes.json('id') || orderRes.json('data.id') || orderRes.json('order.id');
  if (orderId) {
    const payRes = http.post(
      `${BASE_URL}/api/orders/${orderId}/pay`,
      null,
      jsonHeaders({ Authorization: `Bearer ${token}` })
    );
    check(payRes, { 'pay status ok-ish': (r) => [200, 201, 400, 404].includes(r.status) });
  }

  sleep(1);
}
