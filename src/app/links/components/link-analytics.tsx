"use client";

import * as React from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Globe2,
  Megaphone,
  Monitor,
  MousePointerClick,
  QrCode,
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  Tablet,
  Laptop,
  Timer,
} from "lucide-react";
import { ClickTypeInfo } from "@/components/click-type-info";
import { useLocale, useTranslations } from "next-intl";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";

import { cn } from "@/lib/utils";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useLinkAnalytics } from "@/hooks/queries/use-analytics-queries";
import type {
  ClickType,
  DashboardRange,
  BrowserBreakdown,
  DeviceBreakdown,
  HealthCheckSummary,
  HealthTimelinePoint,
  OsBreakdown,
  RecentCheck,
  RecentClick,
  TopCountry,
  TrafficSource,
  UtmCampaign,
} from "@/schemas/analytics";
import { CLICK_TYPES } from "@/schemas/analytics";

// ============================================
// CONFIG
// ============================================

const RANGE_OPTIONS: { value: DashboardRange; label: string }[] = [
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" },
  { value: "90d", label: "90d" },
  { value: "180d", label: "180d" },
  { value: "360d", label: "360d" },
];

const chartConfig = {
  clicks: { label: "Clicks", color: "var(--chart-1)" },
} satisfies ChartConfig;

// ============================================
// HELPERS
// ============================================

function formatNumber(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}

function countryFlag(code: string) {
  if (!code || code.length !== 2) return "🌐";
  const base = 0x1f1e6;
  return code
    .toUpperCase()
    .split("")
    .map((c) =>
      String.fromCodePoint(base + (c.charCodeAt(0) - "A".charCodeAt(0))),
    )
    .join("");
}

const DEVICE_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  mobile: Smartphone,
  desktop: Monitor,
  tablet: Tablet,
};

const SOURCE_COLORS: Record<string, string> = {
  youtube: "bg-red-500",
  instagram: "bg-pink-500",
  twitter: "bg-sky-500",
  tiktok: "bg-neutral-800 dark:bg-neutral-200",
  direct: "bg-emerald-500",
  facebook: "bg-blue-600",
  other: "bg-neutral-400",
};

// ============================================
// MAIN COMPONENT
// ============================================

