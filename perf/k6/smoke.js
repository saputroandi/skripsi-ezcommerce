import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export const options = {
  vus: Number(__ENV.VUS || 5),
  duration: __ENV.DURATION || '30s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<800'],
  },
};

export default function () {
  // Public landing pages (SSR)
  const home = http.get(`${BASE_URL}/`);
  check(home, { 'GET / status 200': (r) => r.status === 200 });

  const gamesPage = http.get(`${BASE_URL}/games`);
  check(gamesPage, { 'GET /games status 200': (r) => r.status === 200 });

  // Public API list
  const gamesApi = http.get(`${BASE_URL}/api/games`);
  check(gamesApi, { 'GET /api/games status 200': (r) => r.status === 200 });

  sleep(1);
}
