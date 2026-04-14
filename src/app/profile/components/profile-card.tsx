'use client';

import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Skeleton } from '@/components/ui/skeleton';
import { UpdateProfileBodySchema } from '@/schemas/profile';
import {
  getPrimaryVerifiedCustomDomainHostname,
  useCustomDomains,
} from '@/hooks/queries/use-custom-domain-queries';
import { useProfile, useUpdateProfile } from '@/hooks/queries/use-profile-queries';
import { useLocale } from '@/hooks/use-locale';
import { buildShortLinkPattern } from '@/utils/short-link';
import type { Locale } from '@/i18n/config';

type FormValues = z.infer<typeof UpdateProfileBodySchema>;

const COMMON_TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Bogota',
  'America/Sao_Paulo',
  'America/Buenos_Aires',
  'America/Mexico_City',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Madrid',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Kolkata',
  'Asia/Dubai',
  'Australia/Sydney',
  'Pacific/Auckland',
];

export function ProfileCard() {
  const t = useTranslations('profile.form');
  const tLang = useTranslations('settings.language');
  const { data: profileData, isLoading } = useProfile();
  const { data: customDomainsData } = useCustomDomains();
  const { mutateAsync: updateProfile, isPending: isSaving } = useUpdateProfile();
  const { setLocale } = useLocale();
  const [isFormReady, setIsFormReady] = React.useState(false);
  const primaryCustomDomain = customDomainsData?.status === 200
    ? getPrimaryVerifiedCustomDomainHostname(customDomainsData.body)
    : null;

  const form = useForm<FormValues>({
    resolver: zodResolver(UpdateProfileBodySchema),
    defaultValues: {
      name: '',
      slug: '',
      timezone: 'UTC',
      language: 'en',
    },
  });

  React.useEffect(() => {
    if (profileData?.status === 200 && profileData.body) {
      const u = profileData.body;
      form.reset({
        name: u.name ?? '',
        slug: u.slug ?? '',
        timezone: u.timezone ?? 'UTC',
        language: (u.language as 'en' | 'es') ?? 'en',
      });
      setIsFormReady(true);
    }
  }, [profileData, form]);

  const onSubmit = React.useCallback(
    async (values: FormValues) => {
      try {
        const result = await updateProfile({ body: values });
        if (result.status === 200) {
          toast.success(t('success'));

          // If language changed, update the cookie and refresh
          if (values.language) {
            setLocale(values.language as Locale);
          }
        }
      } catch {
        // Error handled by mutation onError
      }
    },
    [updateProfile, setLocale, t]
  );

  if (isLoading || !isFormReady) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('cardTitle')}</CardTitle>
          <CardDescription>{t('cardDescription')}</CardDescription>
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
          <CardTitle>{t('cardTitle')}</CardTitle>
          <CardDescription>{t('cardDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {/* Name */}
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel>{t('name')}</FieldLabel>
                <Input
                  placeholder={t('namePlaceholder')}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* Slug */}
          <Controller
            name="slug"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel>{t('slug')}</FieldLabel>
                <Input
                  placeholder={t('slugPlaceholder')}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                />
                <FieldDescription>
                  {t('slugHelp')} <strong>{buildShortLinkPattern(field.value || 'my-brand', 'link-slug', primaryCustomDomain)}</strong>
                </FieldDescription>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* Timezone */}
          <Controller
            name="timezone"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel>{t('timezone')}</FieldLabel>
                <select
                  className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
                  value={field.value ?? 'UTC'}
                  onChange={field.onChange}
                >
                  {COMMON_TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
                <FieldDescription>
                  {t('timezoneHelp')}
                </FieldDescription>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* Language */}
          <Controller
            name="language"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel>{tLang('title')}</FieldLabel>
                <select
                  className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
                  value={field.value ?? 'en'}
                  onChange={field.onChange}
                >
                  <option value="en">{tLang('en')}</option>
                  <option value="es">{tLang('es')}</option>
                </select>
                <FieldDescription>
                  {tLang('description')}
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
