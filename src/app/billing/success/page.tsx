import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, BadgeCheck, CreditCard } from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';
import { SidebarInset } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Checkout Received — AffProf',
};

export default function BillingSuccessPage() {
  return (
    <SidebarInset>
      <main className="flex min-h-svh flex-1 items-center justify-center px-6 py-10">
        <div className="flex max-w-xl flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
            <BadgeCheck className="h-8 w-8 text-emerald-600" />
          </div>

          <span className="mb-2 text-[5.5rem] font-black leading-none tracking-tighter text-foreground/10">
            PAID
          </span>

          <h1 className="mb-2 text-3xl font-bold tracking-tight">Checkout received</h1>
          <p className="mb-4 max-w-md text-muted-foreground">
            Stripe accepted the payment. AffProf will finalize your subscription as soon as the webhook confirms the billing event.
          </p>

          <div className="mb-8 rounded-2xl border bg-muted/25 p-4 text-left">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-xl bg-background p-2 shadow-sm ring-1 ring-border">
                <CreditCard className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">What happens next</p>
                <p>Your plan updates when Stripe sends the webhook successfully.</p>
                <p>If billing still shows Free after a minute, check the webhook terminal and retry the event.</p>
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
