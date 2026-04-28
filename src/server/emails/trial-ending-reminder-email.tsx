import { Button, Heading, Section, Text } from '@react-email/components';
import * as React from 'react';

import { BORDER, DARK, FONT, GRAY, LIGHT_GRAY, EmailLayout } from './layout';
import { type EmailLocale, getTrialReminderTranslations } from './translations';

const ORANGE = '#ea580c';

type Props = {
  userName: string;
  trialEndDate: string;
  appUrl: string;
  locale?: EmailLocale;
};

export function TrialEndingReminderEmail({
  userName,
  trialEndDate,
  appUrl,
  locale = 'en',
}: Props) {
  const t = getTrialReminderTranslations(locale);
  const logoUrl = `${appUrl}/logo-fondo-blanco.png`;
  const billingUrl = `${appUrl}/billing`;
  const dashboardUrl = `${appUrl}/dashboard`;

  return (
    <EmailLayout
      preheader={t.preheader}
      accentColor={ORANGE}
      settingsUrl={billingUrl}
      appUrl={appUrl}
      logoUrl={logoUrl}
      locale={locale}
    >
      <table cellPadding={0} cellSpacing={0} border={0} style={{ marginBottom: '20px' }}>
        <tbody>
          <tr>
            <td style={{ backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '20px', padding: '5px 12px' }}>
              <span style={{ color: ORANGE, fontSize: '12px', fontWeight: 600, fontFamily: FONT }}>{t.badge}</span>
            </td>
          </tr>
        </tbody>
      </table>

      <Heading style={{ margin: '0 0 12px', fontSize: '26px', fontWeight: 800, color: DARK, lineHeight: '1.2', fontFamily: FONT }}>
        {t.heading(userName)}
      </Heading>
      <Text style={{ margin: '0 0 24px', fontSize: '15px', color: GRAY, lineHeight: '1.6', fontFamily: FONT }}>
        {t.body(trialEndDate)}
      </Text>

      <table cellPadding={0} cellSpacing={0} border={0} width="100%" style={{ marginBottom: '28px' }}>
        <tbody>
          <tr>
            <td style={{ backgroundColor: '#f9fafb', borderRadius: '12px', border: `1px solid ${BORDER}`, padding: '18px 20px' }}>
              <table cellPadding={0} cellSpacing={0} border={0} width="100%">
                <tbody>
                  <tr>
                    <InfoRow label={t.trialEndsLabel} value={trialEndDate} valueColor={ORANGE} />
                  </tr>
                  <tr>
                    <InfoRow label={t.nextChargeLabel} value={t.nextChargeValue} isLast />
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      <Section style={{ textAlign: 'left' as const }}>
        <Button href={billingUrl} style={{
          backgroundColor: ORANGE,
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
        <Button href={dashboardUrl} style={{
          backgroundColor: '#ffffff',
          border: `1px solid ${BORDER}`,
          borderRadius: '10px',
          color: DARK,
          fontFamily: FONT,
          fontSize: '15px',
          fontWeight: 600,
          marginLeft: '10px',
          padding: '12px 22px',
          textDecoration: 'none',
        }}>
          {t.secondaryCta}
        </Button>
      </Section>

      <Text style={{ margin: '24px 0 0', fontSize: '13px', color: LIGHT_GRAY, lineHeight: '1.6', fontFamily: FONT }}>
        {t.footerNote}
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
            <td style={{ fontFamily: FONT, fontSize: '13px', color: LIGHT_GRAY, width: '34%' }}>{label}</td>
            <td style={{ fontFamily: FONT, fontSize: '13px', fontWeight: 600, color: valueColor, textAlign: 'right' as const }}>{value}</td>
          </tr>
        </tbody>
      </table>
    </td>
  );
}
