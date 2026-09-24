import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().port().default(3000),
  API_PREFIX: Joi.string().default('api'),
  CORS_ORIGIN: Joi.string().uri().required(),
  SWAGGER_ENABLED: Joi.boolean().default(false),

  DATABASE_URL: Joi.string().required(),
  DATABASE_PROVIDER: Joi.string()
    .valid('postgresql', 'mysql', 'mongodb')
    .default('postgresql'),

  REDIS_HOST: Joi.string().hostname().required(),
  REDIS_PORT: Joi.number().port().default(6379),
  REDIS_PASSWORD: Joi.string().allow('').optional(),
  REDIS_DB: Joi.number().integer().min(0).max(15).default(0),

  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  DUFFEL_ACCESS_TOKEN: Joi.string().required(),
  DUFFEL_WEBHOOK_SECRET: Joi.string().required(),
  DUFFEL_ENVIRONMENT: Joi.string().valid('test', 'live').default('test'),

  STRIPE_SECRET_KEY: Joi.string().required(),
  STRIPE_WEBHOOK_SECRET: Joi.string().required(),
  STRIPE_PUBLISHABLE_KEY: Joi.string().required(),

  THROTTLE_TTL: Joi.number().integer().positive().default(60000),
  THROTTLE_LIMIT: Joi.number().integer().positive().default(100),
  THROTTLE_AUTH_TTL: Joi.number().integer().positive().default(900000),
  THROTTLE_AUTH_LIMIT: Joi.number().integer().positive().default(5),

  LOG_LEVEL: Joi.string()
    .valid('fatal', 'error', 'warn', 'info', 'debug', 'trace')
    .default('info'),
  LOG_PRETTY: Joi.boolean().default(false),
}).unknown(true);