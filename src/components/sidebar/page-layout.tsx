'use client';

import { Fragment, ReactNode } from 'react';
import { SidebarInset, SidebarTrigger } from '../ui/sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../ui/breadcrumb';
import { ModeToggle } from '../mode-toggle';

interface BreadcrumbItemData {
  label: string;
  href?: string;
}

interface Props {
  children: ReactNode;
  breadcrumbs: BreadcrumbItemData[];
}

export function PageLayout({ children, breadcrumbs }: Props) {
  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((item, index) => (
                <Fragment key={index}>
                  <BreadcrumbItem
                    className={index < breadcrumbs.length - 1 ? 'hidden md:block' : ''}
                  >
                    {item.href ? (
                      <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{item.label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                  {index < breadcrumbs.length - 1 && (
                    <BreadcrumbSeparator className="hidden md:block" />
                  )}
                </Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div>
          <ModeToggle />
        </div>
      </header>
      <div className="flex flex-1 flex-col p-4">{children}</div>
    </SidebarInset>
  );
}
