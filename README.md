# EzCommerce Game Top-up (BangJeff Style)

## Tech Stack
- Node.js + Express.js
- PostgreSQL + Sequelize (MVC architecture)
- EJS + Tailwind (SSR)
- Auth: JWT (user & admin)
- Swagger (OpenAPI docs)
- Logger (Winston + Morgan) & Rate Limiting

## Features
User:
- Home (Hero, Flash Sale, Trending Games, Latest Articles)
- Game List
- Purchase Voucher Flow (UID, denomination, checkout, simulate payment, invoice)

Admin:
- Auth (login)
- CRUD Games / Voucher Packages / Flash Sales / Articles
- View Orders

## Installation
1. Copy `.env.example` to `.env` and adjust values.
2. Run `docker-compose up -d --build` OR local:
   - `npm install`
   - Ensure PostgreSQL running and `DATABASE_URL` set.
   - `npx sequelize-cli db:migrate`
   - `npx sequelize-cli db:seed:all`
   - `npm run dev`
3. Access API http://localhost:3000
4. Swagger Docs: http://localhost:3000/api-docs

## Postman
Import `postman_collection.json`.

## Deployment
Use Docker images. Push to registry then run compose on server.

## Docker (Production-like)
Gunakan file `docker-compose.prod.yml` untuk menjalankan container tanpa bind-mount source (lebih cocok untuk VPS/production) dan menyimpan data secara persistent.

- Build & run:
  - `docker compose -f docker-compose.prod.yml up -d --build`
- Lihat logs:
  - `docker compose -f docker-compose.prod.yml logs -f api`
- Stop:
  - `docker compose -f docker-compose.prod.yml down`

Catatan:
- Folder `uploads/` dibuat persistent menggunakan volume `uploads_data`.
- Database PostgreSQL dibuat persistent menggunakan volume `db_data`.

## Scripts
- `npm run migrate` migrate
- `npm run seed` seeders

## Example Requests (cURL)

Register:
```
curl -X POST http://localhost:3000/api/auth/register -H 'Content-Type: application/json' -d '{"email":"user@example.com","password":"Password123!","name":"User"}'
```

Login:
```
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login -H 'Content-Type: application/json' -d '{"email":"admin@example.com","password":"Admin123!"}' | jq -r .token)
```

List Games:
```
curl http://localhost:3000/api/games
```

Create Order:
```
curl -X POST http://localhost:3000/api/orders -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d '{"gameId":1,"voucherPackageId":1,"uid":"123456"}'
```

Pay Order:
```
curl -X POST http://localhost:3000/api/orders/1/pay -H "Authorization: Bearer $TOKEN"
```

Simulate Payment:
```
curl -X POST http://localhost:3000/api/payments/simulate -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d '{"orderId":1}'
```

## Admin Endpoints
- CRUD /api/games
- CRUD /api/vouchers
- CRUD /api/flash-sales
- CRUD /api/articles
- View Orders: GET /admin/orders

## Step-by-step (Local Non-Docker)
1. cp .env.example .env
2. npm install
3. npx sequelize-cli db:migrate
4. npx sequelize-cli db:seed:all
5. npm run dev

## Step-by-step (Docker)
1. cp .env.example .env
2. docker-compose up -d --build
3. (inside container) npx sequelize-cli db:migrate && npx sequelize-cli db:seed:all
4. Optional: Add script to auto-run migrate & seed on container start by editing Dockerfile entrypoint.

## License
MIT

✅ Project Generated (MVC + Express + PostgreSQL)
