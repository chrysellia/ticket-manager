import * as React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';

export function MainLayout() {
  const isMobile = useIsMobile();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <div className="sticky top-0 z-10 border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-gray-900/70 dark:supports-[backdrop-filter]:bg-gray-900/60">
          <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-end">
            <Button asChild variant="outline" size="sm">
              <Link to="/projects">Projects</Link>
            </Button>
          </div>
        </div>
        <div className="h-full p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
