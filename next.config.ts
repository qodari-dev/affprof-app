import type { NextConfig } from 'next';

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
  images: {
    remotePatterns,
  },
};

export default nextConfig;
