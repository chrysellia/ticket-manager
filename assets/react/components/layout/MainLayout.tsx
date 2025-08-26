import * as React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { ProjectSelector } from '../project/ProjectSelector';
import { useProject } from '../../context/ProjectContext';

export function MainLayout() {
  const isMobile = useIsMobile();
  const location = useLocation();
  const { selectedProjectId, projects, loading } = useProject();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">


        {/* Right actions: show selector except on Projects page, or a call-to-action when none selected */}

        {location.pathname.startsWith('/projects') ? null : (
          <>
            <div className="">
              <div className="sticky top-0 z-10 border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-gray-900/70 dark:supports-[backdrop-filter]:bg-gray-900/60">
                <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">

                  {selectedProjectId != null && projects.length > 0 ? (
                    <div className="flex items-center">Selected project : &nbsp;<ProjectSelector /></div>
                  ) : (
                    <Button asChild variant="default" size="sm" disabled={loading}>
                      <Link to="/projects">Select a project</Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
        <div className="h-full p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
