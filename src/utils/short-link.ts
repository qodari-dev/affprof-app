function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}

function normalizeCustomHostname(customDomain?: string | null) {
  if (!customDomain) return '';
  return customDomain.trim().replace(/^https?:\/\//, '').replace(/\/+$/, '');
}

export function getShortLinkBaseUrl(customDomain?: string | null) {
  const normalizedCustomHostname = normalizeCustomHostname(customDomain);
  if (normalizedCustomHostname) {
    return `https://${normalizedCustomHostname}`;
  }

  const explicitBase = process.env.NEXT_PUBLIC_SHORTLINK_BASE_URL?.trim();

  if (explicitBase) {
    return trimTrailingSlash(explicitBase);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() ?? '';
  return appUrl ? `${trimTrailingSlash(appUrl)}/go` : '';
}

export function buildShortLinkUrl(userSlug: string, linkSlug: string, customDomain?: string | null) {
  const baseUrl = getShortLinkBaseUrl(customDomain);

  if (!baseUrl || !userSlug || !linkSlug) {
    return '';
  }

  if (customDomain) {
    return `${baseUrl}/${encodeURIComponent(linkSlug)}`;
  }

  return `${baseUrl}/${encodeURIComponent(userSlug)}/${encodeURIComponent(linkSlug)}`;
}

export function buildShortLinkPattern(
  userSlug: string,
  linkSlug = 'link-slug',
  customDomain?: string | null,
) {
  const baseUrl = getShortLinkBaseUrl(customDomain);

  if (!baseUrl) {
    return `/go/${userSlug || 'my-brand'}/${linkSlug}`;
  }

  if (customDomain) {
    return `${baseUrl}/${linkSlug}`;
  }

  return `${baseUrl}/${userSlug || 'my-brand'}/${linkSlug}`;
}
