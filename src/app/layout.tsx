import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { getIamAuthContext } from '@/iam/utils/get-auth-context';
import { AuthStoreProvider } from '@/stores/auth-store-provider';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/sidebar/app-sidebar';

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
  const auth = await getIamAuthContext();

  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="antialiased">
        <Providers>
          <AuthStoreProvider initialAuth={auth}>
            <SidebarProvider>
              <AppSidebar />
              {children}
            </SidebarProvider>
          </AuthStoreProvider>
        </Providers>
      </body>
    </html>
  );
}
