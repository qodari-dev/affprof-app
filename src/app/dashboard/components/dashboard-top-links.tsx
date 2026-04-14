'use client';

import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
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

function TrendCell({ diffPercent, newLabel }: { diffPercent: number | null; newLabel: string }) {
  if (diffPercent === null) {
    return <span className="text-xs text-muted-foreground">{newLabel}</span>;
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
  const t = useTranslations('dashboard.topLinks');
  const tc = useTranslations('common');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {t('description')}
        </p>
      </CardHeader>
      <CardContent className="p-0">
        {topLinks.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            {t('empty')}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('link')}</TableHead>
                <TableHead>{t('product')}</TableHead>
                <TableHead className="text-right">{t('clicks')}</TableHead>
                <TableHead className="text-right">{t('trend')}</TableHead>
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
                    <TrendCell diffPercent={link.diffPercent} newLabel={tc('new')} />
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
