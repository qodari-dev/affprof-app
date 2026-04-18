import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    DATABASE_URL: z.url(),

    // IAM / OAuth
    IAM_APP_SLUG: z.string().min(1),
    IAM_BASE_URL: z.url(),
    IAM_TOKEN_URL: z.url(),
    IAM_REDIRECT_URI: z.url(),
    IAM_CLIENT_ID: z.string().min(1),
    IAM_CLIENT_SECRET: z.string().min(1),
    IAM_JWT_SECRET: z.string().min(1),

    // IAM M2M (for creating users from AffProf)
    IAM_M2M_CLIENT_ID: z.string().min(1),
    IAM_M2M_CLIENT_SECRET: z.string().min(1),
    IAM_SLUG: z.string().min(1),

    // Cookie names
    ACCESS_TOKEN_NAME: z.string().min(1).default("accessToken"),
    REFRESH_TOKEN_NAME: z.string().min(1).default("refreshToken"),

    // Stripe
    STRIPE_SECRET_KEY: z.string().min(1),
    STRIPE_WEBHOOK_SECRET: z.string().min(1),
    STRIPE_PRO_MONTHLY_PRICE_ID: z.string().min(1),
    STRIPE_PRO_ANNUAL_PRICE_ID: z.string().min(1),

    // Custom domain
    CUSTOM_DOMAIN_CNAME_TARGET: z.string().min(1).optional(),

    // DigitalOcean Spaces
    DO_SPACES_ENDPOINT: z.url().optional(),
    DO_SPACES_REGION: z.string().min(1).optional(),
    DO_SPACES_BUCKET: z.string().min(1).optional(),
    DO_SPACES_KEY: z.string().min(1).optional(),
    DO_SPACES_SECRET: z.string().min(1).optional(),
    DO_SPACES_CDN_URL: z.url().optional(),

    // Scheduler
    PAUSE_SCHEDULER: z
      .union([
        z.literal("true"),
        z.literal("false"),
        z.literal("1"),
        z.literal("0"),
      ])
      .optional(),
    LINK_CHECKER_CRON: z.string().optional().default("0 0,6,12,18 * * *"),
    LINK_CHECKER_BATCH_SIZE: z.coerce
      .number()
      .int()
      .positive()
      .optional()
      .default(25),
    WEEKLY_DIGEST_CRON: z.string().optional().default("0 * * * *"),
    WEEKLY_DIGEST_HOUR: z.coerce
      .number()
      .int()
      .min(0)
      .max(23)
      .optional()
      .default(9),
    SCHEDULER_TIMEZONE: z.string().optional().default("America/Toronto"),

    // Email alerts
    RESEND_API_KEY: z.string().min(1).optional(),
    RESEND_FROM_EMAIL: z.string().min(1).optional(),
  },
  client: {
    NEXT_PUBLIC_API_URL: z.url(),
    NEXT_PUBLIC_APP_URL: z.url(),
    NEXT_PUBLIC_SHORTLINK_BASE_URL: z.url().optional(),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,

    // IAM / OAuth
    IAM_APP_SLUG: process.env.IAM_APP_SLUG,
    IAM_BASE_URL: process.env.IAM_BASE_URL,
    IAM_TOKEN_URL: process.env.IAM_TOKEN_URL,
    IAM_CLIENT_ID: process.env.IAM_CLIENT_ID,
    IAM_CLIENT_SECRET: process.env.IAM_CLIENT_SECRET,
    IAM_REDIRECT_URI: process.env.IAM_REDIRECT_URI,
    IAM_JWT_SECRET: process.env.IAM_JWT_SECRET,

    // IAM M2M
    IAM_M2M_CLIENT_ID: process.env.IAM_M2M_CLIENT_ID,
    IAM_M2M_CLIENT_SECRET: process.env.IAM_M2M_CLIENT_SECRET,
    IAM_SLUG: process.env.IAM_SLUG,

    // Cookie names
    ACCESS_TOKEN_NAME: process.env.ACCESS_TOKEN_NAME,
    REFRESH_TOKEN_NAME: process.env.REFRESH_TOKEN_NAME,

    // Stripe
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    STRIPE_PRO_MONTHLY_PRICE_ID: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
    STRIPE_PRO_ANNUAL_PRICE_ID: process.env.STRIPE_PRO_ANNUAL_PRICE_ID,
    CUSTOM_DOMAIN_CNAME_TARGET: process.env.CUSTOM_DOMAIN_CNAME_TARGET,

    // DigitalOcean Spaces
    DO_SPACES_ENDPOINT: process.env.DO_SPACES_ENDPOINT,
    DO_SPACES_CDN_URL: process.env.DO_SPACES_CDN_URL,
    DO_SPACES_REGION: process.env.DO_SPACES_REGION,
    DO_SPACES_BUCKET: process.env.DO_SPACES_BUCKET,
    DO_SPACES_KEY: process.env.DO_SPACES_KEY,
    DO_SPACES_SECRET: process.env.DO_SPACES_SECRET,

    // Scheduler
    PAUSE_SCHEDULER: process.env.PAUSE_SCHEDULER,
    LINK_CHECKER_CRON: process.env.LINK_CHECKER_CRON,
    LINK_CHECKER_BATCH_SIZE: process.env.LINK_CHECKER_BATCH_SIZE,
    WEEKLY_DIGEST_CRON: process.env.WEEKLY_DIGEST_CRON,
    WEEKLY_DIGEST_HOUR: process.env.WEEKLY_DIGEST_HOUR,
    SCHEDULER_TIMEZONE: process.env.SCHEDULER_TIMEZONE,

    // Email alerts
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,

    // Client
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SHORTLINK_BASE_URL: process.env.NEXT_PUBLIC_SHORTLINK_BASE_URL,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
