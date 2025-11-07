import express from 'express';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import type { RsbuildConfig } from '@rsbuild/core';

import {
  APP_BASE_PATH,
  HTML_ENTRY,
  IS_PRODUCTION_RUNTIME,
  PROJECT_ROOT,
} from './config';
import type { HtmlProvider } from './types';

const createDevHtmlProvider = async (): Promise<HtmlProvider> => {
  const { createRsbuild, loadConfig } = await import('@rsbuild/core');
  const configResult = await loadConfig({
    cwd: PROJECT_ROOT,
    path: path.join(PROJECT_ROOT, 'rsbuild.config.ts'),
  });
  const baseConfig = configResult.content;

  const rsbuildConfig: RsbuildConfig = {
    ...baseConfig,
    server: {
      ...(baseConfig.server ?? {}),
      middlewareMode: true,
    },
  };

  const rsbuild = await createRsbuild({
    cwd: PROJECT_ROOT,
    config: rsbuildConfig,
  });

  const devServer = await rsbuild.createDevServer();
  const environmentName = Object.keys(devServer.environments)[0];

  if (!environmentName) {
    throw new Error('Unable to determine Rsbuild environment for dev server.');
  }

  const environmentApi = devServer.environments[environmentName];

  return {
    getHtml: () => environmentApi.getTransformedHtml(HTML_ENTRY),
    registerAssets: (expressApp) => {
      expressApp.use(devServer.middlewares);
    },
    onServerStarted: async (httpServer) => {
      devServer.connectWebSocket({ server: httpServer });
      await devServer.afterListen();
      devServer.printUrls();
    },
    cleanup: () => devServer.close(),
  };
};

const createProdHtmlProvider = async (): Promise<HtmlProvider> => {
  const distDir = path.join(
    PROJECT_ROOT,
    'dist',
    process.env.PUBLIC_PREFIX ?? 'trip',
  );
  const indexHtmlPath = path.join(distDir, 'index.html');

  if (!existsSync(indexHtmlPath)) {
    throw new Error(
      `Missing build output at ${indexHtmlPath}. Run "npm run build" before starting the server.`,
    );
  }

  let cachedHtml: string | null = null;

  return {
    getHtml: async () => {
      if (cachedHtml === null) {
        cachedHtml = await readFile(indexHtmlPath, 'utf8');
      }
      return cachedHtml;
    },
    registerAssets: (expressApp) => {
      expressApp.use(
        APP_BASE_PATH,
        express.static(distDir, {
          index: false,
          fallthrough: true,
        }),
      );
    },
  };
};

export const createHtmlProvider = (): Promise<HtmlProvider> => {
  const isDevRuntime = !IS_PRODUCTION_RUNTIME;
  if (isDevRuntime) {
    return createDevHtmlProvider();
  }
  return createProdHtmlProvider();
};
