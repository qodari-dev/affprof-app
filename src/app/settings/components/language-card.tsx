'use client';

import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useProfile, useUpdateProfile } from '@/hooks/queries/use-profile-queries';
import { useLocale } from '@/hooks/use-locale';
import { type Locale } from '@/i18n/config';

export function LanguageCard() {
  const t = useTranslations('settings.language');
  const { data: profileData, isLoading } = useProfile();
  const { mutateAsync: updateProfile, isPending } = useUpdateProfile();
  const { setLocale } = useLocale();

  const currentLanguage = profileData?.status === 200 ? profileData.body.language : 'en';

  async function handleChange(value: string | null) {
    if (!value) return;
    const locale = value as Locale;

    try {
      await updateProfile({ body: { language: locale } });
      setLocale(locale); // Sets cookie + refreshes page
    } catch {
      // Error handled by mutation's onError
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-48" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Select value={currentLanguage} onValueChange={handleChange} disabled={isPending}>
          <SelectTrigger className="w-48">
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SelectValue />
            )}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">{t('en')}</SelectItem>
            <SelectItem value="es">{t('es')}</SelectItem>
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
