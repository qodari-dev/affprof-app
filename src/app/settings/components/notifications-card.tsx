'use client';

import * as React from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Skeleton } from '@/components/ui/skeleton';
import { UpdateUserSettingsBodySchema } from '@/schemas/user-settings';
import { useUserSettings, useUpdateUserSettings } from '@/hooks/queries/use-user-settings-queries';

type FormValues = z.infer<typeof UpdateUserSettingsBodySchema>;

const WEEKDAY_VALUES = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

export function NotificationsCard() {
  const t = useTranslations('settings.notifications');
  const tw = useTranslations('settings.notifications.weekdays');
  const { data: settingsData, isLoading } = useUserSettings();
  const { mutateAsync: updateSettings, isPending: isSaving } = useUpdateUserSettings();
  const [isFormReady, setIsFormReady] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(UpdateUserSettingsBodySchema),
    defaultValues: {
      emailOnBrokenLink: true,
      weeklyDigest: true,
      digestDay: 'monday',
      ccEmail: null,
      defaultFallbackUrl: null,
    },
  });

  React.useEffect(() => {
    if (settingsData?.status === 200 && settingsData.body) {
      const s = settingsData.body;
      form.reset({
        emailOnBrokenLink: s.emailOnBrokenLink ?? true,
        weeklyDigest: s.weeklyDigest ?? true,
        digestDay: (s.digestDay as FormValues['digestDay']) ?? 'monday',
        ccEmail: s.ccEmail ?? null,
        defaultFallbackUrl: s.defaultFallbackUrl ?? null,
      });
      setIsFormReady(true);
    }
  }, [settingsData, form]);

  const weeklyDigestEnabled = useWatch({
    control: form.control,
    name: 'weeklyDigest',
  });

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
    [updateSettings, t]
  );

  if (isLoading || !isFormReady) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {/* Broken link alert */}
          <Controller
            name="emailOnBrokenLink"
            control={form.control}
            render={({ field }) => (
              <Field orientation="horizontal">
                <Switch
                  checked={field.value ?? true}
                  onCheckedChange={field.onChange}
                />
                <div className="flex flex-col gap-0.5">
                  <FieldLabel>{t('brokenLinkAlerts')}</FieldLabel>
                  <FieldDescription>
                    {t('brokenLinkAlertsHelp')}
                  </FieldDescription>
                </div>
              </Field>
            )}
          />

          {/* Weekly digest toggle */}
          <Controller
            name="weeklyDigest"
            control={form.control}
            render={({ field }) => (
              <Field orientation="horizontal">
                <Switch
                  checked={field.value ?? true}
                  onCheckedChange={field.onChange}
                />
                <div className="flex flex-col gap-0.5">
                  <FieldLabel>{t('weeklyDigest')}</FieldLabel>
                  <FieldDescription>
                    {t('weeklyDigestHelp')}
                  </FieldDescription>
                </div>
              </Field>
            )}
          />

          {/* Digest day */}
          <Controller
            name="digestDay"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel>{t('digestDay')}</FieldLabel>
                <select
                  className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
                  value={field.value ?? 'monday'}
                  onChange={field.onChange}
                  disabled={!weeklyDigestEnabled}
                >
                  {WEEKDAY_VALUES.map((day) => (
                    <option key={day} value={day}>
                      {tw(day)}
                    </option>
                  ))}
                </select>
                <FieldDescription>
                  {t('digestDayHelp')}
                </FieldDescription>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* CC email */}
          <Controller
            name="ccEmail"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel>{t('ccEmail')}</FieldLabel>
                <Input
                  type="email"
                  placeholder={t('ccEmailPlaceholder')}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value || null)}
                />
                <FieldDescription>
                  {t('ccEmailHelp')}
                </FieldDescription>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* Default fallback URL */}
          <Controller
            name="defaultFallbackUrl"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel>{t('defaultFallbackUrl')}</FieldLabel>
                <Input
                  type="url"
                  placeholder={t('defaultFallbackUrlPlaceholder')}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value || null)}
                />
                <FieldDescription>
                  {t('defaultFallbackUrlHelp')}
                </FieldDescription>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" size="sm" disabled={isSaving}>
            {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
            {t('save')}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
