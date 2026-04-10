'use client';

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import type { PeakDay, TimeseriesPoint } from '@/schemas/analytics';

interface DashboardChartProps {
  data: TimeseriesPoint[];
  peakDay: PeakDay | null;
}

const chartConfig = {
  clicks: {
    label: 'Clicks',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig;

function formatDateShort(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatPeakDay(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function DashboardChart({ data, peakDay }: DashboardChartProps) {
  const hasData = data.some((p) => p.clicks > 0);
  const total = data.reduce((acc, p) => acc + p.clicks, 0);

  // When range is very long, thin out X-axis labels
  const tickInterval = Math.max(0, Math.floor(data.length / 8) - 1);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Clicks over time</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {total.toLocaleString('en-US')} {total === 1 ? 'click' : 'clicks'} in
            selected period
            {peakDay && (
              <>
                {' · '}
                <span>
                  Best day:{' '}
                  <span className="font-medium text-foreground">
                    {formatPeakDay(peakDay.date)}
                  </span>{' '}
                  ({peakDay.clicks.toLocaleString('en-US')})
                </span>
              </>
            )}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ChartContainer config={chartConfig} className="h-[280px] w-full">
            <AreaChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="fillClicks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-clicks)" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="var(--color-clicks)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={formatDateShort}
                interval={tickInterval}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={32}
                allowDecimals={false}
              />
              <ChartTooltip
                cursor={{ stroke: 'var(--border)', strokeDasharray: '3 3' }}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
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
                fill="url(#fillClicks)"
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
            No clicks in this period yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
