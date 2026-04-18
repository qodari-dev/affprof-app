import { Button, Heading, Hr, Link, Section, Text } from '@react-email/components';
import * as React from 'react';

import { BORDER, DARK, FONT, GRAY, GREEN, LIGHT_GRAY, RED, EmailLayout } from './layout';
import { type EmailLocale, getEmailTranslations } from './translations';

type TopLink = {
  slug: string;
  productName: string;
  shortUrl: string;
  clicks: number;
};

type BrokenLink = {
  slug: string;
  productName: string;
  shortUrl: string;
  statusCode: number | null;
};

type Props = {
  userName: string;
  periodLabel: string;
  totalClicks: number;
  activeLinksCount: number;
  brokenLinksCount: number;
  topLinks: TopLink[];
  brokenLinks: BrokenLink[];
  dashboardUrl: string;
  settingsUrl: string;
  appUrl: string;
  locale?: EmailLocale;
};

export function WeeklyDigestEmail({
  userName,
  periodLabel,
  totalClicks,
  activeLinksCount,
  brokenLinksCount,
  topLinks,
  brokenLinks,
  dashboardUrl,
  settingsUrl,
  appUrl,
  locale = 'en',
}: Props) {
  const t = getEmailTranslations(locale);
  const logoUrl = `${appUrl}/logo-fondo-blanco.png`;
  const preheader = t.preheaderWeekly(totalClicks, activeLinksCount, brokenLinksCount);

  const thStyle: React.CSSProperties = {
    padding: '10px 14px',
    fontFamily: FONT,
    fontSize: '11px',
    fontWeight: 600,
    color: GRAY,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: `1px solid ${BORDER}`,
  };

  return (
    <EmailLayout
      preheader={preheader}
      accentColor={GREEN}
      settingsUrl={settingsUrl}
      appUrl={appUrl}
      logoUrl={logoUrl}
      locale={locale}
    >
      {/* Period badge */}
      <table cellPadding={0} cellSpacing={0} border={0} style={{ marginBottom: '20px' }}>
        <tbody>
          <tr>
            <td style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '20px', padding: '5px 12px' }}>
              <span style={{ color: GREEN, fontSize: '12px', fontWeight: 600, fontFamily: FONT }}>
                {t.weeklyBadge}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Headline */}
      <Heading style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: 800, color: DARK, lineHeight: '1.2', fontFamily: FONT }}>
        {t.weeklyHeading}
      </Heading>
      <Text style={{ margin: '0 0 28px', fontSize: '15px', color: GRAY, lineHeight: '1.6', fontFamily: FONT }}>
        {t.weeklyIntro(userName, periodLabel)}
      </Text>

      {/* Stats row */}
      <table cellPadding={0} cellSpacing={0} border={0} width="100%" style={{ marginBottom: '32px' }}>
        <tbody>
          <tr>
            <StatCell label={t.weeklyStatClicks} value={totalClicks.toLocaleString()} />
            <td width={12} />
            <StatCell label={t.weeklyStatLinks} value={String(activeLinksCount)} />
            <td width={12} />
            <StatCell
              label={t.weeklyStatBroken}
              value={String(brokenLinksCount)}
              valueColor={brokenLinksCount > 0 ? RED : GREEN}
              sub={brokenLinksCount > 0 ? t.weeklyStatNeedsAttention : t.weeklyStatAllHealthy}
              subColor={brokenLinksCount > 0 ? RED : GREEN}
            />
          </tr>
        </tbody>
      </table>

      {/* Top links */}
      <Text style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 700, color: DARK, textTransform: 'uppercase' as const, letterSpacing: '0.5px', fontFamily: FONT }}>
        {t.weeklyTopLinks}
      </Text>

      {topLinks.length === 0 ? (
        <Text style={{ margin: '0 0 28px', fontSize: '14px', color: LIGHT_GRAY, fontFamily: FONT, fontStyle: 'italic' }}>
          {t.weeklyNoClicks}
        </Text>
      ) : (
        <table cellPadding={0} cellSpacing={0} width="100%" style={{
          borderCollapse: 'collapse',
          border: `1px solid ${BORDER}`,
          borderRadius: '10px',
          overflow: 'hidden',
          marginBottom: '28px',
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb' }}>
              <th align="left" style={thStyle}>{t.weeklyColLink}</th>
              <th align="right" style={thStyle}>{t.weeklyColClicks}</th>
            </tr>
          </thead>
          <tbody>
            {topLinks.map((link, i) => (
              <tr key={link.slug} style={{ backgroundColor: i % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                <td style={{ padding: '12px 14px', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: DARK, fontFamily: 'monospace' }}>/{link.slug}</span>
                  <br />
                  <span style={{ fontSize: '12px', color: GRAY, fontFamily: FONT }}>{link.productName}</span>
                  <br />
                  <Link href={link.shortUrl} style={{ fontSize: '11px', color: GREEN, textDecoration: 'none', fontFamily: FONT }}>
                    {link.shortUrl}
                  </Link>
                </td>
                <td align="right" style={{ padding: '12px 14px', borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle' as const }}>
                  <span style={{ fontSize: '20px', fontWeight: 800, color: DARK, fontFamily: FONT }}>
                    {link.clicks.toLocaleString()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Broken links section */}
      {brokenLinks.length > 0 && (
        <>
          <Hr style={{ borderColor: BORDER, margin: '0 0 24px' }} />

          <table cellPadding={0} cellSpacing={0} border={0} style={{ marginBottom: '12px' }}>
            <tbody>
              <tr>
                <td style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '20px', padding: '4px 10px' }}>
                  <span style={{ color: RED, fontSize: '11px', fontWeight: 600, fontFamily: FONT }}>
                    {t.weeklyBrokenBadge(brokenLinks.length)}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          <table cellPadding={0} cellSpacing={0} width="100%" style={{
            borderCollapse: 'collapse',
            border: '1px solid #fecaca',
            borderRadius: '10px',
            overflow: 'hidden',
            marginBottom: '28px',
          }}>
            <thead>
              <tr style={{ backgroundColor: '#fef2f2' }}>
                <th align="left" style={{ ...thStyle, color: '#b91c1c' }}>{t.weeklyColLink}</th>
                <th align="center" style={{ ...thStyle, color: '#b91c1c' }}>{t.weeklyColHttp}</th>
              </tr>
            </thead>
            <tbody>
              {brokenLinks.map((link, i) => (
                <tr key={link.slug} style={{ backgroundColor: i % 2 === 0 ? '#ffffff' : '#fff5f5' }}>
                  <td style={{ padding: '12px 14px', borderBottom: '1px solid #fee2e2' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: DARK, fontFamily: 'monospace' }}>/{link.slug}</span>
                    <br />
                    <span style={{ fontSize: '12px', color: GRAY, fontFamily: FONT }}>{link.productName}</span>
                    <br />
                    <Link href={link.shortUrl} style={{ fontSize: '11px', color: GREEN, textDecoration: 'none', fontFamily: FONT }}>
                      {link.shortUrl}
                    </Link>
                  </td>
                  <td align="center" style={{ padding: '12px 14px', borderBottom: '1px solid #fee2e2', verticalAlign: 'middle' as const }}>
                    {link.statusCode ? (
                      <code style={{ fontSize: '12px', backgroundColor: '#fecaca', padding: '2px 7px', borderRadius: '4px', fontFamily: 'monospace', color: '#b91c1c' }}>
                        {link.statusCode}
                      </code>
                    ) : (
                      <span style={{ color: LIGHT_GRAY, fontSize: '13px' }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

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
          {t.weeklyCta}
        </Button>
      </Section>

      <Text style={{ margin: '20px 0 0', fontSize: '13px', color: LIGHT_GRAY, lineHeight: '1.6', fontFamily: FONT }}>
        {t.weeklyFooterNote}{' '}
        <Link href={settingsUrl} style={{ color: GREEN, textDecoration: 'none' }}>
          {t.weeklyFooterLink}
        </Link>
        .
      </Text>
    </EmailLayout>
  );
}

function StatCell({
  label,
  value,
  valueColor = DARK,
  sub,
  subColor = GRAY,
}: {
  label: string;
  value: string;
  valueColor?: string;
  sub?: string;
  subColor?: string;
}) {
  return (
    <td style={{ verticalAlign: 'top' as const }}>
      <table cellPadding={0} cellSpacing={0} border={0} width="100%">
        <tbody>
          <tr>
            <td style={{ backgroundColor: '#f9fafb', borderRadius: '12px', border: `1px solid ${BORDER}`, padding: '16px 14px' }}>
              <div style={{ fontFamily: FONT, fontSize: '11px', fontWeight: 500, color: LIGHT_GRAY, textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: '6px' }}>
                {label}
              </div>
              <div style={{ fontFamily: FONT, fontSize: '28px', fontWeight: 800, color: valueColor, lineHeight: '1' }}>
                {value}
              </div>
              {sub && (
                <div style={{ fontFamily: FONT, fontSize: '11px', color: subColor, marginTop: '4px', fontWeight: 500 }}>
                  {sub}
                </div>
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </td>
  );
}
