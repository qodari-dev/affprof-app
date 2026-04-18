import * as React from 'react';

import { env } from '@/env';
import { canSendResendEmail, sendResendEmail } from '@/server/clients/resend';
import { SubscriptionActivatedEmail } from '@/server/emails/subscription-activated-email';
import { type EmailLocale, getSubscriptionTranslations, getWelcomeTranslations } from '@/server/emails/translations';
import { WelcomeEmail } from '@/server/emails/welcome-email';

// ─── Welcome ─────────────────────────────────────────────────────────────────

type SendWelcomeEmailInput = {
  userEmail: string;
  userName: string;
  locale?: EmailLocale;
};

export async function sendWelcomeEmail(input: SendWelcomeEmailInput) {
  if (!canSendResendEmail()) return;

  const locale = input.locale ?? 'en';
  const t = getWelcomeTranslations(locale);

  await sendResendEmail({
    from: env.RESEND_FROM_EMAIL!,
    to: [input.userEmail],
    subject: t.subject,
    react: React.createElement(WelcomeEmail, {
      userName: input.userName,
      appUrl: env.NEXT_PUBLIC_APP_URL,
      locale,
    }),
    text: `Hi ${input.userName},\n\nWelcome to AffProf!\n\nGet started: ${env.NEXT_PUBLIC_APP_URL}/links`,
  });
}

// ─── Subscription activated ──────────────────────────────────────────────────

type SendSubscriptionActivatedEmailInput = {
  userEmail: string;
  userName: string;
  plan: 'pro' | 'pro_annual';
  isTrial: boolean;
  trialEndDate?: string;
  locale?: EmailLocale;
};

export async function sendSubscriptionActivatedEmail(input: SendSubscriptionActivatedEmailInput) {
  if (!canSendResendEmail()) return;

  const locale = input.locale ?? 'en';
  const t = getSubscriptionTranslations(locale);
  const planLabel = input.plan === 'pro_annual' ? 'Pro Annual' : 'Pro';
  const subject = input.isTrial ? t.subjectTrial(planLabel) : t.subjectPaid(planLabel);

  await sendResendEmail({
    from: env.RESEND_FROM_EMAIL!,
    to: [input.userEmail],
    subject,
    react: React.createElement(SubscriptionActivatedEmail, {
      userName: input.userName,
      plan: input.plan,
      isTrial: input.isTrial,
      trialEndDate: input.trialEndDate,
      appUrl: env.NEXT_PUBLIC_APP_URL,
      locale,
    }),
    text: `Hi ${input.userName},\n\nYour ${planLabel} ${input.isTrial ? 'trial is now active' : 'subscription is now active'}.\n\nExplore: ${env.NEXT_PUBLIC_APP_URL}/dashboard`,
  });
}
