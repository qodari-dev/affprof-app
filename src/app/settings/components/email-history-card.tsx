'use client';

import * as React from 'react';
import { BellRing, MailWarning } from 'lucide-react';
import { format } from 'date-fns';

import { useNotificationHistory } from '@/hooks/queries/use-notification-history-queries';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

type TypeFilter = 'all' | 'broken_links' | 'weekly_digest';
type StatusFilter = 'all' | 'processing' | 'sent' | 'failed';

const TYPE_OPTIONS: Array<{ value: TypeFilter; label: string }> = [
  { value: 'all', label: 'All types' },
  { value: 'broken_links', label: 'Broken links' },
  { value: 'weekly_digest', label: 'Weekly digest' },
];

const STATUS_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: 'All status' },
  { value: 'sent', label: 'Sent' },
  { value: 'processing', label: 'Processing' },
  { value: 'failed', label: 'Failed' },
];

function formatDispatchType(value: string) {
  return value === 'broken_links' ? 'Broken links' : 'Weekly digest';
}

function formatDispatchStatus(value: string) {
  if (value === 'sent') return 'Sent';
  if (value === 'failed') return 'Failed';
  return 'Processing';
}

function getStatusVariant(value: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (value === 'sent') return 'secondary';
  if (value === 'failed') return 'destructive';
  return 'outline';
}

function getTypeVariant(value: string): 'default' | 'outline' {
  return value === 'broken_links' ? 'default' : 'outline';
}

export function EmailHistoryCard() {
  const { data, isLoading } = useNotificationHistory();
  const [typeFilter, setTypeFilter] = React.useState<TypeFilter>('all');
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('all');

  const history = React.useMemo(() => {
    if (data?.status === 200) {
      return data.body;
    }

    return [];
  }, [data]);

  const filteredHistory = React.useMemo(
    () =>
      history.filter((item) => {
        const matchesType = typeFilter === 'all' || item.type === typeFilter;
        const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
        return matchesType && matchesStatus;
      }),
    [history, statusFilter, typeFilter],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email history</CardTitle>
        <CardDescription>
          Review sent, failed, and pending notification emails. This history is also used to prevent duplicate deliveries.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {TYPE_OPTIONS.map((option) => (
              <Button
                key={option.value}
                type="button"
                size="sm"
                variant={typeFilter === option.value ? 'default' : 'outline'}
                onClick={() => setTypeFilter(option.value)}
                className="h-9 rounded-lg"
              >
                {option.label}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((option) => (
              <Button
                key={option.value}
                type="button"
                size="sm"
                variant={statusFilter === option.value ? 'secondary' : 'outline'}
                onClick={() => setStatusFilter(option.value)}
                className="h-9 rounded-lg"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : filteredHistory.length === 0 ? (
          <Empty className="border border-dashed bg-muted/20">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <MailWarning />
              </EmptyMedia>
              <EmptyTitle>No email history yet</EmptyTitle>
              <EmptyDescription>
                Sent alerts and weekly digests will appear here once the scheduler starts delivering them.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="overflow-hidden rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="px-4">Type</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="pr-4">Sent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="px-4 py-3 align-top">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'inline-flex size-8 items-center justify-center rounded-lg border',
                            item.type === 'broken_links'
                              ? 'border-amber-200 bg-amber-50 text-amber-700'
                              : 'border-emerald-200 bg-emerald-50 text-emerald-700',
                          )}
                        >
                          <BellRing className="size-4" />
                        </span>
                        <Badge variant={getTypeVariant(item.type)}>{formatDispatchType(item.type)}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[360px] py-3 align-top">
                      <div className="space-y-1">
                        <div className="font-medium leading-snug whitespace-normal">{item.subject}</div>
                        <div className="text-xs text-muted-foreground">
                          To: {item.toEmail}
                          {item.ccEmail ? ` · CC: ${item.ccEmail}` : ''}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 align-top">
                      <Badge variant={getStatusVariant(item.status)}>{formatDispatchStatus(item.status)}</Badge>
                    </TableCell>
                    <TableCell className="py-3 align-top text-sm text-muted-foreground">
                      {format(new Date(item.createdAt), 'MMM d, yyyy · h:mm a')}
                    </TableCell>
                    <TableCell className="pr-4 py-3 align-top text-sm text-muted-foreground">
                      {item.sentAt ? format(new Date(item.sentAt), 'MMM d, yyyy · h:mm a') : '—'}
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
