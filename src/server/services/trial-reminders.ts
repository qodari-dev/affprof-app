import * as React from 'react';
import { and, eq, gt, isNotNull, lte, ne } from 'drizzle-orm';

import { env } from '@/env';
import { canSendResendEmail, sendResendEmail } from '@/server/clients/resend';
import { db, subscriptions, users } from '@/server/db';
import { TrialEndingReminderEmail } from '@/server/emails/trial-ending-reminder-email';
import { type EmailLocale, getTrialReminderTranslations } from '@/server/emails/translations';
import { sendTrackedEmailNotification } from '@/server/services/notification-dispatches';

type TrialReminderTarget = {
  userId: string;
  email: string;
  name: string;
  language: string;
  stripeSubscriptionId: string;
  trialEndsAt: Date;
};

export type TrialReminderRunResult = {
  eligibleUsers: number;
  sentCount: number;
  skippedCount: number;
  failedCount: number;
};

function formatTrialEndDate(date: Date, locale: EmailLocale) {
  return date.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

async function getTrialReminderTargets(now: Date) {
  const windowEnd = new Date(now);
  windowEnd.setDate(windowEnd.getDate() + 3);

  const rows = await db
    .select({
      userId: users.id,
      email: users.email,
      name: users.name,
      language: users.language,
      stripeSubscriptionId: subscriptions.stripeSubscriptionId,
      trialEndsAt: subscriptions.trialEndsAt,
    })
    .from(subscriptions)
    .innerJoin(users, eq(users.id, subscriptions.userId))
    .where(
      and(
        eq(subscriptions.status, 'active'),
        ne(subscriptions.plan, 'free'),
        isNotNull(subscriptions.stripeSubscriptionId),
        isNotNull(subscriptions.trialEndsAt),
        gt(subscriptions.trialEndsAt, now),
        lte(subscriptions.trialEndsAt, windowEnd),
      ),
    );

  return rows.filter((row): row is TrialReminderTarget =>
    Boolean(row.stripeSubscriptionId && row.trialEndsAt),
  );
}

async function sendTrialReminder(target: TrialReminderTarget) {
  const locale = (target.language === 'es' ? 'es' : 'en') satisfies EmailLocale;
  const t = getTrialReminderTranslations(locale);
  const trialEndDate = formatTrialEndDate(target.trialEndsAt, locale);
  const subject = t.subject();
  const appUrl = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  const billingUrl = `${appUrl}/billing`;

  return sendTrackedEmailNotification({
    userId: target.userId,
    type: 'trial_reminder',
    dedupeKey: `trial-reminder:${target.stripeSubscriptionId}:${formatDateKey(target.trialEndsAt)}`,
    toEmail: target.email,
    subject,
    payload: {
      kind: 'trial_reminder',
      stripeSubscriptionId: target.stripeSubscriptionId,
      trialEndsAt: target.trialEndsAt.toISOString(),
      trialEndDate,
    },
    send: () =>
      sendResendEmail({
        from: env.RESEND_FROM_EMAIL!,
        to: [target.email],
        subject,
        react: React.createElement(TrialEndingReminderEmail, {
          userName: target.name,
          trialEndDate,
          appUrl,
          locale,
        }),
        text: [
          locale === 'es' ? `Hola ${target.name},` : `Hi ${target.name},`,
          '',
          t.body(trialEndDate),
          '',
          `${t.cta}: ${billingUrl}`,
        ].join('\n'),
      }),
  });
}

export async function runTrialReminders(now = new Date()): Promise<TrialReminderRunResult> {
  if (!canSendResendEmail()) {
    return {
      eligibleUsers: 0,
      sentCount: 0,
      skippedCount: 0,
      failedCount: 0,
    };
  }

  const targets = await getTrialReminderTargets(now);
  let sentCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  for (const target of targets) {
    try {
      const result = await sendTrialReminder(target);
      if (result.skipped) {
        skippedCount += 1;
      } else {
        sentCount += 1;
      }
    } catch (error) {
      failedCount += 1;
      console.error(`[trial-reminder][${target.userId}]`, error);
    }
  }

  return {
    eligibleUsers: targets.length,
    sentCount,
    skippedCount,
    failedCount,
  };
}
