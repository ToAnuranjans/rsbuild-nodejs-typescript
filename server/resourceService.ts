import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';

import {
  FALLBACK_RETRY_INTERVAL_MS,
  RESOURCE_CACHE_TTL,
  RESOURCE_FALLBACK_PATH,
  RESOURCE_URL,
} from './config';
import type { ResourcePayload } from './types';

interface ResourceCacheState {
  value: ResourcePayload | null;
  expiresAt: number;
}

const resourceCache: ResourceCacheState = {
  value: null,
  expiresAt: 0,
};

let inflightRefresh: Promise<ResourcePayload> | null = null;

const loadFallbackResource = async (): Promise<ResourcePayload> => {
  if (!existsSync(RESOURCE_FALLBACK_PATH)) {
    throw new Error(
      `Fallback resource not found at ${RESOURCE_FALLBACK_PATH}. Set RESOURCE_URL or provide RESOURCE_FALLBACK_PATH.`,
    );
  }

  const raw = await readFile(RESOURCE_FALLBACK_PATH, 'utf8');
  try {
    return JSON.parse(raw) as ResourcePayload;
  } catch (error) {
    throw new Error(
      `Failed to parse fallback resource at ${RESOURCE_FALLBACK_PATH}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
};

const fetchRemoteResource = async (): Promise<ResourcePayload> => {
  if (!RESOURCE_URL) {
    throw new Error('RESOURCE_URL environment variable is required.');
  }

  const response = await fetch(RESOURCE_URL);
  if (!response.ok) {
    throw new Error(
      `Unable to fetch resource data. Received status ${response.status} from ${RESOURCE_URL}`,
    );
  }
  return (await response.json()) as ResourcePayload;
};

const refreshResource = async (): Promise<ResourcePayload> => {
  if (inflightRefresh) {
    return inflightRefresh;
  }

  inflightRefresh = (async () => {
    let data: ResourcePayload;
    let expiresAt = Number.POSITIVE_INFINITY;

    if (RESOURCE_URL) {
      try {
        data = await fetchRemoteResource();
        expiresAt =
          RESOURCE_CACHE_TTL === Number.POSITIVE_INFINITY
            ? Number.POSITIVE_INFINITY
            : Date.now() + RESOURCE_CACHE_TTL;
      } catch (error) {
        console.error('Failed to fetch resource from RESOURCE_URL:', error);
        console.warn('Falling back to local resource data.');
        data = await loadFallbackResource();
        expiresAt = Date.now() + FALLBACK_RETRY_INTERVAL_MS;
      }
    } else {
      console.warn(
        'RESOURCE_URL not configured. Using fallback resource data from RESOURCE_FALLBACK_PATH.',
      );
      data = await loadFallbackResource();
    }

    resourceCache.value = data;
    resourceCache.expiresAt = expiresAt;
    return data;
  })();

  try {
    return await inflightRefresh;
  } finally {
    inflightRefresh = null;
  }
};

export const getResource = async (
  forceRefresh = false,
): Promise<ResourcePayload> => {
  if (
    !forceRefresh &&
    resourceCache.value !== null &&
    (resourceCache.expiresAt === Number.POSITIVE_INFINITY ||
      resourceCache.expiresAt > Date.now())
  ) {
    return resourceCache.value;
  }

  return refreshResource();
};

export const warmResourceCache = async (): Promise<void> => {
  try {
    await getResource(true);
    console.log('Resource cache hydrated.');
  } catch (error) {
    console.error('Failed to hydrate resource cache:', error);
  }
};
