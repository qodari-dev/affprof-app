import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config');

    const { startCrons } = await import('./server/crons');
    startCrons();

    try {
      const { reprovisionAllDomainConfigs } = await import('./server/services/traefik-config');
      const { db, customDomains } = await import('./server/db');
      const { eq } = await import('drizzle-orm');
      const verifiedDomains = await db.query.customDomains.findMany({
        where: eq(customDomains.status, 'verified'),
        columns: { hostname: true },
      });
      await reprovisionAllDomainConfigs(verifiedDomains.map((d) => d.hostname));
    } catch (err) {
      console.error('[traefik] Failed to reprovision custom domain configs:', err);
    }
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config');
  }
}

export const onRequestError = Sentry.captureRequestError;
