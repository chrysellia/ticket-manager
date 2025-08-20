/*
 * Welcome to your app's main JavaScript file!
 *
 * We recommend including the built version of this JavaScript file
 * (and its CSS file) in your base layout (base.html.twig).
 */

// any CSS you import will output into a single css file (app.css in this case)
import './styles/app.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import * as Turbo from '@hotwired/turbo';

// React example component
function Hello() {
    return <h1>Hello from React + Turbo!</h1>;
}

// Mount React component
const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<Hello />);
}
