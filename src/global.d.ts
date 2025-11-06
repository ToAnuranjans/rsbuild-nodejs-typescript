declare global {
    interface Window {
        __APP_RESOURCE__?: unknown;
    }
}

declare module '*.css';
declare module '*.less';
declare module '*.scss';
declare module '*.sass';

export { };
