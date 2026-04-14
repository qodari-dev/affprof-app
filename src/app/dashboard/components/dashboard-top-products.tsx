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
import type { TopProduct } from '@/schemas/analytics';

interface DashboardTopProductsProps {
  topProducts: TopProduct[];
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

export function DashboardTopProducts({ topProducts }: DashboardTopProductsProps) {
  const t = useTranslations('dashboard.topProducts');
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
        {topProducts.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            {t('empty')}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('product')}</TableHead>
                <TableHead className="text-right">{t('clicks')}</TableHead>
                <TableHead className="text-right">{t('trend')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Link
                      href={`/products?id=${product.id}`}
                      className="font-medium hover:underline truncate block max-w-[220px]"
                    >
                      {product.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatNumber(product.clicks)}
                  </TableCell>
                  <TableCell className="text-right">
                    <TrendCell diffPercent={product.diffPercent} newLabel={tc('new')} />
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
