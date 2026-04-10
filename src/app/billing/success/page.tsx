import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function BillingSuccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Checkout received</CardTitle>
          <CardDescription>
            Stripe accepted the checkout. Your subscription will be finalized by webhook and reflected in billing shortly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/billing"
            className={cn(buttonVariants({ size: 'lg' }), 'rounded-lg')}
          >
            Back to billing
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
