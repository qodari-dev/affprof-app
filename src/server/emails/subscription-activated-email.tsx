import { Button, Heading, Section, Text } from '@react-email/components';
import * as React from 'react';

import { BORDER, DARK, FONT, GRAY, GREEN, LIGHT_GRAY, EmailLayout } from './layout';
import { type EmailLocale, getSubscriptionTranslations } from './translations';

type Props = {
  userName: string;
  plan: 'pro' | 'pro_annual';
  isTrial: boolean;
  trialEndDate?: string;
  appUrl: string;
  locale?: EmailLocale;
};

export function SubscriptionActivatedEmail({
  userName,
  plan,
  isTrial,
  trialEndDate,
  appUrl,
  locale = 'en',
}: Props) {
  const t = getSubscriptionTranslations(locale);
  const logoUrl = `${appUrl}/logo-fondo-blanco.png`;
  const dashboardUrl = `${appUrl}/dashboard`;
  const billingUrl = `${appUrl}/billing`;

  const planLabel = plan === 'pro_annual' ? 'Pro Annual' : 'Pro';
  const billingLabel = plan === 'pro_annual' ? t.billingAnnual : t.billingMonthly;

  const subject = isTrial ? t.subjectTrial(planLabel) : t.subjectPaid(planLabel);
  const badge = isTrial ? t.badgeTrial : t.badgePaid;
  const heading = isTrial ? t.headingTrial(userName) : t.headingPaid(userName);
  const body = isTrial && trialEndDate ? t.bodyTrial(trialEndDate) : t.bodyPaid;

  const unlocks = [
    t.unlock1,
    t.unlock2,
    t.unlock3,
    t.unlock4,
    t.unlock5,
  ];

  return (
    <EmailLayout
      preheader={isTrial ? t.preheaderTrial : t.preheaderPaid}
      accentColor={GREEN}
      settingsUrl={billingUrl}
      appUrl={appUrl}
      logoUrl={logoUrl}
      locale={locale}
    >
      {/* Badge */}
      <table cellPadding={0} cellSpacing={0} border={0} style={{ marginBottom: '20px' }}>
        <tbody>
          <tr>
            <td style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '20px', padding: '5px 12px' }}>
              <span style={{ color: GREEN, fontSize: '12px', fontWeight: 600, fontFamily: FONT }}>{badge}</span>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Headline */}
      <Heading style={{ margin: '0 0 12px', fontSize: '26px', fontWeight: 800, color: DARK, lineHeight: '1.2', fontFamily: FONT }}>
        {heading}
      </Heading>
      <Text style={{ margin: '0 0 24px', fontSize: '15px', color: GRAY, lineHeight: '1.6', fontFamily: FONT }}>
        {body}
      </Text>

      {/* Plan info box */}
      <table cellPadding={0} cellSpacing={0} border={0} width="100%" style={{ marginBottom: '28px' }}>
        <tbody>
          <tr>
            <td style={{ backgroundColor: '#f9fafb', borderRadius: '12px', border: `1px solid ${BORDER}`, padding: '18px 20px' }}>
              <table cellPadding={0} cellSpacing={0} border={0} width="100%">
                <tbody>
                  <tr>
                    <InfoRow label={t.planLabel} value={planLabel} />
                  </tr>
                  <tr>
                    <InfoRow label={t.billingLabel} value={billingLabel} />
                  </tr>
                  {isTrial && trialEndDate && (
                    <tr>
                      <InfoRow label={t.trialEndsLabel} value={trialEndDate} valueColor="#ea580c" isLast />
                    </tr>
                  )}
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Unlocked features */}
      <Text style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 700, color: DARK, textTransform: 'uppercase' as const, letterSpacing: '0.5px', fontFamily: FONT }}>
        {t.unlockedTitle}
      </Text>
      <table cellPadding={0} cellSpacing={0} border={0} width="100%" style={{ marginBottom: '32px' }}>
        <tbody>
          {unlocks.map((item) => (
            <tr key={item}>
              <td style={{ paddingBottom: '8px' }}>
                <table cellPadding={0} cellSpacing={0} border={0}>
                  <tbody>
                    <tr>
                      <td width={24} style={{ verticalAlign: 'top' as const }}>
                        <span style={{ color: GREEN, fontSize: '14px', fontWeight: 700 }}>✓</span>
                      </td>
                      <td>
                        <span style={{ fontFamily: FONT, fontSize: '14px', color: GRAY }}>{item}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* CTA */}
      <Section style={{ textAlign: 'left' as const }}>
        <Button href={dashboardUrl} style={{
          backgroundColor: GREEN,
          borderRadius: '10px',
          color: '#ffffff',
          fontFamily: FONT,
          fontSize: '15px',
          fontWeight: 600,
          padding: '13px 28px',
          textDecoration: 'none',
        }}>
          {t.cta}
        </Button>
      </Section>

      <Text style={{ margin: '24px 0 0', fontSize: '13px', color: LIGHT_GRAY, lineHeight: '1.6', fontFamily: FONT }}>
        {t.footerNote}{' '}
        <a href={billingUrl} style={{ color: GREEN, textDecoration: 'none' }}>{t.footerLink}</a>.
      </Text>
    </EmailLayout>
  );
}

function InfoRow({ label, value, valueColor = DARK, isLast = false }: {
  label: string;
  value: string;
  valueColor?: string;
  isLast?: boolean;
}) {
  return (
    <td style={{ paddingBottom: isLast ? '0' : '10px' }}>
      <table cellPadding={0} cellSpacing={0} border={0} width="100%">
        <tbody>
          <tr>
            <td style={{ fontFamily: FONT, fontSize: '13px', color: LIGHT_GRAY, width: '40%' }}>{label}</td>
            <td style={{ fontFamily: FONT, fontSize: '13px', fontWeight: 600, color: valueColor, textAlign: 'right' as const }}>{value}</td>
          </tr>
        </tbody>
      </table>
    </td>
  );
}
