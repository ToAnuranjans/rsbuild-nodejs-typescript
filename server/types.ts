import type express from 'express';
import type { Server } from 'node:http';

export type ResourcePayload = unknown;

export interface HtmlProvider {
  getHtml: () => Promise<string>;
  registerAssets: (expressApp: express.Express) => void;
  onServerStarted?: (httpServer: Server) => Promise<void>;
  cleanup?: () => Promise<void>;
}
