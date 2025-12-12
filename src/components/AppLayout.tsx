'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';

function MainContent({ children }: { children: React.ReactNode }) {
  const { state } = useSidebar();
  return (
    <main className={`flex-1 flex flex-col ${state === 'expanded' ? 'lg:pl-64' : 'lg:pl-16'}`}>
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        {children}
      </div>
    </main>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen flex-col">
        <div className="flex flex-1">
          <AppSidebar />
          <MainContent>
            {children}
          </MainContent>
        </div>
      </div>
    </SidebarProvider>
  );
}
