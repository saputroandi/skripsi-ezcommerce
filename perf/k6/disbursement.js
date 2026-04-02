import http from 'k6/http';
import { check } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'https://payment-uat-api.astrapay.com';
const ENDPOINT = __ENV.ENDPOINT || '/payment-service/transactions';
const ITERATIONS = Number(__ENV.ITERATIONS || 100);
const VUS = Number(__ENV.VUS || 50);

export const options = {
  vus: VUS,
  ITERATIONS: ITERATIONS,
};

function randomDigits(n) {
  let s = '';
  for (let i = 0; i < n; i++) {
    s += Math.floor(Math.random() * 10);
  }
  return s;
}

export default function () {
  const now = new Date();
  const ymd = now.toISOString().slice(0, 10).replace(/-/g, '');
  const refNum = `INV/DIS/EXA/${ymd}/${randomDigits(8)}`;

  const payload = JSON.stringify({
    account: {
      id: 1407,
      version: '2026-02-20T15:11:45.298622',
    },
    type: 'DISBURSEMENT',
    title: 'Top Up',
    product: 'TOPUP',
    selfHref: '/disbursement-service/me/disbursements/a5fe3bdFA',
    referenceNumber: refNum,
    total: 10,
    status: 'SUCCESS',
    expiry: '2026-02-25T14:40:02.636600',
    header: 'Top Up',
    subheader: 'Dari merchant',
    sourceOfFund: 'BALANCE',
    accountMutations: [
      {
        accountId: 1139,
        amount: 10,
        direction: 'DEBIT',
        type: 'BASIC_PRICE',
        title: 'UAT_PAYMENT_DISBURSEMENT_UAT_PAYMENT_DISBURSEMENT',
        notes: 'TEST UAT MULTI INSTANCE 1122',
      },
      {
        accountId: 1139,
        amount: 10,
        direction: 'CREDIT',
        type: 'TOTAL_PRICE',
        title: 'UAT_PAYMENT_DISBURSEMENT_UAT_PAYMENT_DISBURSEMENT',
        notes: 'Topup from Disbursement',
      },
    ],
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(`${BASE_URL}${ENDPOINT}`, payload, params);
  check(res, {
    'status is 200/201': (r) => r.status === 200 || r.status === 201,
  });
}
