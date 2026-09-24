# Skylane

**Open-source, production-grade NestJS backend for flight booking powered by the Duffel API.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![CI](https://github.com/skylane/skylane-api/actions/workflows/ci.yml/badge.svg)](https://github.com/skylane/skylane-api/actions/workflows/ci.yml)
[![CodeQL](https://github.com/skylane/skylane-api/actions/workflows/codeql.yml/badge.svg)](https://github.com/skylane/skylane-api/actions/workflows/codeql.yml)

---

## Overview

Skylane is a comprehensive flight booking/OTA (Online Travel Agency) backend built with **NestJS, TypeScript, Prisma, PostgreSQL/MySQL/MongoDB, Redis, Stripe, and the Duffel API**.

It provides a complete, secure, and scalable foundation for:

* Flight search
* Flight booking
* Booking cancellation and changes
* Payment processing
* Order management
* Authentication
* Dynamic role-based access control
* Webhook processing
* Rate limiting
* API documentation
* Structured logging

> **Note:** NestJS v12+ ships as ESM-only (`"type": "module"`). This project targets Node.js >= 20 and uses **Vitest** for testing. Jest is not used because it cannot load the ESM `@nestjs/*` packages from CommonJS without additional configuration.
>
> See [ARCHITECTURE.md](ARCHITECTURE.md) for more details.

---

## Architecture Diagram

```mermaid
graph TB
    A[Client] --> B[NestJS Application]

    B --> C[Auth Module]
    B --> D[Flights Module]
    B --> E[Bookings Module]
    B --> F[Payments Module]
    B --> G[Roles Module]
    B --> H[Webhooks Module]

    C --> I[(Database)]
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
```

---

## Features

### Authentication

* JWT-based authentication
* Short-lived access tokens
* Rotating refresh tokens
* Configurable token expiration
* Secure password hashing

### Dynamic RBAC

* Runtime role management
* Runtime permission management
* Role-permission assignments
* User-role assignments
* Guard-based authorization

### Flight Search

* Duffel API integration
* Flight offer search
* Passenger-based search
* Redis caching
* Configurable cache expiration

### Booking System

* Flight booking creation
* Idempotent booking creation
* Booking cancellation
* Booking changes
* Order management
* Duffel order integration

### Payment Processing

* Stripe integration
* Payment intent handling
* Manual capture support
* Webhook verification
* Payment/order synchronization

> Stripe is currently configured for test-mode payment processing.

### Webhooks

* Duffel webhook support
* HMAC signature verification
* BullMQ-based asynchronous processing
* Retry support
* Persistent webhook records

### Security

* Helmet
* CORS
* Security headers
* JWT authentication
* Role-based authorization
* Rate limiting
* HMAC webhook verification
* Input validation

### Performance

* Redis caching
* Background queues with BullMQ
* Database indexing
* Idempotent operations
* Structured logging

### Developer Experience

* Swagger/OpenAPI documentation
* ESLint
* Prettier
* Vitest
* Docker support
* PM2 support
* Prisma migrations
* CI/CD
* CodeQL security analysis

---

# Technology Stack

| Technology | Purpose                                |
| ---------- | -------------------------------------- |
| NestJS     | Backend framework                      |
| TypeScript | Programming language                   |
| Prisma     | ORM / database access                  |
| PostgreSQL | Primary relational database            |
| MySQL      | Alternative relational database        |
| MongoDB    | Alternative database                   |
| Redis      | Cache, rate limiting and queue backend |
| BullMQ     | Background job processing              |
| Duffel     | Flight search and booking              |
| Stripe     | Payment processing                     |
| JWT        | Authentication                         |
| Pino       | Structured logging                     |
| Swagger    | API documentation                      |
| Docker     | Containerized deployment               |
| PM2        | Process management                     |
| Vitest     | Testing                                |

---

# Choose Your Deployment

## Docker

Docker is recommended for portability and local development.

### Development

```bash
docker compose -f docker/docker-compose.yml up --build
```

### Production

```bash
docker compose -f docker/docker-compose.prod.yml up --build -d
```

> NestJS v12 is ESM-only. If running the application locally outside Docker, make sure Node.js >= 20 is installed.

---

## PM2

PM2 is useful for bare-metal servers and VPS deployments without container overhead.

### Install dependencies

```bash
npm ci
```

### Generate Prisma Client

```bash
npx prisma generate
```

### Run migrations

```bash
npx prisma migrate deploy
```

### Start with PM2

```bash
npm run pm2:dev
```

For production:

```bash
npm run pm2:prod
```

---

# Environment Variables

Create a `.env` file based on `.env.example`.

| Variable                 | Description                    | Default                 |
| ------------------------ | ------------------------------ | ----------------------- |
| `NODE_ENV`               | Environment                    | `development`           |
| `PORT`                   | Application port               | `3000`                  |
| `CORS_ORIGIN`            | Allowed CORS origins           | `http://localhost:3000` |
| `DATABASE_URL`           | Database connection string     | Required                |
| `DATABASE_PROVIDER`      | Database provider              | `postgresql`            |
| `REDIS_HOST`             | Redis host                     | `localhost`             |
| `REDIS_PORT`             | Redis port                     | `6379`                  |
| `REDIS_DB`               | Redis database number          | `0`                     |
| `JWT_ACCESS_SECRET`      | JWT access token secret        | Required                |
| `JWT_ACCESS_EXPIRES_IN`  | Access token expiry            | `15m`                   |
| `JWT_REFRESH_SECRET`     | JWT refresh token secret       | Required                |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry           | `7d`                    |
| `DUFFEL_ACCESS_TOKEN`    | Duffel API access token        | Required                |
| `DUFFEL_WEBHOOK_SECRET`  | Duffel webhook HMAC secret     | Required                |
| `DUFFEL_ENVIRONMENT`     | Duffel environment             | `test`                  |
| `STRIPE_SECRET_KEY`      | Stripe secret key              | Required                |
| `STRIPE_WEBHOOK_SECRET`  | Stripe webhook signing secret  | Required                |
| `THROTTLE_TTL`           | Rate limit TTL in milliseconds | `60000`                 |
| `THROTTLE_LIMIT`         | Maximum requests per TTL       | `100`                   |

See `.env.example` for the complete list of supported variables.

---

# Database Configuration

Skylane supports:

* PostgreSQL
* MySQL
* MongoDB

## PostgreSQL

```env
DATABASE_PROVIDER=postgresql
DATABASE_URL=postgresql://user:pass@localhost:5432/skylane?schema=public
```

## MySQL

```env
DATABASE_PROVIDER=mysql
DATABASE_URL=mysql://user:pass@localhost:3306/skylane
```

## MongoDB

```env
DATABASE_PROVIDER=mongodb
DATABASE_URL=mongodb://user:pass@localhost:27017/skylane
```

---

## Database Setup

Select the database provider using `DATABASE_PROVIDER` and configure `DATABASE_URL`.

### PostgreSQL / MySQL

```bash
npm run db:setup
```

The setup command selects the appropriate Prisma schema based on `DATABASE_PROVIDER`.

### MongoDB

```bash
npm run prisma:push:mongo
```

### Seed the database

```bash
npm run prisma:seed
```

---

# Quick Start

## 1. Clone the repository

```bash
git clone https://github.com/skylane/skylane-api.git
cd skylane-api
```

## 2. Install dependencies

Using pnpm:

```bash
pnpm install
```

Or using npm:

```bash
npm ci
```

## 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and provide your actual database, Redis, Duffel and Stripe credentials.

## 4. Start with Docker

```bash
docker compose -f docker/docker-compose.yml up --build
```

Or start manually:

```bash
npm run pm2:dev
```

## 5. Generate Prisma Client

```bash
npx prisma generate
```

## 6. Setup database

```bash
npm run db:setup
```

## 7. Seed database

```bash
npm run prisma:seed
```

---

# API Documentation

Once the server is running, Swagger documentatio
