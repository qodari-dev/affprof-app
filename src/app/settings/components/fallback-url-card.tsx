'use client';

import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Globe, Loader2, Save, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Skeleton } from '@/components/ui/skeleton';
import { UpdateUserSettingsBodySchema } from '@/schemas/user-settings';
import { useUserSettings, useUpdateUserSettings } from '@/hooks/queries/use-user-settings-queries';

type FormValues = Pick<z.infer<typeof UpdateUserSettingsBodySchema>, 'defaultFallbackUrl'>;

const FallbackUrlSchema = z.object({
  defaultFallbackUrl: UpdateUserSettingsBodySchema.shape.defaultFallbackUrl,
});

export function FallbackUrlCard() {
  const t = useTranslations('settings.fallbackUrl');
  const { data: settingsData, isLoading } = useUserSettings();
  const { mutateAsync: updateSettings, isPending: isSaving } = useUpdateUserSettings();
  const [isFormReady, setIsFormReady] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(FallbackUrlSchema),
    defaultValues: { defaultFallbackUrl: null },
  });

  React.useEffect(() => {
    if (settingsData?.status === 200 && settingsData.body) {
      form.reset({ defaultFallbackUrl: settingsData.body.defaultFallbackUrl ?? null });
      setIsFormReady(true);
    }
  }, [settingsData, form]);

  const onSubmit = React.useCallback(
    async (values: FormValues) => {
      try {
        const result = await updateSettings({ body: values });
        if (result.status === 200) {
          toast.success(t('toastSaved'));
        }
      } catch {
        // Error handled by mutation onError
      }
    },
    [updateSettings, t],
  );

  if (isLoading || !isFormReady) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
              <Globe className="size-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <CardTitle>{t('title')}</CardTitle>
              <CardDescription>{t('description')}</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* When is this used? */}
          <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/60 dark:bg-amber-950/20">
            <ShieldAlert className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="text-sm text-amber-800 dark:text-amber-300">
              {t('whenUsed')}
            </p>
          </div>

          <Controller
            name="defaultFallbackUrl"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel>{t('label')}</FieldLabel>
                <Input
                  type="text"
                  placeholder={t('placeholder')}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value || null)}
                />
                <FieldDescription>{t('help')}</FieldDescription>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </CardContent>

        <CardFooter className="flex justify-end border-t bg-muted/10">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
            {t('save')}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
