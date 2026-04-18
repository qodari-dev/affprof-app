import { Button, Heading, Section, Text } from '@react-email/components';
import * as React from 'react';

import { DARK, FONT, GRAY, GREEN, LIGHT_GRAY, EmailLayout } from './layout';
import { type EmailLocale, getWelcomeTranslations } from './translations';

type Props = {
  userName: string;
  appUrl: string;
  locale?: EmailLocale;
};

export function WelcomeEmail({ userName, appUrl, locale = 'en' }: Props) {
  const t = getWelcomeTranslations(locale);
  const logoUrl = `${appUrl}/logo-fondo-blanco.png`;
  const linksUrl = `${appUrl}/links`;

  const features = [
    { title: t.feature1Title, desc: t.feature1Desc, icon: '🔗' },
    { title: t.feature2Title, desc: t.feature2Desc, icon: '📊' },
    { title: t.feature3Title, desc: t.feature3Desc, icon: '🔔' },
  ];

  return (
    <EmailLayout
      preheader={t.preheader}
      accentColor={GREEN}
      settingsUrl={`${appUrl}/settings`}
      appUrl={appUrl}
      logoUrl={logoUrl}
      locale={locale}
    >
      {/* Badge */}
      <table cellPadding={0} cellSpacing={0} border={0} style={{ marginBottom: '20px' }}>
        <tbody>
          <tr>
            <td style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '20px', padding: '5px 12px' }}>
              <span style={{ color: GREEN, fontSize: '12px', fontWeight: 600, fontFamily: FONT }}>{t.badge}</span>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Headline */}
      <Heading style={{ margin: '0 0 12px', fontSize: '26px', fontWeight: 800, color: DARK, lineHeight: '1.2', fontFamily: FONT }}>
        {t.heading(userName)}
      </Heading>
      <Text style={{ margin: '0 0 28px', fontSize: '15px', color: GRAY, lineHeight: '1.6', fontFamily: FONT }}>
        {t.body}
      </Text>

      {/* Features */}
      <table cellPadding={0} cellSpacing={0} border={0} width="100%" style={{ marginBottom: '32px' }}>
        <tbody>
          {features.map((f) => (
            <tr key={f.title}>
              <td style={{ paddingBottom: '16px', verticalAlign: 'top' as const }}>
                <table cellPadding={0} cellSpacing={0} border={0} width="100%">
                  <tbody>
                    <tr>
                      <td width={44} style={{ verticalAlign: 'top' as const, paddingTop: '2px' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          backgroundColor: '#f0fdf4',
                          borderRadius: '10px',
                          border: '1px solid #bbf7d0',
                          textAlign: 'center' as const,
                          lineHeight: '36px',
                          fontSize: '18px',
                        }}>
                          {f.icon}
                        </div>
                      </td>
                      <td style={{ paddingLeft: '8px', verticalAlign: 'top' as const }}>
                        <div style={{ fontFamily: FONT, fontSize: '14px', fontWeight: 700, color: DARK, marginBottom: '2px' }}>
                          {f.title}
                        </div>
                        <div style={{ fontFamily: FONT, fontSize: '13px', color: GRAY, lineHeight: '1.5' }}>
                          {f.desc}
                        </div>
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
        <Button href={linksUrl} style={{
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
        {t.footerNote}
      </Text>
    </EmailLayout>
  );
}
