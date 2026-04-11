'use client';

import * as React from 'react';
import { CheckCircle2, Copy, ExternalLink, Globe, Loader2, ShieldCheck, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

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
}: {
  label: string;
  name: string;
  value: string;
}) {
  const handleCopy = React.useCallback(async () => {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  }, [label, value]);

  return (
    <div className="rounded-xl border bg-muted/20 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="text-sm font-medium">{label}</div>
          <div className="text-xs text-muted-foreground">Name: {name}</div>
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
      setLocalError('Enter a subdomain like go.yourbrand.com.');
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
      toast.success('Custom domain added');
    } catch (error) {
      setLocalError(getTsRestErrorMessage(error));
    }
  }, [createDomain, hostname]);

  const handleVerify = React.useCallback(async () => {
    if (!currentDomain) return;

    try {
      await verifyDomain({
        params: { id: currentDomain.id },
        body: {},
      });
      toast.success('Domain verified');
    } catch {
      // handled in mutation
    }
  }, [currentDomain, verifyDomain]);

  const handleSetPrimary = React.useCallback(async () => {
    if (!currentDomain) return;

    try {
      await setPrimaryDomain({
        params: { id: currentDomain.id },
        body: {},
      });
      toast.success('Primary domain updated');
    } catch {
      // handled in mutation
    }
  }, [currentDomain, setPrimaryDomain]);

  const handleDelete = React.useCallback(async () => {
    if (!currentDomain) return;

    try {
      await deleteDomain({
        params: { id: currentDomain.id },
      });
      toast.success('Custom domain removed');
    } catch {
      // handled in mutation
    }
  }, [currentDomain, deleteDomain]);

  if (isLoading || isLoadingBilling) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Custom domain</CardTitle>
          <CardDescription>Use your own branded subdomain for short links.</CardDescription>
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
        <CardTitle>Custom domain</CardTitle>
        <CardDescription>Connect one branded subdomain for your Pro short links.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isPro ? (
          <div className="rounded-xl border border-dashed bg-muted/20 p-5">
            <div className="flex items-start gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl border bg-background">
                <Globe className="size-5 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <div className="font-medium">Available on Pro</div>
                <p className="text-sm text-muted-foreground">
                  Upgrade to Pro to use one custom subdomain like <span className="font-medium text-foreground">go.yourbrand.com</span>.
                </p>
              </div>
            </div>
          </div>
        ) : !currentDomain ? (
          <div className="space-y-4">
            <Field data-invalid={Boolean(localError) || undefined}>
              <FieldLabel>Subdomain</FieldLabel>
              <Input
                placeholder="go.yourbrand.com"
                value={hostname}
                onChange={(event) => setHostname(event.target.value)}
              />
              <FieldDescription>
                Use a subdomain only. Root domains like <span className="font-medium text-foreground">yourbrand.com</span> are not supported yet.
              </FieldDescription>
              {localError ? <FieldError errors={[{ message: localError }]} /> : null}
            </Field>

            <div className="rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground">
              After adding the domain, AffProf will show the exact TXT and CNAME records you need to configure before verification.
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
                      {currentDomain.status === 'verified' ? 'Verified' : 'Pending verification'}
                    </Badge>
                    {currentDomain.isPrimary ? <Badge variant="outline">Primary</Badge> : null}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {currentDomain.status === 'verified'
                      ? 'New links can use this branded domain immediately.'
                      : 'Finish the DNS records below, then verify the domain.'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentDomain.status === 'pending' ? (
                    <Button type="button" size="sm" onClick={handleVerify} disabled={isVerifying}>
                      {isVerifying ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
                      Verify
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
                      Set primary
                    </Button>
                  ) : null}
                  <Button type="button" size="sm" variant="outline" onClick={handleDelete} disabled={isDeleting}>
                    {isDeleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
                    Remove
                  </Button>
                </div>
              </div>
            </div>

            {currentDomain.status === 'pending' ? (
              <div className="space-y-3">
                <CopyRow
                  label="TXT record"
                  name={currentDomain.verificationHost}
                  value={currentDomain.verificationValue}
                />
                <CopyRow
                  label="CNAME record"
                  name={currentDomain.hostname}
                  value={currentDomain.cnameTarget}
                />
                <div className="rounded-xl border border-dashed bg-background p-4 text-sm text-muted-foreground">
                  DNS updates can take a few minutes. Once both records are live, click <span className="font-medium text-foreground">Verify</span>.
                </div>
              </div>
            ) : (
              <div className="rounded-xl border bg-emerald-50/70 p-4 text-sm text-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-100">
                Your branded links now resolve from <span className="font-medium">{currentDomain.hostname}</span>. Existing links can keep the default AffProf domain, and new links can use the branded one.
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-3 border-t bg-muted/10 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          For v1, Pro supports one active custom subdomain.
        </p>
        {!currentDomain && isPro ? (
          <Button type="button" size="sm" onClick={handleCreate} disabled={isCreating}>
            {isCreating ? <Loader2 className="animate-spin" /> : <ExternalLink />}
            Add domain
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  );
}
