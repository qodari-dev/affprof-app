import * as React from 'react';
import { BrokenLinksEmail } from './broken-links-email';

export default function Preview() {
  return (
    <BrokenLinksEmail
      userName="Carlos"
      items={[
        {
          productName: 'Amazon Associates',
          linkSlug: 'amazon-camera',
          originalUrl: 'https://amazon.com/dp/B08N5WRWNW',
          shortUrl: 'https://affprof.com/go/carlos/amazon-camera',
          statusCode: 404,
          responseMs: 312,
          state: 'newly_broken',
        },
        {
          productName: 'ShareASale',
          linkSlug: 'shareasale-hosting',
          originalUrl: 'https://shareasale.com/r.cfm?b=123&u=456&m=789',
          shortUrl: 'https://affprof.com/go/carlos/shareasale-hosting',
          statusCode: 503,
          responseMs: 9800,
          state: 'still_broken',
        },
        {
          productName: 'Impact',
          linkSlug: 'impact-vpn',
          originalUrl: 'https://nordvpn.com/affiliate/?ref=abc123',
          shortUrl: 'https://affprof.com/go/carlos/impact-vpn',
          statusCode: null,
          responseMs: null,
          state: 'newly_broken',
        },
      ]}
      linksUrl="https://app.affprof.com/links"
      settingsUrl="https://app.affprof.com/settings"
      appUrl="https://app.affprof.com"
    />
  );
}
