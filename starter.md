1. Create a new Symfony project
composer create-project symfony/skeleton my_project

2. Install webpack-encore-bundle
composer require symfony/webpack-encore-bundle

3. Install JavaScript dependencies
npm init -y
npm install @symfony/webpack-encore --save-dev
npm install react react-dom
npm install @hotwired/turbo

4. Configure Babel for JSX support
npm install @babel/preset-react --save-dev

5. Configure Encore for React + Turbo
Edit webpack.config.js (created by Encore) to enable React:
const Encore = require('@symfony/webpack-encore');

Encore
    .setOutputPath('public/build/')
    .setPublicPath('/build')
    .addEntry('app', './assets/app.js')
    .enableReactPreset()
    .enableStimulusBridge('./assets/controllers.json')
    .enableSingleRuntimeChunk()
    .cleanupOutputBeforeBuild()
    .enableSourceMaps(!Encore.isProduction())
    .enableVersioning(Encore.isProduction())
;

module.exports = Encore.getWebpackConfig();

6. Create your React + Turbo entry file
Create a new file called app.js in the assets directory:
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

7. Install twig
composer require symfony/twig-bundle

8. Create a default controller
php bin/console make:controller DefaultController

9. Create a default template
Create a new file called index.html.twig in the templates directory:
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Symfony + React + Turbo</title>
    {{ encore_entry_link_tags('app') }}
</head>
<body>
    <div id="root"></div>

    {{ encore_entry_script_tags('app') }}
</body>
</html>

10. Run Encore and start the Symfony server
npm run dev
symfony server:start

