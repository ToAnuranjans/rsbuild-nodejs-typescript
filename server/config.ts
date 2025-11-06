import path from 'node:path';
import { existsSync } from 'node:fs';

const resolveProjectRoot = (): string => {
    let current = __dirname;

    while (true) {
        const candidate = current;
        if (existsSync(path.join(candidate, 'package.json'))) {
            return candidate;
        }

        const parent = path.dirname(candidate);
        if (parent === candidate) {
            throw new Error(`Unable to locate project root starting from ${__dirname}`);
        }
        current = parent;
    }
};

export const PROJECT_ROOT = resolveProjectRoot();
export const APP_BASE_PATH = `/${process.env.PUBLIC_PREFIX}`;
export const HTML_ENTRY = 'index';
export const DATA_PLACEHOLDER = '<!--__APP_DATA__-->';
export const DATA_GLOBAL_NAME = '__APP_RESOURCE__';
export const DEFAULT_CACHE_TTL_MS = Number.POSITIVE_INFINITY;
export const RESOURCE_URL = process.env.RESOURCE_URL;
export const RESOURCE_CACHE_TTL = (() => {
    const parsedTtl = Number(process.env.RESOURCE_TTL_MS);
    return Number.isFinite(parsedTtl) && parsedTtl > 0
        ? parsedTtl
        : DEFAULT_CACHE_TTL_MS;
})();
export const RESOURCE_FALLBACK_PATH =
    process.env.RESOURCE_FALLBACK_PATH ?? path.join(PROJECT_ROOT, 'server', 'resource.sample.json');
export const FALLBACK_RETRY_INTERVAL_MS = 30_000;
const RUNTIME_IN_DIST = __dirname.includes(`${path.sep}dist${path.sep}`);
export const IS_PRODUCTION_RUNTIME = process.env.NODE_ENV === 'production' || RUNTIME_IN_DIST;
