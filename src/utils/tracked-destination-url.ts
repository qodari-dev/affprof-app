export type LinkUtmFields = {
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
};

const UTM_QUERY_PARAM_MAP = {
  utmSource: 'utm_source',
  utmMedium: 'utm_medium',
  utmCampaign: 'utm_campaign',
  utmContent: 'utm_content',
  utmTerm: 'utm_term',
} as const satisfies Record<keyof LinkUtmFields, string>;

function normalizeOptionalValue(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function sanitizeLinkUtmFields(fields: LinkUtmFields): Required<LinkUtmFields> {
  return {
    utmSource: normalizeOptionalValue(fields.utmSource),
    utmMedium: normalizeOptionalValue(fields.utmMedium),
    utmCampaign: normalizeOptionalValue(fields.utmCampaign),
    utmContent: normalizeOptionalValue(fields.utmContent),
    utmTerm: normalizeOptionalValue(fields.utmTerm),
  };
}

export function parseTrackedDestinationUrl(input: string) {
  const url = new URL(input);
  const utmFields = {} as Required<LinkUtmFields>;

  (Object.keys(UTM_QUERY_PARAM_MAP) as Array<keyof LinkUtmFields>).forEach((field) => {
    const param = UTM_QUERY_PARAM_MAP[field];
    utmFields[field] = normalizeOptionalValue(url.searchParams.get(param));
    url.searchParams.delete(param);
  });

  return {
    baseUrl: url.toString(),
    ...utmFields,
  };
}

export function buildTrackedDestinationUrl(baseUrl: string, fields: LinkUtmFields) {
  const url = new URL(baseUrl);
  const utmFields = sanitizeLinkUtmFields(fields);

  (Object.keys(UTM_QUERY_PARAM_MAP) as Array<keyof LinkUtmFields>).forEach((field) => {
    const param = UTM_QUERY_PARAM_MAP[field];
    url.searchParams.delete(param);

    const value = utmFields[field];
    if (value) {
      url.searchParams.set(param, value);
    }
  });

  return url.toString();
}

export function hasTrackedDestinationUtm(fields: LinkUtmFields) {
  const sanitized = sanitizeLinkUtmFields(fields);
  return Object.values(sanitized).some(Boolean);
}

export function normalizeTrackedDestinationInput(input: {
  baseUrl: string;
} & LinkUtmFields) {
  const parsed = parseTrackedDestinationUrl(input.baseUrl);
  const merged = sanitizeLinkUtmFields({
    utmSource: input.utmSource ?? parsed.utmSource,
    utmMedium: input.utmMedium ?? parsed.utmMedium,
    utmCampaign: input.utmCampaign ?? parsed.utmCampaign,
    utmContent: input.utmContent ?? parsed.utmContent,
    utmTerm: input.utmTerm ?? parsed.utmTerm,
  });

  return {
    baseUrl: parsed.baseUrl,
    originalUrl: buildTrackedDestinationUrl(parsed.baseUrl, merged),
    ...merged,
  };
}
