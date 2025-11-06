import { DATA_GLOBAL_NAME, DATA_PLACEHOLDER } from './config';
import type { ResourcePayload } from './types';

const sanitizeForInlineScript = (value: unknown): string => {
    return JSON.stringify(value ?? null).replace(/</g, '\\u003C');
};

export const injectResourceIntoHtml = (html: string, data: ResourcePayload): string => {
    const scriptTag = `<script>window.${DATA_GLOBAL_NAME} = ${sanitizeForInlineScript(data)};</script>`;
    if (html.includes(DATA_PLACEHOLDER)) {
        return html.replace(DATA_PLACEHOLDER, scriptTag);
    }
    return html.replace('</head>', `${scriptTag}</head>`);
};
