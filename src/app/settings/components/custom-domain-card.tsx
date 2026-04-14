'use client';

import * as React from 'react';
import { CheckCircle2, Copy, ExternalLink, Globe, Loader2, ShieldCheck, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useBilling } from '@/hooks/queries/use-billing-queries';
import {
  useCreateCustomDomain,
  useCustomDomains,
  useDeleteCustomDomain,
  useSetPrimaryCustomDomain,
  useVerifyCustomDomain,
} from '@/hooks/queries/use-custom-domain-queries';
import { getTsRestErrorMessage } from '@/utils/get-ts-rest-error-message';

function CopyRow({
  label,
  name,
  value,
  nameLabel,
  copiedMessage,
}: {
  label: string;
  name: string;
  value: string;
  nameLabel: string;
  copiedMessage: string;
}) {
  const handleCopy = React.useCallback(async () => {
    await navigator.clipboard.writeText(value);
    toast.success(copiedMessage);
  }, [copiedMessage, value]);

  return (
    <div className="rounded-xl border bg-muted/20 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="text-sm font-medium">{label}</div>
          <div className="text-xs text-muted-foreground">{nameLabel}: {name}</div>
          <code className="block break-all rounded-md bg-background px-2 py-1.5 text-xs">{value}</code>
        </div>
        <Button type="button" size="icon" variant="outline" className="size-9 rounded-lg" onClick={handleCopy}>
          <Copy className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function getStatusBadgeVariant(status: 'pending' | 'verified') {
  return status === 'verified' ? 'secondary' : 'outline';
}

export function CustomDomainCard() {
  const t = useTranslations('settings.customDomain');
  const { data: domainsData, isLoading } = useCustomDomains();
  const { data: billingData, isLoading: isLoadingBilling } = useBilling();
  const { mutateAsync: createDomain, isPending: isCreating } = useCreateCustomDomain();
  const { mutateAsync: verifyDomain, isPending: isVerifying } = useVerifyCustomDomain();
  const { mutateAsync: setPrimaryDomain, isPending: isSettingPrimary } = useSetPrimaryCustomDomain();
  const { mutateAsync: deleteDomain, isPending: isDeleting } = useDeleteCustomDomain();

  const [hostname, setHostname] = React.useState('');
  const [localError, setLocalError] = React.useState<string | null>(null);

  const domains = domainsData?.status === 200 ? domainsData.body : [];
  const subscription = billingData?.status === 200 ? billingData.body : null;
  const isPro = subscription ? subscription.plan !== 'free' : false;
  const currentDomain = domains[0] ?? null;

  const handleCreate = React.useCallback(async () => {
    if (!hostname.trim()) {
      setLocalError(t('invalidHostname'));
      return;
    }

    setLocalError(null);

    try {
      await createDomain({
        body: {
          hostname,
        },
      });
      setHostname('');
      toast.success(t('toastDomainAdded'));
    } catch (error) {
      setLocalError(getTsRestErrorMessage(error));
    }
  }, [createDomain, hostname, t]);

  const handleVerify = React.useCallback(async () => {
    if (!currentDomain) return;

    try {
      await verifyDomain({
        params: { id: currentDomain.id },
        body: {},
      });
      toast.success(t('toastDomainVerified'));
    } catch {
      // handled in mutation
    }
  }, [currentDomain, verifyDomain, t]);

  const handleSetPrimary = React.useCallback(async () => {
    if (!currentDomain) return;

    try {
      await setPrimaryDomain({
        params: { id: currentDomain.id },
        body: {},
      });
      toast.success(t('toastPrimaryUpdated'));
    } catch {
      // handled in mutation
    }
  }, [currentDomain, setPrimaryDomain, t]);

  const handleDelete = React.useCallback(async () => {
    if (!currentDomain) return;

    try {
      await deleteDomain({
        params: { id: currentDomain.id },
      });
      toast.success(t('toastDomainRemoved'));
    } catch {
      // handled in mutation
    }
  }, [currentDomain, deleteDomain, t]);

  if (isLoading || isLoadingBilling) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('cardDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isPro ? (
          <div className="rounded-xl border border-dashed bg-muted/20 p-5">
            <div className="flex items-start gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl border bg-background">
                <Globe className="size-5 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <div className="font-medium">{t('availableOnPro')}</div>
                <p className="text-sm text-muted-foreground">
                  {t('upgradeDescription')}
                </p>
              </div>
            </div>
          </div>
        ) : !currentDomain ? (
          <div className="space-y-4">
            <Field data-invalid={Boolean(localError) || undefined}>
              <FieldLabel>{t('subdomain')}</FieldLabel>
              <Input
                placeholder={t('subdomainPlaceholder')}
                value={hostname}
                onChange={(event) => setHostname(event.target.value)}
              />
              <FieldDescription>
                {t('subdomainHelp')}
              </FieldDescription>
              {localError ? <FieldError errors={[{ message: localError }]} /> : null}
            </Field>

            <div className="rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground">
              {t('dnsHelp')}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="rounded-xl border bg-muted/20 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-base font-semibold">{currentDomain.hostname}</div>
                    <Badge variant={getStatusBadgeVariant(currentDomain.status)}>
                      {currentDomain.status === 'verified' ? t('verified') : t('pendingVerification')}
                    </Badge>
                    {currentDomain.isPrimary ? <Badge variant="outline">{t('primary')}</Badge> : null}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {currentDomain.status === 'verified'
                      ? t('verifiedHelp')
                      : t('pendingHelp')}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentDomain.status === 'pending' ? (
                    <Button type="button" size="sm" onClick={handleVerify} disabled={isVerifying}>
                      {isVerifying ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
                      {t('verify')}
                    </Button>
                  ) : null}
                  {currentDomain.status === 'verified' && !currentDomain.isPrimary ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleSetPrimary}
                      disabled={isSettingPrimary}
                    >
                      {isSettingPrimary ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
                      {t('setPrimary')}
                    </Button>
                  ) : null}
                  <Button type="button" size="sm" variant="outline" onClick={handleDelete} disabled={isDeleting}>
                    {isDeleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
                    {t('remove')}
                  </Button>
                </div>
              </div>
            </div>

            {currentDomain.status === 'pending' ? (
              <div className="space-y-3">
                <CopyRow
                  label={t('txtRecord')}
                  name={currentDomain.verificationHost}
                  value={currentDomain.verificationValue}
                  nameLabel={t('recordName')}
                  copiedMessage={t('copied', { label: t('txtRecord') })}
                />
                <CopyRow
                  label={t('cnameRecord')}
                  name={currentDomain.hostname}
                  value={currentDomain.cnameTarget}
                  nameLabel={t('recordName')}
                  copiedMessage={t('copied', { label: t('cnameRecord') })}
                />
                <div className="rounded-xl border border-dashed bg-background p-4 text-sm text-muted-foreground">
                  {t('dnsUpdateHelp')}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border bg-emerald-50/70 p-4 text-sm text-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-100">
                {t('brandedLinksActive', { hostname: currentDomain.hostname })}
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-3 border-t bg-muted/10 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {t('proLimitNote')}
        </p>
        {!currentDomain && isPro ? (
          <Button type="button" size="sm" onClick={handleCreate} disabled={isCreating}>
            {isCreating ? <Loader2 className="animate-spin" /> : <ExternalLink />}
            {t('addDomain')}
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  );
}
