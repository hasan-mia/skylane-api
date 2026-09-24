import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

const provider = process.env.DATABASE_PROVIDER ?? 'postgresql';

export default defineConfig({
  schema: `prisma/schema.${provider}.prisma`,
  datasource: {
    url: env('DATABASE_URL'),
  },
  migrations: {
    path: `prisma/migrations/${provider}`,
    seed: provider === 'mongodb'
      ? 'tsx prisma/seed.ts'
      : 'tsx prisma/seed.ts',
  },
});
