import { defineConfig, loadEnv } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import path from 'node:path';

export default defineConfig(({ envMode, command, meta, env }) => {
    const { publicVars, rawPublicVars } = loadEnv({ mode: envMode });
    console.log(command, meta, env, publicVars, rawPublicVars);

    const prefix = process.env.PUBLIC_PREFIX;
    return {
        plugins: [pluginReact()],
        html: {
            template: 'index.html'
        },
        source: {
            tsconfigPath: path.join(__dirname, './src/tsconfig.json'),
            define: {
                ...publicVars,
                'process.env': JSON.stringify(rawPublicVars),
            },
            include: ['src/**/*'],
            exclude: ['node_modules/**/*']
        },
        output: {
            cleanDistPath: true,
            distPath: {
                root: `dist/${prefix}/`,
            },
            assetPrefix: `/${prefix}/`,
        },
        module: {
            rules: [
                {
                    test: /\.css$/,
                    use: ["postcss-loader"],
                    type: "css",
                },
            ],
        },
    }
});
