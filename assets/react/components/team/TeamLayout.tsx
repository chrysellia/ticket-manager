import { Outlet, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function TeamLayout() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Team Management</h1>
            <nav className="flex space-x-4">
              <Button variant="ghost" asChild>
                <Link to="/teams">All Teams</Link>
              </Button>
              <Button asChild>
                <Link to="/teams/new">New Team</Link>
              </Button>
            </nav>
          </div>
        </div>
      </div>
      
      <main className="container mx-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}

export default TeamLayout;
