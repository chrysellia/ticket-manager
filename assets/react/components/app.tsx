import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '../providers/theme-provider';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { LoginPage } from '../pages/LoginPage';
import { MainLayout } from './layout/MainLayout';
import { TicketBoard } from './ticket/TicketBoard';
import { MembersPage } from '../pages/MembersPage';
import { TeamsPage } from '../pages/TeamsPage';
import { SettingsPage } from '../pages/SettingsPage';

// Find the DOM element to mount our React app
const container = document.getElementById('ticket-board');

if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                  <Route index element={<TicketBoard />} />
                  <Route path="members" element={<MembersPage />} />
                  <Route path="teams" element={<TeamsPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </React.StrictMode>
  );
}

export {}; // This file is a module and acts as its own scope.

function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <React.Suspense fallback={<div />}> <OutletShim /> </React.Suspense>;
}

// Small shim to avoid importing Outlet at top-level where not needed
function OutletShim() {
  const { Outlet } = require('react-router-dom');
  return <Outlet />;
}
