import React from 'react';
import { createRoot } from 'react-dom/client';
import '@/styles/app.css';

// React example component with TypeScript types
const Hello: React.FC = () => {
    return <h1 className="text-3xl">Hello from React + Turbo + TypeScript!</h1>;
};

// Mount React component
const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<Hello />);
}
