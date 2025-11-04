import { defineConfig, loadEnv } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import path from 'node:path';

const { publicVars } = loadEnv({ prefixes: ['REACT_APP_'] });
export default defineConfig({
    plugins: [pluginReact()],
    html: {
        template: 'index.html'
    },
    source: {
        tsconfigPath: path.join(__dirname, './src/tsconfig.json'),
        define: publicVars,
        include: ['src/**/*'],
        exclude: ['node_modules/**/*']
    },
    output: {
        cleanDistPath: true,
        distPath: {
            root: 'dist/trip/',
        },

    },
});