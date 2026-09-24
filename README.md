# Skylane

**Open-source, production-grade NestJS backend for flight booking powered by the Duffel API.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![CI](https://github.com/skylane/skylane-api/actions/workflows/ci.yml/badge.svg)](.github/workflows/ci.yml)
[![CodeQL](https://github.com/skylane/skylane-api/actions/workflows/codeql.yml/badge.svg)](.github/workflows/codeql.yml)

---

## Overview

Skylane is a comprehensive flight booking/OTA (Online Travel Agency) backend built with NestJS, TypeScript, PostgreSQL/MySQL/MongoDB, Redis, and the Duffel API. It provides a complete, secure, and scalable foundation for flight search, booking, payment processing, and order management.

> **Note:** Since v12+, NestJS ships as ESM-only (`"type": "module"`). This
> project targets Node.js >= 20 and runs tests with **Vitest** (Jest cannot load
> the ESM `@nestjs/*` packages from CommonJS). See
> [ARCHITECTURE.md](ARCHITECTURE.md) for details.

### Architecture Diagram

```mermaid
graph TB
    A[Client] --> B[NestJS Application]
    B --> C[Auth Module]
    B --> D[Flights Module]
    B --> E[Bookings Module]
    B --> F[Payments Module]
    B --> G[Roles Module]
    B --> H[Webhooks Module]

    C --> I[(PostgreSQL)]
    C --> J[(Redis)]
    C --> K[JWT]

    D --> L[Duffel API]
    D --> J

    E --> L
    E --> I

    F --> M[Stripe]
    F --> I

    G --> I
    G --> J

    H --> N[BullMQ Queue]
    H --> I
</arg_value

## Features

- **Authentication**: JWT with short-lived access tokens (~15min) and rotating refresh tokens
- **Dynamic RBAC**: Manage roles and permissions at runtime via API
- **Flight Search**: Redis-cached flight search via Duffel API
- **Booking System**: Idempotent booking creation, cancellation, and changes
- **Payment Processing**: Stripe integration with manual capture (test mode)
- **Webhooks**: HMAC-verified webhook processing with BullMQ queues
- **Rate Limiting**: Per-IP and per-user rate limiting with Redis
- **Swagger Documentation**: Auto-generated OpenAPI docs
- **Structured Logging**: JSON logging with Pino and correlation IDs
- **Dual Deployment**: Docker (dev/prod) and PM2 support
- **Security**: Helmet, CORS, security headers, and more

## Choose Your Deployment

### Docker (Recommended for portability and local development)

```bash
# Development
docker compose -f docker/docker-compose.yml up --build

# Production
docker compose -f docker/docker-compose.prod.yml up --build -d
```

> NestJS v12 is ESM-only. If running locally outside Docker, ensure Node.js >= 20.

### PM2 (For bare-metal/VPS without container overhead)

```bash
# Install dependencies
npm ci

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Start with PM2
npm run pm2:dev   # development
npm run pm2:prod  # production
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development, production, test) | development |
| `PORT` | Application port | 3000 |
| `CORS_ORIGIN` | CORS allowed origins (comma-separated) | http://localhost:3000 |
| `DATABASE_URL` | Database connection string | - |
| `DATABASE_PROVIDER` | Database type (postgresql, mysql, mongodb) | postgresql |
| `REDIS_HOST` | Redis host | localhost |
| `REDIS_PORT` | Redis port | 6379 |
| `REDIS_DB` | Redis database number | 0 |
| `JWT_ACCESS_SECRET` | JWT access token secret (min 32 chars) | - |
| `JWT_ACCESS_EXPIRES_IN` | Access token expiry | 15m |
| `JWT_REFRESH_SECRET` | JWT refresh token secret (min 32 chars) | - |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | 7d |
| `DUFFEL_ACCESS_TOKEN` | Duffel API access token | - |
| `DUFFEL_WEBHOOK_SECRET` | Duffel webhook HMAC secret | - |
| `DUFFEL_ENVIRONMENT` | Duffel environment (test/live) | test |
| `STRIPE_SECRET_KEY` | Stripe secret key | - |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | - |
| `THROTTLE_TTL` | Rate limit TTL in ms | 60000 |
| `THROTTLE_LIMIT` | Rate limit max requests | 100 |

See `.env.example` for all variables.

### Database Configuration

Skylane supports PostgreSQL, MySQL, and MongoDB:

```env
# PostgreSQL (default)
DATABASE_PROVIDER=postgresql
DATABASE_URL=postgresql://user:pass@localhost:5432/skylane?schema=public

# MySQL
DATABASE_PROVIDER=mysql
DATABASE_URL=mysql://user:pass@localhost:3306/skylane

# MongoDB
DATABASE_PROVIDER=mongodb
DATABASE_URL=mongodb://user:pass@localhost:27017/skylane
```

To set up the database:
```bash
# Select provider via DATABASE_PROVIDER (postgresql|mysql|mongodb)
# and DATABASE_URL in .env, then:

# For PostgreSQL/MySQL
npm run db:setup   # picks schema based on DATABASE_PROVIDER

# For MongoDB
npm run prisma:push:mongo

# Seed
npm run prisma:seed
```

## Quick Start

```bash
# Clone and install
git clone https://github.com/skylane/skylane-api.git
cd skylane-api
pnpm install

# Set up environment
cp .env.example .env
# Edit .env with your actual values

# Option 1: Docker (includes Postgres + Redis)
docker compose -f docker/docker-compose.yml up --build

# Option 2: Manual setup with PM2
npm run pm2:dev

# Seed the database
npx prisma db push
npx prisma db seed
```

## API Documentation

Once the server is running, visit:

```
http://localhost:3000/api/docs
```

### Example Flow: Search → Book → Cancel

```bash
# 1. Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123!","name":"Test User"}'

# 2. Login
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123!"}')
ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.accessToken')

# 3. Search flights
curl -X POST http://localhost:3000/api/v1/flights/search \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "LHR",
    "destination": "JFK",
    "departureDate": "2024-12-25",
    "passengers": [{"type": "adult"}]
  }'

# 4. Create booking
curl -X POST http://localhost:3000/api/v1/bookings \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "offerId": "your-offer-id",
    "passengers": [{"firstName":"John","lastName":"Doe","email":"john@example.com"}],
    "idempotencyKey": "unique-key-123"
  }'

# 5. Cancel booking
curl -X POST http://localhost:3000/api/v1/bookings/{booking-id}/cancel \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

## Development

```bash
# Install dependencies
npm ci

# Generate Prisma client
npx prisma generate

# Start in development mode
npm run start:dev

# Run tests
npm test              # unit tests
npm run test:e2e      # e2e tests (uses Vitest)

# Lint and format
npm run lint
npm run format
```

## Project Structure

```
src/
├── config/          # Environment configuration
├── common/          # Shared utilities (guards, pipes, interceptors)
├── database/        # Prisma service
├── modules/
│   ├── auth/        # Authentication & JWT
│   ├── users/       # User management
│   ├── roles/       # RBAC & permissions
│   ├── flights/     # Flight search (Duffel + Redis)
│   ├── bookings/    # Booking system
│   ├── payments/    # Payment processing (Stripe)
│   ├── duffel/      # Duffel API wrapper
│   └── webhooks/    # Webhook handling (HMAC + BullMQ)
```

## License

MIT - see [LICENSE](LICENSE) for details.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## Security

See [SECURITY.md](SECURITY.md) for security policy and vulnerability reporting.
