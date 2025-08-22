import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './react/components/layout/MainLayout';
import { TicketBoard } from './react/components/ticket/TicketBoard';
import { SettingsPage } from './react/pages/SettingsPage';
import { TeamsPage } from './react/pages/TeamsPage';
import { MembersPage } from './react/pages/MembersPage';
import '@/styles/app.css';

// This is the base path for all frontend routes
const BASE_PATH = '/';

function App() {
  return (
    <Router basename={BASE_PATH}>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="tickets" replace />} />
          <Route path="tickets" element={<TicketBoard />} />
          <Route path="teams" element={<TeamsPage />} />
          <Route path="members" element={<MembersPage />} />
          <Route path="settings" element={<SettingsPage />} />
          {/* Add a catch-all route that redirects to the tickets page */}
          <Route path="*" element={<Navigate to="tickets" replace />} />
        </Route>
      </Routes>
    </Router>
  );
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
