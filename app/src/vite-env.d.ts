/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** App version, injected by the CI build from the release tag. */
  readonly VITE_APP_VERSION?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
