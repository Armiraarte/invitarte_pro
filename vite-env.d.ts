/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_EVENT_PORTAL_API_BASE_URL?: string;
  readonly VITE_EVENT_PORTAL_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.webp' {
  const src: string;
  export default src;
}
