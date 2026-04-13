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
  Smartphone,
  Tablet,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

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
  DashboardRange,
  BrowserBreakdown,
  DeviceBreakdown,
  RecentClick,
  TopCountry,
  TrafficSource,
  UtmCampaign,
} from "@/schemas/analytics";

// ============================================
// CONFIG
// ============================================

const RANGE_OPTIONS: { value: DashboardRange; label: string }[] = [
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" },
  { value: "90d", label: "90d" },
  { value: "180d", label: "180d" },
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

function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
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
  const { data, isLoading } = useLinkAnalytics(linkId, { range });
  const analytics = data?.body;

  if (isLoading || !analytics) {
    return <LinkAnalyticsSkeleton />;
  }

  const { totalClicks, diffPercent, qrClicks, qrShare } = analytics;

  return (
    <div className="flex flex-col gap-5">
      {/* Range selector */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {formatNumber(totalClicks)} {totalClicks === 1 ? "click" : "clicks"}{" "}
          in period
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

      {/* Mini KPIs row */}
      <div className="grid grid-cols-3 gap-3">
        <MiniKpi
          icon={MousePointerClick}
          label="Total"
          value={formatNumber(totalClicks)}
        />
        <MiniKpi
          icon={QrCode}
          label="QR scans"
          value={
            qrClicks > 0
              ? `${formatNumber(qrClicks)} (${qrShare.toFixed(0)}%)`
              : "0"
          }
        />
        <MiniKpi
          icon={Globe2}
          label="Countries"
          value={String(analytics.countries.length)}
        />
      </div>

      {/* Timeseries chart */}
      <ClicksChart data={analytics.timeseries} peakDay={analytics.peakDay} />

      {/* Two columns: sources + devices */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SourcesList sources={analytics.sources} />
        <DevicesList devices={analytics.devices} />
      </div>

      {/* Two columns: countries + browsers */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <CountriesList countries={analytics.countries} />
        <BrowsersList browsers={analytics.browsers} />
      </div>

      {/* UTM campaigns — only show if there's data */}
      {analytics.utmCampaigns.length > 0 && (
        <UtmCampaignsList campaigns={analytics.utmCampaigns} />
      )}

      {/* Recent clicks */}
      <RecentClicksTable clicks={analytics.recentClicks} />
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

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
}: {
  data: { date: string; clicks: number }[];
  peakDay: { date: string; clicks: number } | null;
}) {
  const hasData = data.some((p) => p.clicks > 0);
  const tickInterval = Math.max(0, Math.floor(data.length / 6) - 1);

  return (
    <div className="rounded-lg border p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium">Clicks over time</p>
        {peakDay && (
          <p className="text-xs text-muted-foreground">
            Peak: {formatDateShort(peakDay.date)} ({peakDay.clicks})
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
                    new Date(v).toLocaleDateString("en-US", {
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
          No clicks in this period.
        </div>
      )}
    </div>
  );
}

function SourcesList({ sources }: { sources: TrafficSource[] }) {
  if (sources.length === 0) return <EmptyCard title="Traffic sources" />;
  return (
    <div className="rounded-lg border p-4">
      <p className="text-sm font-medium mb-3">Traffic sources</p>
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

function DevicesList({ devices }: { devices: DeviceBreakdown[] }) {
  if (devices.length === 0) return <EmptyCard title="Devices" />;
  return (
    <div className="rounded-lg border p-4">
      <p className="text-sm font-medium mb-3">Devices</p>
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

function CountriesList({ countries }: { countries: TopCountry[] }) {
  if (countries.length === 0) return <EmptyCard title="Countries" />;
  return (
    <div className="rounded-lg border p-4">
      <p className="text-sm font-medium mb-3">Countries</p>
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

function BrowsersList({ browsers }: { browsers: BrowserBreakdown[] }) {
  if (browsers.length === 0) return <EmptyCard title="Browsers" />;
  return (
    <div className="rounded-lg border p-4">
      <p className="text-sm font-medium mb-3">Browsers</p>
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

function RecentClicksTable({ clicks }: { clicks: RecentClick[] }) {
  if (clicks.length === 0) {
    return (
      <div className="rounded-lg border p-4">
        <p className="text-sm font-medium mb-3">Recent clicks</p>
        <p className="text-xs text-muted-foreground text-center py-6">
          No clicks recorded yet.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <div className="px-4 pt-4 pb-2">
        <p className="text-sm font-medium">Recent clicks</p>
        <p className="text-xs text-muted-foreground">
          Last {clicks.length} clicks
        </p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs">When</TableHead>
            <TableHead className="text-xs">Location</TableHead>
            <TableHead className="text-xs">Device</TableHead>
            <TableHead className="text-xs">Source</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clicks.map((click) => (
            <TableRow key={click.id}>
              <TableCell className="text-xs whitespace-nowrap">
                {new Date(click.clickedAt).toLocaleDateString("en-US", {
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
                {click.referrerSource ?? "direct"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function UtmCampaignsList({ campaigns }: { campaigns: UtmCampaign[] }) {
  return (
    <div className="rounded-lg border">
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <Megaphone className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-medium">Campaigns</p>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          Clicks grouped by utm_campaign
        </p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs">Campaign</TableHead>
            <TableHead className="text-xs">Source / Medium</TableHead>
            <TableHead className="text-xs text-right">Clicks</TableHead>
            <TableHead className="text-xs text-right w-17.5">Share</TableHead>
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

function EmptyCard({ title }: { title: string }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-sm font-medium mb-3">{title}</p>
      <p className="text-xs text-muted-foreground text-center py-4">
        No data yet.
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
