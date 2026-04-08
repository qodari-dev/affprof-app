import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    DATABASE_URL: z.url(),

    // IAM / OAuth
    IAM_APP_SLUG: z.url(),
    IAM_BASE_URL: z.url(),
    IAM_TOKEN_URL: z.url(),
    IAM_CLIENT_ID: z.string().min(1),
    IAM_CLIENT_SECRET: z.string().min(1),
    IAM_REDIRECT_URI: z.url(),
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
  },
  client: {
    NEXT_PUBLIC_API_URL: z.url(),
    NEXT_PUBLIC_APP_URL: z.url(),
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

    // Client
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
