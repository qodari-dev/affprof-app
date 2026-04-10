'use client';

import Image from 'next/image';
import Link from 'next/link';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';

import logoLight from '../../../public/logo-fondo-blanco.png';
import logoDark from '../../../public/logo-fondo-negro.png';
import logoClose from '../../../public/logo-close.png';

export function NavHeader() {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          render={<Link href="/" />}
        >
          {isCollapsed ? (
            <Image
              src={logoClose}
              alt="AffProf"
              className="size-8 object-contain"
              sizes="32px"
              priority
            />
          ) : (
            <>
              {/* Light mode logo */}
              <Image
                src={logoLight}
                alt="AffProf"
                className="block h-8 w-auto object-contain dark:hidden"
                sizes="140px"
                priority
              />
              {/* Dark mode logo */}
              <Image
                src={logoDark}
                alt="AffProf"
                className="hidden h-8 w-auto object-contain dark:block"
                sizes="140px"
                priority
              />
            </>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
