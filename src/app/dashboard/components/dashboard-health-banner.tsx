'use client';

import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { BrokenLink } from '@/schemas/analytics';

interface DashboardHealthBannerProps {
  brokenLinks: BrokenLink[];
}

export function DashboardHealthBanner({ brokenLinks }: DashboardHealthBannerProps) {
  if (brokenLinks.length === 0) return null;

  const first = brokenLinks[0];
  const count = brokenLinks.length;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/50 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
        <div>
          <p className="font-medium text-red-900 dark:text-red-200">
            {count === 1
              ? `1 link is broken right now`
              : `${count} links are broken right now`}
          </p>
          <p className="text-sm text-red-800/80 dark:text-red-300/80 mt-0.5">
            {count === 1
              ? `/${first.slug} in ${first.productName}`
              : `Including /${first.slug} in ${first.productName}`}
          </p>
        </div>
      </div>
      <Link href="/links?status=broken">
        <Button
          variant="outline"
          className="border-red-300 bg-white hover:bg-red-50 dark:bg-red-950 dark:border-red-800 dark:hover:bg-red-900"
        >
          Fix now
        </Button>
      </Link>
    </div>
  );
}
