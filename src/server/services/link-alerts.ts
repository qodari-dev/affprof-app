import { env } from '@/env';
import { canSendResendEmail, sendResendEmail } from '@/server/clients/resend';
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
};

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function buildBrokenLinksEmail(input: BrokenLinksAlertInput) {
  const count = input.items.length;
  const subject = `Broken links detected: ${count} affected`;
  const dashboardUrl = `${env.NEXT_PUBLIC_APP_URL}/links`;
  const escapedUserName = escapeHtml(input.userName);
  const text = [
    `Hi ${input.userName},`,
    '',
    `We detected ${count} broken affiliate link${count === 1 ? '' : 's'} in this check:`,
    '',
    ...input.items.flatMap((item, index) => {
      const stateLine = item.state === 'newly_broken' ? 'Newly broken' : 'Still broken';
      const statusLine = item.statusCode ? `Status code: ${item.statusCode}` : 'Status code: unavailable';
      const responseLine = item.responseMs ? `Response time: ${item.responseMs} ms` : 'Response time: unavailable';

      return [
        `${index + 1}. /${item.linkSlug} (${stateLine})`,
        `Product: ${item.productName}`,
        `Short link: ${item.shortUrl}`,
        `Destination: ${item.originalUrl}`,
        statusLine,
        responseLine,
        '',
      ];
    }),
    '',
    `Review it in your dashboard: ${dashboardUrl}`,
  ].join('\n');

  const rows = input.items
    .map((item) => {
      const stateLabel = item.state === 'newly_broken' ? 'Newly broken' : 'Still broken';
      const statusLabel = item.statusCode ? `${item.statusCode}` : 'Unavailable';
      const responseLabel = item.responseMs ? `${item.responseMs} ms` : 'Unavailable';

      return `
        <tr>
          <td style="padding:8px 12px 8px 0;vertical-align:top"><strong>/${escapeHtml(item.linkSlug)}</strong><br><span style="color:#6b7280">${escapeHtml(stateLabel)}</span></td>
          <td style="padding:8px 12px 8px 0;vertical-align:top">${escapeHtml(item.productName)}</td>
          <td style="padding:8px 12px 8px 0;vertical-align:top"><a href="${escapeHtml(item.shortUrl)}">${escapeHtml(item.shortUrl)}</a></td>
          <td style="padding:8px 12px 8px 0;vertical-align:top">${escapeHtml(statusLabel)}</td>
          <td style="padding:8px 0 8px 0;vertical-align:top">${escapeHtml(responseLabel)}</td>
        </tr>
      `;
    })
    .join('');

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#111827">
      <p>Hi ${escapedUserName},</p>
      <p>We detected ${count} broken affiliate link${count === 1 ? '' : 's'} in this check.</p>
      <table style="border-collapse:collapse;margin:16px 0;width:100%">
        <thead>
          <tr>
            <th align="left" style="padding:8px 12px 8px 0;color:#6b7280;font-weight:600">Link</th>
            <th align="left" style="padding:8px 12px 8px 0;color:#6b7280;font-weight:600">Product</th>
            <th align="left" style="padding:8px 12px 8px 0;color:#6b7280;font-weight:600">Short URL</th>
            <th align="left" style="padding:8px 12px 8px 0;color:#6b7280;font-weight:600">Status</th>
            <th align="left" style="padding:8px 0 8px 0;color:#6b7280;font-weight:600">Response</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
      <p><a href="${dashboardUrl}" style="display:inline-block;padding:10px 14px;border-radius:10px;background:#22c55e;color:#ffffff;text-decoration:none">Open dashboard</a></p>
    </div>
  `;

  return { subject, html, text };
}

export async function sendBrokenLinksAlert(input: BrokenLinksAlertInput) {
  if (!canSendResendEmail()) {
    return { skipped: true as const, reason: 'email_not_configured' as const };
  }

  const message = buildBrokenLinksEmail(input);

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
        html: message.html,
        text: message.text,
      }),
  });
}
