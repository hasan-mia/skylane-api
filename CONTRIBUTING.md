# Contributing to Skylane

Thank you for your interest in contributing to Skylane! This document outlines
the process for setting up a development environment and contributing code.

## Prerequisites

- Node.js >= 20
- npm
- PostgreSQL, MySQL, or MongoDB (select via `DATABASE_PROVIDER`)
- Redis 7+
- Docker (optional, for containerized dev)

## Development Setup

```bash
# Clone the repository
git clone https://github.com/skylane/skylane-api.git
cd skylane-api

# Install dependencies
npm ci

# Set up environment
cp .env.example .env
# Edit .env with your local configuration (set DATABASE_PROVIDER)

# Start PostgreSQL/MySQL and Redis (Docker)
docker compose -f docker/docker-compose.yml up -d postgres redis

# Generate Prisma client and run migrations (selects schema by DATABASE_PROVIDER)
npm run db:setup     # PostgreSQL/MySQL migrate + seed
# or for MongoDB: npm run prisma:push:mongo

# Start the development server
npm run start:dev
```

The API will be available at `http://localhost:3000/api/v1`.

> NestJS v12 is ESM-only; ensure Node.js >= 20.

The API will be available at `http://localhost:3000/api/v1`.

## Coding Conventions

- **TypeScript**: Use strict mode. No `any` types unless unavoidable.
- **Formatting**: We use Prettier. Run `npm run format` before committing.
- **Linting**: We use ESLint with `@typescript-eslint`. Run `npm run lint` before committing.
- **Naming**: Use camelCase for variables/functions, PascalCase for classes, SCREAMING_SNAKE_CASE for constants.
- **Imports**: Use absolute imports with `@/` prefix (configured in tsconfig.json).

## Testing

```bash
# Unit tests (Vitest)
npm test

# Unit tests with coverage
npm run test:cov

# E2E tests (Vitest; requires running database and Redis)
npm run test:e2e
```

### Writing Tests

- Unit tests: Place in `src/module/*.spec.ts`
- E2E tests: Place in `test/*.e2e-spec.ts`
- Use `describe` and `it` blocks
- Clean up database state after tests

## Pull Request Process

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Make your changes with appropriate tests
4. Ensure tests pass: `npm test && npm run test:e2e`
5. Ensure linting passes: `npm run lint`
6. Ensure typecheck passes: `npx tsc --noEmit`
7. Commit with a clear message: `git commit -m "feat: add my feature"`
8. Push to your fork: `git push origin feat/my-feature`
9. Open a Pull Request

## PR Guidelines

- Include a clear description of the change
- Link to relevant issues
- Ensure all CI checks pass
- Keep PRs focused (one feature/fix per PR)
- Follow the existing code style

## Code Review

All PRs require at least one review from a maintainer. We look for:
- Correctness and completeness
- Security considerations
- Performance implications
- Test coverage
- Code clarity

## Security

If you find a security vulnerability, please report it via our
[Security Policy](SECURITY.md). Do not open public issues for security bugs.

## Questions

Join our discussions on GitHub or tag a maintainer in your PR.