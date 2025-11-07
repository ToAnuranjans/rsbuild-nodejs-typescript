import path from 'node:path';
import type express from 'express';

import { APP_BASE_PATH } from './config';
import { injectResourceIntoHtml } from './template';
import type { HtmlProvider } from './types';
import type { ResourcePayload } from './types';

type ResourceFetcher = (forceRefresh?: boolean) => Promise<ResourcePayload>;

export const createSpaRequestHandler = (
  htmlProvider: HtmlProvider,
  fetchResource: ResourceFetcher,
): express.RequestHandler => {
  return async (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    if (!req.path.startsWith(APP_BASE_PATH)) {
      return next();
    }

    const hasExtension = path.extname(req.path) !== '';
    if (hasExtension) {
      return next();
    }

    if (!htmlProvider) {
      return next(new Error('HTML provider is not initialised.'));
    }

    try {
      const [html, resource] = await Promise.all([
        htmlProvider.getHtml(),
        fetchResource(),
      ]);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      res.send(injectResourceIntoHtml(html, resource));
    } catch (error) {
      next(error);
    }
  };
};
