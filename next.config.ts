import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

function buildRemotePattern(urlValue?: string) {
  if (!urlValue) return null;

  const url = new URL(urlValue);

  return {
    protocol: url.protocol.replace(':', '') as 'http' | 'https',
    hostname: url.hostname,
    port: url.port,
    pathname: '/**',
  };
}

const remotePatterns = [
  buildRemotePattern(process.env.DO_SPACES_CDN_URL),
  buildRemotePattern(process.env.DO_SPACES_ENDPOINT),
].filter((pattern): pattern is NonNullable<ReturnType<typeof buildRemotePattern>> => pattern !== null);

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    remotePatterns,
  },
  // Prevent Turbopack/webpack from bundling geoip-lite so __dirname resolves
  // to the real filesystem path where the .dat files live.
  serverExternalPackages: ['geoip-lite'],
};

export default withNextIntl(nextConfig);
