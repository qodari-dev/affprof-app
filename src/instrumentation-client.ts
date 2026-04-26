// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const isProduction = process.env.NODE_ENV === "production";

Sentry.init({
  dsn: "https://b9457d5aa0240dd385df3f99e1b24d98@o4511287822057472.ingest.us.sentry.io/4511287905026048",

  // Add optional integrations for additional features
  integrations: [Sentry.replayIntegration()],

  tracesSampleRate: isProduction ? 0.1 : 1.0,

  // Enable logs to be sent to Sentry
  enableLogs: isProduction,

  // Do not record normal sessions by default; capture replay when an error happens.
  replaysSessionSampleRate: 0,

  // Define how likely Replay events are sampled when an error occurs.
  replaysOnErrorSampleRate: 1.0,

  sendDefaultPii: false,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
