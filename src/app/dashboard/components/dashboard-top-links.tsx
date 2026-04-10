'use client';

import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { TopLink } from '@/schemas/analytics';

interface DashboardTopLinksProps {
  topLinks: TopLink[];
}

function formatNumber(n: number) {
  return new Intl.NumberFormat('en-US').format(n);
}

function TrendCell({ diffPercent }: { diffPercent: number | null }) {
  if (diffPercent === null) {
    return <span className="text-xs text-muted-foreground">new</span>;
  }
  const up = diffPercent >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 text-xs font-medium justify-end',
        up ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-600 dark:text-red-500',
      )}
    >
      <Icon className="h-3 w-3" />
      {Math.abs(diffPercent).toFixed(0)}%
    </span>
  );
}

export function DashboardTopLinks({ topLinks }: DashboardTopLinksProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top performing links</CardTitle>
        <p className="text-sm text-muted-foreground">
          Best links in the selected period
        </p>
      </CardHeader>
      <CardContent className="p-0">
        {topLinks.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            No clicks recorded yet.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Link</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Clicks</TableHead>
                <TableHead className="text-right">Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topLinks.map((link) => (
                <TableRow key={link.id}>
                  <TableCell>
                    <Link
                      href={`/links?id=${link.id}`}
                      className="font-medium hover:underline"
                    >
                      /{link.slug}
                    </Link>
                    <p className="text-xs text-muted-foreground capitalize">
                      {link.platform}
                    </p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[160px] truncate">
                    {link.productName}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatNumber(link.clicks)}
                  </TableCell>
                  <TableCell className="text-right">
                    <TrendCell diffPercent={link.diffPercent} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
