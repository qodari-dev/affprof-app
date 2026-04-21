import { render } from '@react-email/render';
import { NextRequest, NextResponse } from 'next/server';
import * as React from 'react';

import { canSendResendEmail, sendResendEmail } from '@/server/clients/resend';
import { BrokenLinksEmail } from '@/server/emails/broken-links-email';
import { SubscriptionActivatedEmail } from '@/server/emails/subscription-activated-email';
import { WeeklyDigestEmail } from '@/server/emails/weekly-digest-email';
import { WelcomeEmail } from '@/server/emails/welcome-email';
import { env } from '@/env';

const TEST_RECIPIENTS = ['carlos@qodari.com', 'carlosjosesancheze@gmail.com'];

// Only available in development
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return new NextResponse('Not found', { status: 404 });
  }

  const type = request.nextUrl.searchParams.get('type') ?? 'broken-links';
  const send = request.nextUrl.searchParams.get('send') === 'true';
  const locale = (request.nextUrl.searchParams.get('locale') ?? 'en') as 'en' | 'es';

  const appUrl = env.NEXT_PUBLIC_APP_URL;
  const settingsUrl = `${appUrl}/settings`;
  const linksUrl = `${appUrl}/links`;
  const dashboardUrl = `${appUrl}/dashboard`;

  let component: React.ReactElement;
  let subject: string;

  if (type === 'weekly-digest') {
    subject = '[TEST] Your weekly AffProf summary — Apr 10, 2026 - Apr 17, 2026';
    component = React.createElement(WeeklyDigestEmail, {
      userName: 'Carlos',
      periodLabel: locale === 'es' ? '10 abr, 2026 - 17 abr, 2026' : 'Apr 10, 2026 - Apr 17, 2026',
      totalClicks: 3842,
      activeLinksCount: 24,
      brokenLinksCount: 2,
      topLinks: [
        { slug: 'amazon-camera', productName: 'Amazon Associates', shortUrl: `${appUrl}/go/carlos/amazon-camera`, clicks: 1204 },
        { slug: 'impact-vpn', productName: 'Impact', shortUrl: `${appUrl}/go/carlos/impact-vpn`, clicks: 873 },
        { slug: 'shareasale-tools', productName: 'ShareASale', shortUrl: `${appUrl}/go/carlos/shareasale-tools`, clicks: 541 },
        { slug: 'cj-software', productName: 'CJ Affiliate', shortUrl: `${appUrl}/go/carlos/cj-software`, clicks: 320 },
        { slug: 'awin-fashion', productName: 'Awin', shortUrl: `${appUrl}/go/carlos/awin-fashion`, clicks: 88 },
      ],
      brokenLinks: [
        { slug: 'shareasale-hosting', productName: 'ShareASale', shortUrl: `${appUrl}/go/carlos/shareasale-hosting`, statusCode: 503 },
        { slug: 'old-deal-link', productName: 'Amazon Associates', shortUrl: `${appUrl}/go/carlos/old-deal-link`, statusCode: 404 },
      ],
      dashboardUrl,
      settingsUrl,
      appUrl,
      locale,
    });
  } else if (type === 'welcome') {
    subject = locale === 'es'
      ? '[TEST] Bienvenido a AffProf — protejamos tus comisiones 🚀'
      : "[TEST] Welcome to AffProf — let's protect your commissions 🚀";
    component = React.createElement(WelcomeEmail, {
      userName: 'Carlos',
      appUrl,
      locale,
    });
  } else if (type === 'subscription-trial') {
    subject = locale === 'es'
      ? '[TEST] Tu prueba de Pro está activa — 14 días, sin costo 🎉'
      : '[TEST] Your Pro trial is active — 14 days, on us 🎉';
    component = React.createElement(SubscriptionActivatedEmail, {
      userName: 'Carlos',
      plan: 'pro',
      isTrial: true,
      trialEndDate: locale === 'es' ? '2 de mayo de 2026' : 'May 2, 2026',
      appUrl,
      locale,
    });
  } else if (type === 'subscription-paid') {
    subject = locale === 'es'
      ? '[TEST] Bienvenido a Pro — ya está todo listo 🎉'
      : '[TEST] Welcome to Pro — you\'re all set 🎉';
    component = React.createElement(SubscriptionActivatedEmail, {
      userName: 'Carlos',
      plan: 'pro',
      isTrial: false,
      appUrl,
      locale,
    });
  } else {
    subject = locale === 'es'
      ? '[TEST] ⚠ 3 enlaces de afiliado rotos detectados'
      : '[TEST] ⚠ 3 broken affiliate links detected';
    component = React.createElement(BrokenLinksEmail, {
      userName: 'Carlos',
      items: [
        {
          productName: 'Amazon Associates',
          linkSlug: 'amazon-camera',
          originalUrl: 'https://amazon.com/dp/B08N5WRWNW',
          shortUrl: `${appUrl}/go/carlos/amazon-camera`,
          statusCode: 404,
          responseMs: 312,
          state: 'newly_broken',
        },
        {
          productName: 'ShareASale',
          linkSlug: 'shareasale-hosting',
          originalUrl: 'https://shareasale.com/r.cfm?b=123&u=456&m=789',
          shortUrl: `${appUrl}/go/carlos/shareasale-hosting`,
          statusCode: 503,
          responseMs: 9800,
          state: 'still_broken',
        },
        {
          productName: 'Impact',
          linkSlug: 'impact-vpn',
          originalUrl: 'https://nordvpn.com/affiliate/?ref=abc123',
          shortUrl: `${appUrl}/go/carlos/impact-vpn`,
          statusCode: null,
          responseMs: null,
          state: 'newly_broken',
        },
      ],
      linksUrl,
      settingsUrl,
      appUrl,
      locale,
    });
  }

  if (send) {
    if (!canSendResendEmail()) {
      return NextResponse.json({ error: 'RESEND_API_KEY or RESEND_FROM_EMAIL not configured' }, { status: 500 });
    }
    try {
      await sendResendEmail({
        from: env.RESEND_FROM_EMAIL!,
        to: TEST_RECIPIENTS,
        subject,
        react: component,
        text: `Test email: ${subject}`,
      });
      return NextResponse.json({ ok: true, sent_to: TEST_RECIPIENTS, type });
    } catch (error) {
      return NextResponse.json({ error: String(error) }, { status: 500 });
    }
  }

  const html = await render(component);
  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
