import express from 'express';
import path from 'node:path';
import { existsSync } from 'node:fs';

const app = express();



const resolveIndexHtmlPath = () => {
    const projectRoot = path.resolve(__dirname, '../..');
    const candidates = [
        path.join(projectRoot, 'dist', 'trip', 'index.html'),
        path.join(projectRoot, 'index.html'),
    ];

    const indexHtmlPath = candidates.find((candidate) => existsSync(candidate));
    if (!indexHtmlPath) {
        throw new Error(`Unable to locate index.html. Tried: ${candidates.join(', ')}`);
    }

    const assetDir = path.join(projectRoot, 'dist', 'trip');

    return { indexHtmlPath, assetDir };
};

const { indexHtmlPath, assetDir } = resolveIndexHtmlPath();
app.use(express.static(assetDir));


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
