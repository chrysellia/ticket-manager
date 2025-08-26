import * as React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Settings, Ticket, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: 'tickets', icon: Ticket, label: 'Tickets' },
  { to: 'members', icon: Users, label: 'Members' },
  { to: 'teams', icon: Users, label: 'Teams' },
  { to: 'settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="hidden border-r bg-gray-100/40 lg:block dark:bg-gray-800/40">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-[60px] items-center border-b px-6">
          <h1 className="font-semibold">Ticket Manager</h1>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-4 text-sm font-medium">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 ${
                    isActive ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50' : ''
                  }`
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="border-t p-4 text-sm text-gray-600 dark:text-gray-300">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center justify-between gap-3 rounded-md px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-200">
                      {getInitials(user.name || user.email)}
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900 dark:text-gray-100 leading-tight">{user.name}</div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">{user.email}</div>
                    </div>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" sideOffset={8}>
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <div className="px-2 py-1.5">
                  <div className="text-xs text-gray-500 dark:text-gray-400 break-all">{user.email}</div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} variant="destructive">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center justify-between">
              <div className="text-xs">Not signed in</div>
              <Button size="sm" variant="ghost" onClick={() => navigate('/login')}>Sign in</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getInitials(nameOrEmail: string) {
  const name = nameOrEmail.includes('@') ? nameOrEmail.split('@')[0] : nameOrEmail;
  const parts = name.trim().split(/\s+/);
  const initials = parts.slice(0, 2).map(p => p.charAt(0).toUpperCase()).join('');
  return initials || 'U';
}
