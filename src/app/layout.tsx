import { Providers } from '@/components/providers';
import { SidebarShell } from '@/components/sidebar/sidebar-shell';
import { getIamAuthContext } from '@/iam/utils/get-auth-context';
import { AuthStoreProvider } from '@/stores/auth-store-provider';
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'AffProf',
  description: 'Affiliate Link Manager — Never lose commissions to broken links again.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [auth, locale, messages] = await Promise.all([
    getIamAuthContext(),
    getLocale(),
    getMessages(),
  ]);

  return (
    <html lang={locale} className={inter.variable} suppressHydrationWarning>
      <body className="antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <AuthStoreProvider initialAuth={auth}>
              <SidebarShell>{children}</SidebarShell>
            </AuthStoreProvider>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
