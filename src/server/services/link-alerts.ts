import * as React from 'react';

import { env } from '@/env';
import { canSendResendEmail, sendResendEmail } from '@/server/clients/resend';
import { BrokenLinksEmail } from '@/server/emails/broken-links-email';
import { type EmailLocale, getEmailTranslations } from '@/server/emails/translations';
import { sendTrackedEmailNotification } from '@/server/services/notification-dispatches';

export type BrokenLinkEmailItem = {
  productName: string;
  linkSlug: string;
  originalUrl: string;
  shortUrl: string;
  statusCode: number | null;
  responseMs: number | null;
  state: 'newly_broken' | 'still_broken';
};

type BrokenLinksAlertInput = {
  userId: string;
  userEmail: string;
  userName: string;
  ccEmail?: string | null;
  dedupeKey: string;
  items: BrokenLinkEmailItem[];
  locale?: EmailLocale;
};

function buildBrokenLinksAlert(input: BrokenLinksAlertInput) {
  const count = input.items.length;
  const locale = input.locale ?? 'en';
  const t = getEmailTranslations(locale);
  const linksUrl = `${env.NEXT_PUBLIC_APP_URL}/links`;
  const settingsUrl = `${env.NEXT_PUBLIC_APP_URL}/settings`;

  const subject = count === 1 ? t.subjectSingle : t.subjectPlural(count);

  const text = [
    `Hi ${input.userName},`,
    '',
    `We detected ${count} broken affiliate link${count === 1 ? '' : 's'}. This may be costing you affiliate revenue.`,
    '',
    ...input.items.flatMap((item, i) => {
      const state = item.state === 'newly_broken' ? 'Newly broken' : 'Still broken';
      const status = item.statusCode ? `HTTP ${item.statusCode}` : 'No response';
      const response = item.responseMs ? `${item.responseMs}ms` : 'Unavailable';
      return [
        `${i + 1}. /${item.linkSlug} — ${state}`,
        `   Product:     ${item.productName}`,
        `   Short URL:   ${item.shortUrl}`,
        `   Destination: ${item.originalUrl}`,
        `   Status:      ${status}`,
        `   Response:    ${response}`,
        '',
      ];
    }),
    `Review and fix them here: ${linksUrl}`,
  ].join('\n');

  const react = React.createElement(BrokenLinksEmail, {
    userName: input.userName,
    items: input.items,
    linksUrl,
    settingsUrl,
    appUrl: env.NEXT_PUBLIC_APP_URL,
    locale,
  });

  return { subject, react, text };
}

export async function sendBrokenLinksAlert(input: BrokenLinksAlertInput) {
  if (!canSendResendEmail()) {
    return { skipped: true as const, reason: 'email_not_configured' as const };
  }

  const message = buildBrokenLinksAlert(input);

  return sendTrackedEmailNotification({
    userId: input.userId,
    type: 'broken_links',
    dedupeKey: input.dedupeKey,
    toEmail: input.userEmail,
    ccEmail: input.ccEmail ?? null,
    subject: message.subject,
    payload: {
      kind: 'broken_links',
      itemCount: input.items.length,
      items: input.items,
    },
    send: () =>
      sendResendEmail({
        from: env.RESEND_FROM_EMAIL!,
        to: [input.userEmail],
        cc: input.ccEmail ? [input.ccEmail] : undefined,
        subject: message.subject,
        react: message.react,
        text: message.text,
      }),
  });
}
