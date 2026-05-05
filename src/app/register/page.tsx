import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { getTranslations } from 'next-intl/server';

import type { RegisterBody } from '@/schemas/auth';
import { LOCALE_COOKIE, locales } from '@/i18n/config';

import { RegisterForm } from './components/register-form';

const PLAN_IDS: readonly RegisterBody['plan'][] = ['free', 'pro', 'pro_annual'] as const;

function parsePlan(raw: string | string[] | undefined): RegisterBody['plan'] {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return (PLAN_IDS as readonly string[]).includes(value ?? '')
    ? (value as RegisterBody['plan'])
    : 'free';
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth.register');
  return {
    title: t('metadataTitle'),
    description: t('metadataDescription'),
  };
}

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string | string[] }>;
}) {
  const { plan } = await searchParams;

  const cookieStore = await cookies();
  const rawLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  const language = locales.includes(rawLocale as typeof locales[number])
    ? (rawLocale as typeof locales[number])
    : 'en';

  return <RegisterForm initialPlan={parsePlan(plan)} initialLanguage={language} />;
}
