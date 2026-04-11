import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, CircleSlash, RefreshCcw } from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';
import { SidebarInset } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Checkout Canceled — AffProf',
};

export default function BillingCanceledPage() {
  return (
    <SidebarInset>
      <main className="flex min-h-svh flex-1 items-center justify-center px-6 py-10">
        <div className="flex max-w-xl flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 dark:bg-amber-500/20">
            <CircleSlash className="h-8 w-8 text-amber-500" />
          </div>

          <span className="mb-2 text-[5.5rem] font-black leading-none tracking-tighter text-foreground/10">
            HOLD
          </span>

          <h1 className="mb-2 text-3xl font-bold tracking-tight">Checkout canceled</h1>
          <p className="mb-4 max-w-md text-muted-foreground">
            No billing change was applied. Your current plan stays the same until you restart checkout and finish the payment flow.
          </p>

          <div className="mb-8 rounded-2xl border bg-muted/25 p-4 text-left">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-xl bg-background p-2 shadow-sm ring-1 ring-border">
                <RefreshCcw className="h-4 w-4 text-amber-500" />
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">You can try again anytime</p>
                <p>Return to billing, pick a plan, and Stripe will open a fresh checkout session.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <Link
              href="/billing"
              className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to billing
            </Link>
            <Link
              href="/dashboard"
              className={cn(buttonVariants({ size: 'lg' }), 'bg-primary text-primary-foreground hover:bg-primary/90')}
            >
              Go to dashboard
            </Link>
          </div>
        </div>
      </main>
    </SidebarInset>
  );
}
