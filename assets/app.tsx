import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { MainLayout } from './react/components/layout/MainLayout';
import { TicketBoard } from './react/components/ticket/TicketBoard';
import { SettingsPage } from './react/pages/SettingsPage';
import { TeamsPage } from './react/pages/TeamsPage';
import { MembersPage } from './react/pages/MembersPage';
import { LoginPage } from './react/pages/LoginPage';
import { AuthProvider, useAuth } from './react/context/AuthContext';
import { ProjectProvider, useProject } from './react/context/ProjectContext';
import { ThemeProvider } from './react/providers/theme-provider';
import { ProjectsPage } from './react/pages/ProjectsPage';
import '@/styles/app.css';

// This is the base path for all frontend routes
const BASE_PATH = '/';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProjectProvider>
          <Router basename={BASE_PATH}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<DefaultLanding />} />
                {/* Projects is always accessible (for first-time selection) */}
                <Route path="projects" element={<ProjectsPage />} />
                {/* All other app routes require a selected project */}
                <Route element={<ProjectRequiredRoute />}>
                  <Route path="tickets" element={<TicketBoard />} />
                  <Route path="teams" element={<TeamsPage />} />
                  <Route path="members" element={<MembersPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>
                <Route path="*" element={<Navigate to="tickets" replace />} />
              </Route>
            </Route>
          </Routes>
          </Router>
        </ProjectProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

function ProjectRequiredRoute() {
  const { selectedProjectId, loading } = useProject();
  if (loading) {
    return (
      <div className="min-h-[50vh] grid place-items-center text-sm text-gray-500">
        Loading projects...
      </div>
    );
  }
  if (selectedProjectId == null) {
    return <Navigate to="/projects" replace />;
  }
  return <Outlet />;
}

// Mount React component
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center text-sm text-gray-500">
        Loading...
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

function DefaultLanding() {
  const { selectedProjectId, loading } = useProject();
  if (loading) {
    return (
      <div className="min-h-[50vh] grid place-items-center text-sm text-gray-500">
        Loading projects...
      </div>
    );
  }
  if (selectedProjectId == null) {
    return <Navigate to="/projects" replace />;
  }
  return <Navigate to="/tickets" replace />;
}
