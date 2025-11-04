import express from 'express';
import path from 'node:path';
import { existsSync } from 'node:fs';

const app = express();

const resolveIndexHtmlPath = (): string => {
    const projectRoot = path.resolve(__dirname, '../..');
    const candidates = [
        path.join(projectRoot, 'dist', 'trip', 'index.html'),
        path.join(projectRoot, 'index.html'),
    ];

    const found = candidates.find((candidate) => existsSync(candidate));
    if (!found) {
        throw new Error(`Unable to locate index.html. Tried: ${candidates.join(', ')}`);
    }

    return found;
};

const indexHtmlPath = resolveIndexHtmlPath();

app.get('/', (req, res, next) => {
    res.sendFile(indexHtmlPath, (err) => {
        if (err) {
            next(err);
        }
    });
});

app.listen(3000, () => {
    console.log('server is running on port 3000');
});
