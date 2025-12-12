'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { BreadcrumbNavigation } from './shared/BreadcrumbNavigation';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
          </div>
        </header>
        <main className="flex-1">
          <div className="p-4 sm:p-6 lg:p-8">
            <BreadcrumbNavigation items={[]} className="mb-6" />
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
