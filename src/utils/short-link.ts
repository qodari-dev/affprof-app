function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}

export function getShortLinkBaseUrl() {
  const explicitBase = process.env.NEXT_PUBLIC_SHORTLINK_BASE_URL?.trim();

  if (explicitBase) {
    return trimTrailingSlash(explicitBase);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() ?? '';
  return appUrl ? `${trimTrailingSlash(appUrl)}/go` : '';
}

export function buildShortLinkUrl(userSlug: string, linkSlug: string) {
  const baseUrl = getShortLinkBaseUrl();

  if (!baseUrl || !userSlug || !linkSlug) {
    return '';
  }

  return `${baseUrl}/${encodeURIComponent(userSlug)}/${encodeURIComponent(linkSlug)}`;
}

export function buildShortLinkPattern(userSlug: string, linkSlug = 'link-slug') {
  const baseUrl = getShortLinkBaseUrl();

  if (!baseUrl) {
    return `/go/${userSlug || 'my-brand'}/${linkSlug}`;
  }

  return `${baseUrl}/${userSlug || 'my-brand'}/${linkSlug}`;
}
