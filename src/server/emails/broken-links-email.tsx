import { Button, Heading, Link, Section, Text } from '@react-email/components';
import * as React from 'react';

import { BORDER, DARK, FONT, GRAY, GREEN, LIGHT_GRAY, RED, EmailLayout } from './layout';
import { type EmailLocale, getEmailTranslations } from './translations';
import type { BrokenLinkEmailItem } from '@/server/services/link-alerts';

type Props = {
  userName: string;
  items: BrokenLinkEmailItem[];
  linksUrl: string;
  settingsUrl: string;
  appUrl: string;
  locale?: EmailLocale;
};

export function BrokenLinksEmail({ userName, items, linksUrl, settingsUrl, appUrl, locale = 'en' }: Props) {
  const t = getEmailTranslations(locale);
  const logoUrl = `${appUrl}/logo-fondo-blanco.png`;
  const count = items.length;
  const preheader = t.preheaderBroken(count);

  return (
    <EmailLayout
      preheader={preheader}
      accentColor={RED}
      settingsUrl={settingsUrl}
      appUrl={appUrl}
      logoUrl={logoUrl}
      locale={locale}
    >
      {/* Alert badge */}
      <table cellPadding={0} cellSpacing={0} border={0} style={{ marginBottom: '20px' }}>
        <tbody>
          <tr>
            <td style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '20px', padding: '5px 12px' }}>
              <span style={{ color: RED, fontSize: '12px', fontWeight: 600, fontFamily: FONT }}>
                {t.brokenBadge}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Headline */}
      <Heading style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: 800, color: DARK, lineHeight: '1.2', fontFamily: FONT }}>
        {count === 1 ? t.brokenHeadingSingle : t.brokenHeadingPlural(count)}
      </Heading>
      <Text style={{ margin: '0 0 28px', fontSize: '15px', color: GRAY, lineHeight: '1.6', fontFamily: FONT }}>
        {t.brokenIntro(userName)}
      </Text>

      {/* Links table */}
      <table cellPadding={0} cellSpacing={0} width="100%" style={{
        borderCollapse: 'collapse',
        border: `1px solid ${BORDER}`,
        borderRadius: '10px',
        overflow: 'hidden',
      }}>
        <thead>
          <tr style={{ backgroundColor: '#f9fafb' }}>
            {[t.brokenColLink, t.brokenColState, t.brokenColHttp, t.brokenColResponse].map((col) => (
              <th key={col} align="left" style={{
                padding: '10px 14px',
                fontFamily: FONT,
                fontSize: '11px',
                fontWeight: 600,
                color: GRAY,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.5px',
                borderBottom: `1px solid ${BORDER}`,
              }}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => {
            const isNew = item.state === 'newly_broken';
            const rowBg = i % 2 === 0 ? '#ffffff' : '#fafafa';
            return (
              <tr key={item.linkSlug} style={{ backgroundColor: rowBg }}>
                <td style={{ padding: '13px 14px', borderBottom: '1px solid #f3f4f6', verticalAlign: 'top' as const }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: DARK, fontFamily: 'monospace' }}>
                    /{item.linkSlug}
                  </span>
                  <br />
                  <span style={{ fontSize: '12px', color: GRAY, fontFamily: FONT }}>
                    {item.productName}
                  </span>
                  <br />
                  <Link href={item.shortUrl} style={{ fontSize: '11px', color: GREEN, textDecoration: 'none', fontFamily: FONT, wordBreak: 'break-all' as const }}>
                    {item.shortUrl}
                  </Link>
                </td>
                <td style={{ padding: '13px 14px', borderBottom: '1px solid #f3f4f6', verticalAlign: 'top' as const }}>
                  <span style={{
                    display: 'inline-block',
                    backgroundColor: isNew ? '#fef2f2' : '#fff7ed',
                    color: isNew ? RED : '#ea580c',
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: '20px',
                    fontFamily: FONT,
                    whiteSpace: 'nowrap' as const,
                  }}>
                    {isNew ? t.brokenStateNew : t.brokenStateStill}
                  </span>
                </td>
                <td style={{ padding: '13px 14px', borderBottom: '1px solid #f3f4f6', verticalAlign: 'top' as const }}>
                  {item.statusCode ? (
                    <code style={{ fontSize: '12px', backgroundColor: '#f3f4f6', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace', color: DARK }}>
                      {item.statusCode}
                    </code>
                  ) : (
                    <span style={{ color: LIGHT_GRAY, fontSize: '13px' }}>—</span>
                  )}
                </td>
                <td style={{ padding: '13px 14px', borderBottom: '1px solid #f3f4f6', verticalAlign: 'top' as const }}>
                  {item.responseMs ? (
                    <span style={{ fontSize: '13px', color: '#374151', fontFamily: FONT }}>{item.responseMs}ms</span>
                  ) : (
                    <span style={{ color: LIGHT_GRAY, fontSize: '13px' }}>—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* CTA */}
      <Section style={{ marginTop: '32px', textAlign: 'left' as const }}>
        <Button href={linksUrl} style={{
          backgroundColor: RED,
          borderRadius: '10px',
          color: '#ffffff',
          fontFamily: FONT,
          fontSize: '15px',
          fontWeight: 600,
          padding: '13px 28px',
          textDecoration: 'none',
        }}>
          {t.brokenCta}
        </Button>
      </Section>

      <Text style={{ margin: '20px 0 0', fontSize: '13px', color: LIGHT_GRAY, lineHeight: '1.6', fontFamily: FONT }}>
        {t.brokenFooterNote}{' '}
        <Link href={settingsUrl} style={{ color: GREEN, textDecoration: 'none' }}>
          {t.brokenFooterLink}
        </Link>
        .
      </Text>
    </EmailLayout>
  );
}
