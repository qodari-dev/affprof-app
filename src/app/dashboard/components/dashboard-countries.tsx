'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { TopCountry } from '@/schemas/analytics';

interface DashboardCountriesProps {
  countries: TopCountry[];
}

function formatNumber(n: number) {
  return new Intl.NumberFormat('en-US').format(n);
}

function countryFlag(code: string) {
  if (!code || code.length !== 2) return '🌐';
  const base = 0x1f1e6;
  const chars = code
    .toUpperCase()
    .split('')
    .map((c) => String.fromCodePoint(base + (c.charCodeAt(0) - 'A'.charCodeAt(0))));
  return chars.join('');
}

export function DashboardCountries({ countries }: DashboardCountriesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top countries</CardTitle>
        <p className="text-sm text-muted-foreground">
          Where your audience is clicking from
        </p>
      </CardHeader>
      <CardContent className="p-0">
        {countries.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            No country data yet.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Country</TableHead>
                <TableHead className="text-right">Clicks</TableHead>
                <TableHead className="text-right w-[120px]">Share</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {countries.map((country) => (
                <TableRow key={country.code}>
                  <TableCell>
                    <span className="mr-2 text-base">{countryFlag(country.code)}</span>
                    <span className="font-medium">{country.code}</span>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatNumber(country.clicks)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {country.percentage.toFixed(1)}%
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
