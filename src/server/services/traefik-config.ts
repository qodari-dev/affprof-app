import { readdir, readFile, writeFile, unlink } from 'fs/promises';
import path from 'path';

import { env } from '@/env';

function sanitizeHostname(hostname: string) {
  return hostname.replace(/[^a-z0-9-]/g, '-');
}

function configFilePath(hostname: string) {
  const dir = env.TRAEFIK_DYNAMIC_CONFIG_DIR!;
  return path.join(dir, `custom-domain-${sanitizeHostname(hostname)}.yml`);
}

// Discovers the app's internal URL from the Dokploy-generated config file.
// Dokploy writes files like affprof-app-{hash}.yml with the current service URL.
async function resolveAppInternalUrl(configDir: string): Promise<string | null> {
  try {
    const files = await readdir(configDir);
    // Dokploy files follow the pattern: affprof-app-{hash}.yml
    // Custom domain files we write follow: custom-domain-*.yml — skip those
    const dokployFiles = files.filter(
      (f) => f.endsWith('.yml') && !f.startsWith('custom-domain-'),
    );

    for (const file of dokployFiles) {
      const content = await readFile(path.join(configDir, file), 'utf8');
      const match = content.match(/url:\s*(http:\/\/\S+)/);
      if (match) {
        return match[1];
      }
    }
  } catch {
    // ignore — provisioning will be skipped
  }

  return null;
}

function buildRouterConfig(hostname: string, internalUrl: string) {
  const routerName = `custom-domain-${sanitizeHostname(hostname)}`;
  const serviceName = `${routerName}-svc`;
  const certResolver = env.TRAEFIK_CERT_RESOLVER;
  const entrypoint = env.TRAEFIK_ENTRYPOINT;

  return `http:
  routers:
    ${routerName}:
      rule: "Host(\`${hostname}\`)"
      priority: 100
      entryPoints:
        - ${entrypoint}
      service: ${serviceName}
      tls:
        certResolver: ${certResolver}
  services:
    ${serviceName}:
      loadBalancer:
        servers:
          - url: "${internalUrl}"
        passHostHeader: true
`;
}

export async function provisionTraefikDomainConfig(hostname: string): Promise<void> {
  if (!env.TRAEFIK_DYNAMIC_CONFIG_DIR) {
    return;
  }

  const internalUrl = await resolveAppInternalUrl(env.TRAEFIK_DYNAMIC_CONFIG_DIR);
  if (!internalUrl) {
    return;
  }

  const config = buildRouterConfig(hostname, internalUrl);
  await writeFile(configFilePath(hostname), config, 'utf8');
}

// Called at app startup to re-provision all verified domains with the current service URL.
// This ensures configs stay valid after Dokploy redeploys (which change the internal URL).
export async function reprovisionAllDomainConfigs(hostnames: string[]): Promise<void> {
  if (!env.TRAEFIK_DYNAMIC_CONFIG_DIR) {
    return;
  }

  const internalUrl = await resolveAppInternalUrl(env.TRAEFIK_DYNAMIC_CONFIG_DIR);
  if (!internalUrl) {
    return;
  }

  await Promise.all(
    hostnames.map((hostname) =>
      writeFile(configFilePath(hostname), buildRouterConfig(hostname, internalUrl), 'utf8'),
    ),
  );
}

export async function removeTraefikDomainConfig(hostname: string): Promise<void> {
  if (!env.TRAEFIK_DYNAMIC_CONFIG_DIR) {
    return;
  }

  try {
    await unlink(configFilePath(hostname));
  } catch {
    // file may not exist if it was never provisioned
  }
}
