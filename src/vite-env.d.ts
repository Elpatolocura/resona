/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AUDIUS_APP_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