export function LinkAnalytics({ linkId }: { linkId: string }) {
  const [range, setRange] = React.useState<DashboardRange>("30d");
  const [clickType, setClickType] = React.useState<ClickType>("all");
  const { data, isLoading } = useLinkAnalytics(linkId, { range, clickType });
  const analytics = data?.body;
  const t = useTranslations("links.analytics");
  const locale = useLocale();

  if (isLoading || !analytics) {
    return <LinkAnalyticsSkeleton />;
  }

  const { totalClicks, diffPercent, qrClicks, qrShare, mobileShare } = analytics;

  return (
    <div className="flex flex-col gap-5">
      {/* Toolbar: filters only */}
      <div className="flex items-center justify-end gap-2">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center rounded-md border bg-background p-0.5">
            {CLICK_TYPES.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setClickType(key)}
                className={cn(
                  "px-2.5 py-1 text-xs font-medium rounded-sm transition-colors",
                  clickType === key
                    ? key === "successful"
                      ? "bg-emerald-500 text-white"
                      : key === "failed"
                      ? "bg-red-500 text-white"
                      : "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t(`clickType.${key}`)}
              </button>
            ))}
          </div>
          <ClickTypeInfo />
        </div>

        <div className="flex items-center rounded-md border bg-background p-0.5">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setRange(opt.value)}
              className={cn(
                "px-2.5 py-1 text-xs font-medium rounded-sm transition-colors",
                range === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Click summary line */}
      <p className="text-sm text-muted-foreground">
        {formatNumber(totalClicks)}{" "}
        {totalClicks === 1 ? "click" : t("clicks")}{" "}
        {t("inPeriod")}
        {diffPercent !== null && (
          <span
            className={cn(
              "ml-2 inline-flex items-center gap-0.5 text-xs font-medium",
              diffPercent >= 0
                ? "text-emerald-600 dark:text-emerald-500"
                : "text-red-600 dark:text-red-500",
            )}
          >
            {diffPercent >= 0 ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {Math.abs(diffPercent).toFixed(0)}%
          </span>
        )}
      </p>

      {/* Mini KPIs row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniKpi
          icon={MousePointerClick}
          label={t("total")}
          value={formatNumber(totalClicks)}
        />
        <MiniKpi
          icon={Smartphone}
          label={t("mobile")}
          value={totalClicks > 0 ? `${mobileShare.toFixed(0)}%` : "0%"}
        />
        <MiniKpi
          icon={QrCode}
          label={t("qrScans")}
          value={
            qrClicks > 0
              ? `${formatNumber(qrClicks)} (${qrShare.toFixed(0)}%)`
              : "0"
          }
        />
        <MiniKpi
          icon={Globe2}
          label={t("countries")}
          value={String(analytics.countries.length)}
        />
      </div>

      {/* Timeseries chart */}
      <ClicksChart data={analytics.timeseries} peakDay={analytics.peakDay} locale={locale} t={t} />

      {/* Two columns: sources + devices */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SourcesList sources={analytics.sources} t={t} />
        <DevicesList devices={analytics.devices} t={t} />
      </div>

      {/* Two columns: countries + OS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <CountriesList countries={analytics.countries} t={t} />
        <OsList os={analytics.osBreakdown} t={t} />
      </div>

      {/* Two columns: browsers + (empty or future) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <BrowsersList browsers={analytics.browsers} t={t} />
      </div>

      {/* UTM campaigns — only show if there's data */}
      {analytics.utmCampaigns.length > 0 && (
        <UtmCampaignsList campaigns={analytics.utmCampaigns} t={t} />
      )}

      {/* Health */}
      <HealthCard
        summary={analytics.healthSummary}
        timeline={analytics.healthTimeline}
        locale={locale}
        t={t}
      />

      {/* Recent clicks */}
      <RecentClicksTable clicks={analytics.recentClicks} locale={locale} t={t} />

      {/* Recent checks */}
      <RecentChecksTable checks={analytics.recentChecks} locale={locale} t={t} />
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function useAnalyticsT() {
  return useTranslations("links.analytics");
}
type TFunc = ReturnType<typeof useAnalyticsT>;

function MiniKpi({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border p-3">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold truncate">{value}</p>
      </div>
    </div>
  );
}

function ClicksChart({
  data,
  peakDay,
  locale,
  t,
}: {
  data: { date: string; clicks: number }[];
  peakDay: { date: string; clicks: number } | null;
  locale: string;
  t: TFunc;
}) {
  const hasData = data.some((p) => p.clicks > 0);
  const tickInterval = Math.max(0, Math.floor(data.length / 6) - 1);

  const formatDateShort = React.useCallback(
    (iso: string) =>
      new Date(iso).toLocaleDateString(locale, {
        month: "short",
        day: "numeric",
      }),
    [locale],
  );

  return (
    <div className="rounded-lg border p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium">{t("overTime")}</p>
        {peakDay && (
          <p className="text-xs text-muted-foreground">
            {t("peak")} {formatDateShort(peakDay.date)} ({peakDay.clicks})
          </p>
        )}
      </div>
      {hasData ? (
        <ChartContainer config={chartConfig} className="h-45 w-full">
          <AreaChart
            data={data}
            margin={{ left: 0, right: 4, top: 4, bottom: 0 }}
          >
            <defs>
              <linearGradient id="linkFillClicks" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-clicks)"
                  stopOpacity={0.5}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-clicks)"
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={6}
              tickFormatter={formatDateShort}
              interval={tickInterval}
              className="text-[10px]"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={4}
              width={28}
              allowDecimals={false}
              className="text-[10px]"
            />
            <ChartTooltip
              cursor={{ stroke: "var(--border)", strokeDasharray: "3 3" }}
              content={
                <ChartTooltipContent
                  labelFormatter={(v) =>
                    new Date(v).toLocaleDateString(locale, {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  }
                />
              }
            />
            <Area
              type="monotone"
              dataKey="clicks"
              stroke="var(--color-clicks)"
              strokeWidth={2}
              fill="url(#linkFillClicks)"
            />
          </AreaChart>
        </ChartContainer>
      ) : (
        <div className="flex h-45 items-center justify-center text-xs text-muted-foreground">
          {t("noClicksPeriod")}
        </div>
      )}
    </div>
  );
}

function SourcesList({ sources, t }: { sources: TrafficSource[]; t: TFunc }) {
  if (sources.length === 0) return <EmptyCard title={t("sources")} t={t} />;
  return (
    <div className="rounded-lg border p-4">
      <p className="text-sm font-medium mb-3">{t("sources")}</p>
      <div className="flex flex-col gap-2.5">
        {sources.map((s) => (
          <div key={s.source} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="capitalize font-medium">{s.source}</span>
              <span className="text-muted-foreground">
                {formatNumber(s.clicks)} · {s.percentage.toFixed(0)}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full",
                  SOURCE_COLORS[s.source.toLowerCase()] ?? "bg-neutral-400",
                )}
                style={{ width: `${Math.max(s.percentage, 2)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DevicesList({ devices, t }: { devices: DeviceBreakdown[]; t: TFunc }) {
  if (devices.length === 0) return <EmptyCard title={t("devices")} t={t} />;
  return (
    <div className="rounded-lg border p-4">
      <p className="text-sm font-medium mb-3">{t("devices")}</p>
      <div className="flex flex-col gap-2.5">
        {devices.map((d) => {
          const Icon = DEVICE_ICONS[d.device] ?? Monitor;
          return (
            <div
              key={d.device}
              className="flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="capitalize font-medium">{d.device}</span>
              </div>
              <span className="text-muted-foreground">
                {formatNumber(d.clicks)} · {d.percentage.toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CountriesList({ countries, t }: { countries: TopCountry[]; t: TFunc }) {
  if (countries.length === 0) return <EmptyCard title={t("countries")} t={t} />;
  return (
    <div className="rounded-lg border p-4">
      <p className="text-sm font-medium mb-3">{t("countries")}</p>
      <div className="flex flex-col gap-2">
        {countries.map((c) => (
          <div
            key={c.code}
            className="flex items-center justify-between text-xs"
          >
            <span>
              <span className="mr-1.5">{countryFlag(c.code)}</span>
              <span className="font-medium">{c.code}</span>
            </span>
            <span className="text-muted-foreground">
              {formatNumber(c.clicks)} · {c.percentage.toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const OS_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  ios: Smartphone,
  android: Smartphone,
  windows: Monitor,
  macos: Laptop,
  linux: Monitor,
};

function OsList({ os, t }: { os: OsBreakdown[]; t: TFunc }) {
  if (os.length === 0) return <EmptyCard title={t("os")} t={t} />;
  return (
    <div className="rounded-lg border p-4">
      <p className="text-sm font-medium mb-3">{t("os")}</p>
      <div className="flex flex-col gap-2">
        {os.map((o) => {
          const Icon = OS_ICONS[o.os.toLowerCase()] ?? Monitor;
          return (
            <div key={o.os} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-medium">{o.os}</span>
              </div>
              <span className="text-muted-foreground">
                {formatNumber(o.clicks)} · {o.percentage.toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BrowsersList({ browsers, t }: { browsers: BrowserBreakdown[]; t: TFunc }) {
  if (browsers.length === 0) return <EmptyCard title={t("browsers")} t={t} />;
  return (
    <div className="rounded-lg border p-4">
      <p className="text-sm font-medium mb-3">{t("browsers")}</p>
      <div className="flex flex-col gap-2">
        {browsers.map((b) => (
          <div
            key={b.browser}
            className="flex items-center justify-between text-xs"
          >
            <span className="font-medium">{b.browser}</span>
            <span className="text-muted-foreground">
              {formatNumber(b.clicks)} · {b.percentage.toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentClicksTable({ clicks, locale, t }: { clicks: RecentClick[]; locale: string; t: TFunc }) {
  if (clicks.length === 0) {
    return (
      <div className="rounded-lg border p-4">
        <p className="text-sm font-medium mb-3">{t("recentClicks")}</p>
        <p className="text-xs text-muted-foreground text-center py-6">
          {t("noClicks")}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <div className="px-4 pt-4 pb-2">
        <p className="text-sm font-medium">{t("recentClicks")}</p>
        <p className="text-xs text-muted-foreground">
          {t("lastClicks", { count: clicks.length })}
        </p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs">{t("when")}</TableHead>
            <TableHead className="text-xs">{t("location")}</TableHead>
            <TableHead className="text-xs">{t("device")}</TableHead>
            <TableHead className="text-xs">{t("source")}</TableHead>
            <TableHead className="text-xs">{t("status")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clicks.map((click) => (
            <TableRow key={click.id} className={click.failed ? "bg-red-500/5" : undefined}>
              <TableCell className="text-xs whitespace-nowrap">
                {new Date(click.clickedAt).toLocaleDateString(locale, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </TableCell>
              <TableCell className="text-xs">
                {click.country ? (
                  <>
                    <span className="mr-1">{countryFlag(click.country)}</span>
                    {click.city ? `${click.city}` : click.country}
                  </>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="text-xs capitalize">
                {click.device ?? "—"}
                {click.isQr && (
                  <span className="ml-1.5 inline-flex items-center text-muted-foreground">
                    <QrCode className="h-3 w-3" />
                  </span>
                )}
              </TableCell>
              <TableCell className="text-xs capitalize">
                {click.referrerSource ?? t("direct")}
              </TableCell>
              <TableCell className="text-xs">
                {click.failed ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-red-500/10 px-1.5 py-0.5 text-xs font-medium text-red-600 dark:text-red-400">
                    {t("statusFailed")}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    {t("statusOk")}
                  </span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function UtmCampaignsList({ campaigns, t }: { campaigns: UtmCampaign[]; t: TFunc }) {
  return (
    <div className="rounded-lg border">
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <Megaphone className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-medium">{t("campaigns")}</p>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {t("campaignsDescription")}
        </p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs">{t("campaign")}</TableHead>
            <TableHead className="text-xs">{t("sourceMedium")}</TableHead>
            <TableHead className="text-xs text-right">{t("clicks")}</TableHead>
            <TableHead className="text-xs text-right w-17.5">{t("share")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((c, i) => (
            <TableRow key={`${c.campaign}-${c.source}-${c.medium}-${i}`}>
              <TableCell className="text-xs font-medium">
                {c.campaign}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {[c.source, c.medium].filter(Boolean).join(" / ") || "—"}
              </TableCell>
              <TableCell className="text-xs text-right font-medium">
                {formatNumber(c.clicks)}
              </TableCell>
              <TableCell className="text-xs text-right text-muted-foreground">
                {c.percentage.toFixed(0)}%
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

const healthChartConfig = {
  ok: { label: "OK", color: "var(--color-emerald-500, #10b981)" },
  failures: { label: "Broken", color: "var(--color-red-500, #ef4444)" },
} satisfies ChartConfig;

function HealthCard({
  summary,
  timeline,
  locale,
  t,
}: {
  summary: HealthCheckSummary;
  timeline: HealthTimelinePoint[];
  locale: string;
  t: TFunc;
}) {
  const hasChecks = summary.totalChecks > 0;
  const uptimeColor =
    summary.uptimePercent >= 99
      ? "text-emerald-600 dark:text-emerald-500"
      : summary.uptimePercent >= 90
        ? "text-amber-600 dark:text-amber-500"
        : "text-red-600 dark:text-red-500";

  const UptimeIcon = summary.uptimePercent >= 90 ? ShieldCheck : ShieldAlert;

  const formatDateShort = (iso: string) =>
    new Date(iso).toLocaleDateString(locale, { month: "short", day: "numeric" });

  return (
    <div className="rounded-lg border p-4">
      <div className="mb-4 flex items-center gap-2">
        <UptimeIcon className={cn("h-4 w-4", uptimeColor)} />
        <p className="text-sm font-medium">{t("health")}</p>
      </div>

      {!hasChecks ? (
        <p className="text-xs text-muted-foreground text-center py-4">{t("noHealthData")}</p>
      ) : (
        <div className="flex flex-col gap-4">
          {/* KPIs */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">{t("uptime")}</span>
              <span className={cn("text-lg font-bold tabular-nums", uptimeColor)}>
                {summary.uptimePercent.toFixed(1)}%
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">{t("totalChecks")}</span>
              <span className="text-lg font-bold tabular-nums">
                {formatNumber(summary.totalChecks)}
              </span>
              {summary.failedChecks > 0 && (
                <span className="text-xs text-red-600 dark:text-red-500">
                  {summary.failedChecks} {t("failures")}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Timer className="h-3 w-3" />
                {t("avgResponse")}
              </span>
              <span className="text-lg font-bold tabular-nums">
                {summary.avgResponseMs != null ? `${summary.avgResponseMs}ms` : "—"}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">{t("fallbackRedirects")}</span>
              <span className={cn(
                "text-lg font-bold tabular-nums",
                summary.fallbackClicks > 0
                  ? "text-amber-600 dark:text-amber-500"
                  : "text-muted-foreground",
              )}>
                {formatNumber(summary.fallbackClicks)}
              </span>
              {summary.fallbackClicks > 0 && (
                <span className="text-xs text-amber-600 dark:text-amber-500">
                  {summary.fallbackShare.toFixed(0)}% {t("ofClicks")}
                </span>
              )}
            </div>
          </div>

          {/* Fallback warning banner */}
          {summary.fallbackShare >= 20 && (
            <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-900 dark:bg-amber-950/30">
              <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-500" />
              <p className="text-xs text-amber-700 dark:text-amber-400">
                {t("fallbackWarning", { percent: summary.fallbackShare.toFixed(0) })}
              </p>
            </div>
          )}

          {/* Timeline chart — response time bars, red when broken */}
          {timeline.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">{t("healthTimeline")}</p>
              <ChartContainer config={healthChartConfig} className="h-24 w-full">
                <BarChart
                  data={timeline}
                  margin={{ left: 0, right: 0, top: 2, bottom: 0 }}
                  barSize={8}
                >
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatDateShort}
                    interval={Math.max(0, Math.floor(timeline.length / 5) - 1)}
                    className="text-[9px]"
                  />
                  <ChartTooltip
                    cursor={{ fill: "var(--muted)", opacity: 0.3 }}
                    content={
                      <ChartTooltipContent
                        labelFormatter={(v) => formatDateShort(v as string)}
                        formatter={(value, name) => [
                          name === "avgResponseMs" ? `${value}ms` : value,
                          name === "avgResponseMs" ? t("avgResponse") : name,
                        ]}
                      />
                    }
                  />
                  <Bar dataKey="avgResponseMs" radius={2}>
                    {timeline.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.failures > 0 ? "#ef4444" : "#10b981"}
                        fillOpacity={0.85}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
              <div className="mt-1 flex items-center gap-4 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-sm bg-emerald-500" />
                  {t("healthOk")}
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-sm bg-red-500" />
                  {t("healthBroken")}
                </span>
                <span className="ml-auto">{t("barHeightIsResponseTime")}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyCard({ title, t }: { title: string; t: TFunc }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-sm font-medium mb-3">{title}</p>
      <p className="text-xs text-muted-foreground text-center py-4">
        {t("noData")}
      </p>
    </div>
  );
}

function LinkAnalyticsSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-7 w-48" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
      <Skeleton className="h-55" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
      <Skeleton className="h-50" />
    </div>
  );
}

function RecentChecksTable({ checks, locale, t }: { checks: RecentCheck[]; locale: string; t: TFunc }) {
  if (checks.length === 0) {
    return (
      <div className="rounded-lg border p-4">
        <p className="text-sm font-medium mb-3">{t("recentChecks")}</p>
        <p className="text-xs text-muted-foreground text-center py-6">
          {t("noChecks")}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <div className="px-4 pt-4 pb-2">
        <p className="text-sm font-medium">{t("recentChecks")}</p>
        <p className="text-xs text-muted-foreground">
          {t("lastChecks", { count: checks.length })}
        </p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs">{t("checkedAt")}</TableHead>
            <TableHead className="text-xs">{t("statusCode")}</TableHead>
            <TableHead className="text-xs">{t("responseTime")}</TableHead>
            <TableHead className="text-xs">{t("status")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {checks.map((check) => (
            <TableRow key={check.id} className={check.isBroken ? "bg-red-500/5" : undefined}>
              <TableCell className="text-xs whitespace-nowrap">
                {new Date(check.checkedAt).toLocaleDateString(locale, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </TableCell>
              <TableCell className="text-xs tabular-nums">
                {check.statusCode ?? "—"}
              </TableCell>
              <TableCell className="text-xs tabular-nums">
                {check.responseMs != null ? t("ms", { value: check.responseMs }) : "—"}
              </TableCell>
              <TableCell className="text-xs">
                {check.isBroken ? (
                  <span className="inline-flex items-center rounded-md bg-red-500/10 px-1.5 py-0.5 text-xs font-medium text-red-600 dark:text-red-400">
                    {t("checkBroken")}
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    {t("checkOk")}
                  </span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
