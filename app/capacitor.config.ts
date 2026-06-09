import type { CapacitorConfig } from '@capacitor/cli';

/* Feed Order Tracker — native Android shell (Capacitor).
   webDir points at the built PWA. No `server.url` is set, so the web assets
   are bundled INTO the APK and the app runs fully offline — no network for
   any function (BUILD_SPEC §9). */
const config: CapacitorConfig = {
  appId: 'org.manecharacters.feedordertracker',
  appName: 'Feed Order Tracker',
  webDir: 'dist',
  android: {
    // Allow tel:/sms:/mailto: and external https links to hand off to the OS.
    allowMixedContent: false,
  },
};

export default config;
