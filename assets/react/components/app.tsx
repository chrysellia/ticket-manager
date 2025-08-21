import React from 'react';
import { createRoot } from 'react-dom/client';
import { TicketBoard } from './ticket/TicketBoard';
import { ThemeProvider } from '../providers/theme-provider';

// Find the DOM element to mount our React app
const container = document.getElementById('ticket-board');

if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <ThemeProvider>
        <div className="min-h-screen bg-background">
          <TicketBoard />
        </div>
      </ThemeProvider>
    </React.StrictMode>
  );
}

export {}; // This file is a module and acts as its own scope.
