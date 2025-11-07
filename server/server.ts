import 'dotenv/config';
import express from 'express';

import { APP_BASE_PATH } from './config';
import { createHtmlProvider } from './htmlProvider';
import { createSpaRequestHandler } from './spaHandler';
import { getResource, warmResourceCache } from './resourceService';
import type { HtmlProvider } from './types';

const app = express();
let htmlProvider: HtmlProvider;

const start = async () => {
  htmlProvider = await createHtmlProvider();
  await warmResourceCache();

  app.get('/', (_req, res) => {
    res.redirect(302, `${APP_BASE_PATH}/`);
  });

  const spaHandler = createSpaRequestHandler(htmlProvider, getResource);
  app.use(spaHandler);
  htmlProvider.registerAssets(app);

  app.use((req, res) => {
    res.status(404).send('Not Found');
  });

  app.use(
    (
      err: Error,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      console.error(err);
      if (res.headersSent) {
        return;
      }
      res.status(500).send('Internal Server Error');
    },
  );

  const port = Number(process.env.PORT ?? 3000);

  const server = app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}${APP_BASE_PATH}`);
  });

  const onServerStarted = htmlProvider.onServerStarted;
  if (onServerStarted) {
    void onServerStarted(server).catch((error) => {
      console.error('Failed during dev server setup:', error);
    });
  }

  let shuttingDown = false;

  const shutdown = (signal: NodeJS.Signals) => {
    if (shuttingDown) {
      return;
    }
    shuttingDown = true;
    console.log(`Received ${signal}, shutting down...`);
    void htmlProvider
      .cleanup?.()
      .catch((error) => {
        console.error('Error while closing dev server:', error);
      })
      .finally(() => {
        server.close(() => {
          process.exit(0);
        });
      });
  };

  // process.on('SIGINT', shutdown);
  // process.on('SIGTERM', shutdown);
};

void start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
