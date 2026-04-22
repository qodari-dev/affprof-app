import { z } from 'zod';

// ============================================
// RANGE
// ============================================

export const DASHBOARD_RANGES = ['7d', '30d', '90d', '180d', '360d'] as const;
export type DashboardRange = (typeof DASHBOARD_RANGES)[number];

export const RANGE_DAYS: Record<DashboardRange, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
  '180d': 180,
  '360d': 360,
};

// ============================================
// QUERY
// ============================================

export const DashboardQuerySchema = z.object({
  productId: z.string().uuid().optional(),
  range: z.enum(DASHBOARD_RANGES).default('30d'),
});

export type DashboardQuery = z.infer<typeof DashboardQuerySchema>;

// ============================================
// RESPONSE TYPES
// ============================================

export type Trend = {
  value: number;
  previousValue: number;
  diff: number; // absolute diff
  diffPercent: number | null; // null when previous is 0
};

export type DashboardKpis = {
  clicks: Trend;
  links: {
    total: number;
    active: number;
    broken: number;
    unknown: number;
  };
  topCountry: { code: string; clicks: number; percentage: number } | null;
  mobileShare: number; // percentage 0-100
  qrShare: number; // percentage 0-100
};

export type TopProduct = {
  id: string;
  name: string;
  clicks: number;
  previousClicks: number;
  diffPercent: number | null;
};

export type PeakDay = {
  date: string; // ISO YYYY-MM-DD
  clicks: number;
};

export type TimeseriesPoint = {
  date: string; // ISO date YYYY-MM-DD
  clicks: number;
};

export type TopLink = {
  id: string;
  slug: string;
  platform: string;
  productId: string;
  productName: string;
  clicks: number;
  previousClicks: number;
  diffPercent: number | null;
};

export type TrafficSource = {
  source: string; // youtube | instagram | direct | other | ...
  clicks: number;
  percentage: number;
};

export type TopCountry = {
  code: string;
  clicks: number;
  percentage: number;
};

export type BrokenLink = {
  id: string;
  slug: string;
  productId: string;
  productName: string;
  lastCheckedAt: string | null;
  consecutiveFailures: number;
};

export type TopPlatform = {
  platform: string;
  clicks: number;
  previousClicks: number;
  diffPercent: number | null;
};

export type DashboardHealthStats = {
  totalChecks: number;
  failedChecks: number;
  uptimePercent: number;
  avgResponseMs: number | null;
  fallbackClicks: number;
  fallbackShare: number; // % of total clicks
};

// ============================================
// LINK ANALYTICS QUERY
// ============================================

export const LinkAnalyticsQuerySchema = z.object({
  range: z.enum(DASHBOARD_RANGES).default('30d'),
});

export type LinkAnalyticsQuery = z.infer<typeof LinkAnalyticsQuerySchema>;

// ============================================
// LINK ANALYTICS RESPONSE TYPES
// ============================================

export type DeviceBreakdown = {
  device: string; // mobile | desktop | tablet
  clicks: number;
  percentage: number;
};

export type BrowserBreakdown = {
  browser: string;
  clicks: number;
  percentage: number;
};

export type OsBreakdown = {
  os: string;
  clicks: number;
  percentage: number;
};

export type UtmCampaign = {
  campaign: string;
  source: string | null;
  medium: string | null;
  clicks: number;
  percentage: number;
};

export type RecentClick = {
  id: string;
  clickedAt: string;
  country: string | null;
  city: string | null;
  device: string | null;
  browser: string | null;
  referrerSource: string | null;
  isQr: boolean;
};

export type HealthCheckSummary = {
  totalChecks: number;
  failedChecks: number;
  uptimePercent: number; // 0–100
  avgResponseMs: number | null;
  fallbackClicks: number;
  fallbackShare: number; // % of total clicks that used fallback
};

export type HealthTimelinePoint = {
  date: string; // YYYY-MM-DD
  total: number;
  failures: number;
  avgResponseMs: number | null;
};

export type LinkAnalytics = {
  linkId: string;
  range: DashboardRange;
  periodStart: string;
  periodEnd: string;
  totalClicks: number;
  previousClicks: number;
  diffPercent: number | null;
  qrClicks: number;
  qrShare: number;
  mobileShare: number;
  timeseries: TimeseriesPoint[];
  peakDay: PeakDay | null;
  countries: TopCountry[];
  devices: DeviceBreakdown[];
  osBreakdown: OsBreakdown[];
  browsers: BrowserBreakdown[];
  sources: TrafficSource[];
  utmCampaigns: UtmCampaign[];
  recentClicks: RecentClick[];
  healthSummary: HealthCheckSummary;
  healthTimeline: HealthTimelinePoint[];
};

// ============================================
// DASHBOARD ANALYTICS RESPONSE
// ============================================

export type DashboardAnalytics = {
  range: DashboardRange;
  productId: string | null;
  periodStart: string;
  periodEnd: string;
  kpis: DashboardKpis;
  timeseries: TimeseriesPoint[];
  peakDay: PeakDay | null;
  topLinks: TopLink[];
  topProducts: TopProduct[];
  topPlatforms: TopPlatform[];
  trafficSources: TrafficSource[];
  devices: DeviceBreakdown[];
  topCountries: TopCountry[];
  brokenLinks: BrokenLink[];
  healthStats: DashboardHealthStats | null; // null = no checks run yet
};
