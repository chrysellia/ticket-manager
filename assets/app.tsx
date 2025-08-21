import React from 'react';
import { createRoot } from 'react-dom/client';
import { TicketBoard } from './react/components/ticket/TicketBoard';
import '@/styles/app.css';

// Mount React component
const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(
        <React.StrictMode>
            <TicketBoard />
        </React.StrictMode>
    );
}
