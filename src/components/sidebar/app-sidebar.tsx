'use client';

import {
  CreditCard,
  LayoutDashboard,
  Link2,
  Package,
  Settings,
  Tags,
  type LucideIcon,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import * as React from 'react';

import { NavHeader } from '@/components/sidebar/nav-header';
import { NavMain } from '@/components/sidebar/nav-main';
import { NavUser } from '@/components/sidebar/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';
import { useAuthUser } from '@/stores/auth-store-provider';

function withAutoActive<
  T extends { items?: { url: string }[]; url?: string; icon?: LucideIcon; title?: string },
>(menuItems: T[], pathname: string): (T & { isActive: boolean })[] {
  return menuItems.map((item) => ({
    ...item,
    isActive: item.url
      ? pathname.startsWith(item.url)
      : (item.items?.some((sub) => pathname.startsWith(sub.url)) ?? false),
  }));
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useAuthUser();
  const pathname = usePathname();

  const data = React.useMemo(() => {
    return {
      user: {
        name: user ? `${user.firstName} ${user.lastName}` : '',
        email: user?.email ?? '',
        avatar: user ? `${user.firstName[0]}${user.lastName[0]}` : 'AP',
      },
      navMain: [
        {
          items: withAutoActive(
            [
              {
                title: 'Dashboard',
                url: '/dashboard',
                icon: LayoutDashboard,
              },
              {
                title: 'Products',
                url: '/products',
                icon: Package,
              },
              {
                title: 'Links',
                url: '/links',
                icon: Link2,
              },
              {
                title: 'Tags',
                url: '/tags',
                icon: Tags,
              },
            ],
            pathname,
          ),
        },
        {
          title: 'Account',
          items: withAutoActive(
            [
              {
                title: 'Settings',
                url: '/settings',
                icon: Settings,
              },
              {
                title: 'Billing',
                url: '/billing',
                icon: CreditCard,
              },
            ],
            pathname,
          ),
        },
      ],
    };
  }, [user, pathname]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavHeader />
      </SidebarHeader>
      <SidebarContent>
        <NavMain menus={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
