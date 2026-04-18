import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

import { type EmailLocale, getEmailTranslations } from './translations';

export const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';
export const GREEN = '#16a34a';
export const RED = '#dc2626';
export const GRAY = '#6b7280';
export const LIGHT_GRAY = '#9ca3af';
export const DARK = '#111827';
export const BORDER = '#e5e7eb';

export function EmailLayout({
  children,
  preheader,
  accentColor = GREEN,
  settingsUrl,
  appUrl,
  logoUrl,
  locale = 'en',
}: {
  children: React.ReactNode;
  preheader: string;
  accentColor?: string;
  settingsUrl: string;
  appUrl: string;
  logoUrl?: string;
  locale?: EmailLocale;
}) {
  const t = getEmailTranslations(locale);
  const year = new Date().getFullYear();

  return (
    <Html lang={locale}>
      <Head />
      <Preview>{preheader}</Preview>
      <Body style={{ backgroundColor: '#f4f4f5', margin: 0, padding: 0, fontFamily: FONT }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 16px 48px' }}>

          {/* Logo */}
          <Section style={{ textAlign: 'center' as const, paddingBottom: '24px' }}>
            {logoUrl ? (
              <Img
                src={logoUrl}
                alt="AffProf"
                width={160}
                height={40}
                style={{ display: 'inline-block' }}
              />
            ) : (
              <table cellPadding={0} cellSpacing={0} border={0} style={{ margin: '0 auto' }}>
                <tbody>
                  <tr>
                    <td style={{ backgroundColor: GREEN, borderRadius: '10px', padding: '9px 20px' }}>
                      <span style={{ color: '#ffffff', fontSize: '17px', fontWeight: 800, letterSpacing: '-0.4px', fontFamily: FONT, lineHeight: '1' }}>
                        AffProf
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            )}
          </Section>

          {/* Card */}
          <table cellPadding={0} cellSpacing={0} border={0} width="100%" style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e4e4e7',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}>
            <tbody>
              <tr>
                <td height={4} style={{ backgroundColor: accentColor, borderRadius: '16px 16px 0 0', fontSize: '0', lineHeight: '0' }}>&nbsp;</td>
              </tr>
              <tr>
                <td style={{ padding: '36px 40px 40px' }}>
                  {children}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Footer */}
          <Section style={{ textAlign: 'center' as const, paddingTop: '28px' }}>
            <Text style={{ color: LIGHT_GRAY, fontSize: '12px', margin: '0 0 4px', lineHeight: '1.8', fontFamily: FONT }}>
              {t.footerReceiving}
            </Text>
            <Text style={{ color: LIGHT_GRAY, fontSize: '12px', margin: '0 0 8px', lineHeight: '1.8', fontFamily: FONT }}>
              <Link href={settingsUrl} style={{ color: GREEN, textDecoration: 'none', fontWeight: 500 }}>
                {t.footerManage}
              </Link>
              {'  ·  '}
              <Link href={appUrl} style={{ color: GREEN, textDecoration: 'none', fontWeight: 500 }}>
                {t.footerOpen}
              </Link>
            </Text>
            <Text style={{ color: LIGHT_GRAY, fontSize: '12px', margin: 0, fontFamily: FONT }}>
              © {year} AffProf · {t.footerCopyright}
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}
