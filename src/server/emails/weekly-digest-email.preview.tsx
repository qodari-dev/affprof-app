import * as React from 'react';
import { WeeklyDigestEmail } from './weekly-digest-email';

export default function Preview() {
  return (
    <WeeklyDigestEmail
      userName="Carlos"
      periodLabel="Apr 10, 2026 - Apr 17, 2026"
      totalClicks={3842}
      activeLinksCount={24}
      brokenLinksCount={2}
      topLinks={[
        { slug: 'amazon-camera', productName: 'Amazon Associates', shortUrl: 'https://affprof.com/go/carlos/amazon-camera', clicks: 1204 },
        { slug: 'impact-vpn', productName: 'Impact', shortUrl: 'https://affprof.com/go/carlos/impact-vpn', clicks: 873 },
        { slug: 'shareasale-tools', productName: 'ShareASale', shortUrl: 'https://affprof.com/go/carlos/shareasale-tools', clicks: 541 },
        { slug: 'cj-software', productName: 'CJ Affiliate', shortUrl: 'https://affprof.com/go/carlos/cj-software', clicks: 320 },
        { slug: 'awin-fashion', productName: 'Awin', shortUrl: 'https://affprof.com/go/carlos/awin-fashion', clicks: 88 },
      ]}
      brokenLinks={[
        { slug: 'shareasale-hosting', productName: 'ShareASale', shortUrl: 'https://affprof.com/go/carlos/shareasale-hosting', statusCode: 503 },
        { slug: 'old-deal-link', productName: 'Amazon Associates', shortUrl: 'https://affprof.com/go/carlos/old-deal-link', statusCode: 404 },
      ]}
      dashboardUrl="https://app.affprof.com/dashboard"
      settingsUrl="https://app.affprof.com/settings"
      appUrl="https://app.affprof.com"
    />
  );
}
