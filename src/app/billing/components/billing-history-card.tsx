'use client';

import { format } from 'date-fns';
import { ExternalLink, FileText, ReceiptText } from 'lucide-react';

import { useBillingHistory } from '@/hooks/queries/use-billing-queries';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

function formatInvoiceStatus(status: string | null) {
  if (!status) return 'Unknown';
  return status.replaceAll('_', ' ');
}

function getInvoiceStatusVariant(status: string | null): 'secondary' | 'outline' | 'destructive' {
  if (status === 'paid') return 'secondary';
  if (status === 'open' || status === 'draft') return 'outline';
  return 'destructive';
}

export function BillingHistoryCard() {
  const { data, isLoading } = useBillingHistory();
  const history = data?.status === 200 ? data.body : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing history</CardTitle>
        <CardDescription>
          Recent Stripe invoices for this customer. Use this area to review charges, payment status, and downloadable invoice files.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <Empty className="border border-dashed bg-muted/20">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ReceiptText />
              </EmptyMedia>
              <EmptyTitle>No billing history yet</EmptyTitle>
              <EmptyDescription>
                Once Stripe starts creating invoices for this customer, they will appear here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="overflow-hidden rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="px-4">Invoice</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead className="pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="px-4 py-3">
                      <div className="space-y-1">
                        <div className="font-medium">{invoice.invoiceNumber ?? invoice.id}</div>
                        <div className="text-xs text-muted-foreground">{invoice.id}</div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="font-medium">{formatMoney(invoice.amountPaid || invoice.amountDue, invoice.currency)}</div>
                      <div className="text-xs text-muted-foreground uppercase">{invoice.currency}</div>
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge variant={getInvoiceStatusVariant(invoice.status)}>
                        {formatInvoiceStatus(invoice.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 text-sm text-muted-foreground">
                      {format(new Date(invoice.createdAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="py-3 text-sm text-muted-foreground">
                      {invoice.periodStart && invoice.periodEnd
                        ? `${format(new Date(invoice.periodStart), 'MMM d')} - ${format(new Date(invoice.periodEnd), 'MMM d')}`
                        : '—'}
                    </TableCell>
                    <TableCell className="pr-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {invoice.hostedInvoiceUrl ? (
                          <a
                            href={invoice.hostedInvoiceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className={cn(buttonVariants({ size: 'sm', variant: 'outline' }), 'rounded-lg')}
                          >
                            <ExternalLink />
                            View
                          </a>
                        ) : null}
                        {invoice.invoicePdf ? (
                          <a
                            href={invoice.invoicePdf}
                            target="_blank"
                            rel="noreferrer"
                            className={cn(buttonVariants({ size: 'sm', variant: 'outline' }), 'rounded-lg')}
                          >
                            <FileText />
                            PDF
                          </a>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
