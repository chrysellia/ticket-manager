import * as React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useIsMobile } from '@/hooks/use-mobile';

export function MainLayout() {
  const isMobile = useIsMobile();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <div className="h-full p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
