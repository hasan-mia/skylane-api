#!/bin/bash
# Prisma database setup script
# Supports PostgreSQL, MySQL, and MongoDB

set -e

DATABASE_PROVIDER="${DATABASE_PROVIDER:-postgresql}"
DATABASE_URL="${DATABASE_URL}"

echo "Using database provider: $DATABASE_PROVIDER"
echo "Database URL: $DATABASE_URL"

# Use the appropriate schema based on provider
if [ "$DATABASE_PROVIDER" = "mongodb" ]; then
  PRISMA_SCHEMA="prisma/schema.mongodb.prisma"
else
  PRISMA_SCHEMA="prisma/schema.prisma"
fi

echo "Using Prisma schema: $PRISMA_SCHEMA"

# Generate Prisma client
npx prisma generate --schema="$PRISMA_SCHEMA"

# Run migrations (not for MongoDB - MongoDB uses db push)
if [ "$DATABASE_PROVIDER" = "mongodb" ]; then
  echo "MongoDB: Using db push instead of migrations"
  npx prisma db push --schema="$PRISMA_SCHEMA"
else
  echo "Running migrations for $DATABASE_PROVIDER..."
  npx prisma migrate deploy --schema="$PRISMA_SCHEMA"
fi

# Seed database
if [ "$DATABASE_PROVIDER" = "mongodb" ]; then
  echo "MongoDB: Seeding with db push"
  npx prisma db seed
else
  npx prisma db seed
fi

echo "Database setup complete!"