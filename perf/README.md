# Performance testing (k6)

## Install k6
Preferred: install the **k6 CLI** (recommended) so you can run scripts locally.

macOS (Homebrew):
- `brew install k6`

## Run
Set base URL (optional):
- `BASE_URL=http://localhost:3000`

### Smoke test (basic availability)
- `k6 run perf/k6/smoke.js`

### Public API browsing (ramp users)
- `k6 run perf/k6/api.js`

### Order flow (login + create order)
Requires a seeded user and valid IDs:
- `BASE_URL=http://localhost:3000 EMAIL=user1@example.com PASSWORD=User123! GAME_ID=1 VOUCHER_PACKAGE_ID=1 k6 run perf/k6/order-flow.js`

## Notes
- These scripts intentionally avoid hitting the AI chat endpoint.
- Tune thresholds, VUs, and durations via environment variables (see each script).
