import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function BillingCanceledPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Checkout canceled</CardTitle>
          <CardDescription>
            No billing change was applied. You can return to billing whenever you want to restart the Stripe checkout flow.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/billing"
            className={cn(buttonVariants({ size: 'lg', variant: 'outline' }), 'rounded-lg')}
          >
            Back to billing
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
