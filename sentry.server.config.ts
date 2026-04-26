// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const isProduction = process.env.NODE_ENV === "production";

Sentry.init({
  dsn: "https://b9457d5aa0240dd385df3f99e1b24d98@o4511287822057472.ingest.us.sentry.io/4511287905026048",

  tracesSampleRate: isProduction ? 0.1 : 1.0,

  // Enable logs to be sent to Sentry
  enableLogs: isProduction,

  sendDefaultPii: false,
});
