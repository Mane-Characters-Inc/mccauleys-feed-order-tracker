# McCauleys Feed Tracker — Stack Decision & Lessons Learned

**Written by the Claude session that built the ManeCast TTS Chat Reader (tts-chat-reader/) on the same machine.**

---

## Recommendation: React PWA (Vite)

Pick option 2. Here's why.

---

## What this app actually needs from the platform

| Feature | What the spec requires | PWA covers it? |
|---|---|:---:|
| Local storage | Persist JSON week-by-week | ✅ IndexedDB / localStorage |
| SMS pre-fill | Open Messages app with body | ✅ `sms:?body=…` link |
| Phone dialer | Open dialer with number | ✅ `tel:` link |
| Save to contacts | vCard download (prototype already does this) | ✅ Web Share / download |
| Export JSON + CSV | Share sheet or file download | ✅ Web Share API |
| Import from JSON | File picker → parse | ✅ `<input type=file>` |
| Open external links | Website + Facebook | ✅ |
| Fully offline | No network for any core feature | ✅ Service Worker |
| Installable on Android | Home screen icon, no browser chrome | ✅ PWA manifest |

There is no feature in this spec that requires a native module. Every item maps cleanly to web APIs that work on modern Android Chrome.

---

## Why NOT Expo/React Native for this app

We spent weeks on the TTS Chat Reader in Expo bare workflow. These are the real problems we hit, not theoretical ones.

### 1. Windows CMake/NDK NTFS hardlink bug
When Android NDK builds run on Windows, CMake creates NTFS hardlinks for `.so` files. Gradle 8.x can't snapshot hardlinks (`Files.isRegularFile()` returns false). Any interrupted build leaves the `android/build` directory in a broken state that takes down all subsequent builds. We had to write a custom Gradle init script at `~/.gradle/init.d/fix-cmake-tracking.gradle` to work around it. This is a machine-wide fix that has to be in place on every Windows dev machine. If you forget it on a new machine, the build silently breaks in confusing ways.

### 2. No Expo Go once you have native modules
The moment you add any package with native code (expo-av, expo-speech, a custom Kotlin module), you lose Expo Go. You can no longer scan a QR code and see your app. Every single change — including JS-only changes — requires a full release APK build and USB install. Build time: 5–10 minutes per cycle. This destroyed development velocity.

### 3. Must use `assembleRelease`, not `assembleDebug`
The new React Native Gradle plugin skips JS bundling for debug variants (controlled by `debuggableVariants = ["debug"]`). Debug APKs require a running Metro bundler on your PC. Release APKs are self-contained. Since USB install is the only option, you must always build release — which means no fast refresh, no debug overlay.

### 4. Safe area insets unreliable on Android
`SafeAreaView` with `edges={['top','bottom']}` does not reliably detect the Android navigation bar height on all devices. We went through 3 iterations to get buttons above the nav bar: SafeAreaView only → broke, explicit `useSafeAreaInsets()` → returned 0 on the test device and made things worse, finally hardcoded `Math.max(insets.bottom + 16, 60)` as a platform-specific floor for Android. A PWA running full-screen via the manifest handles this with `env(safe-area-inset-bottom)` in CSS, which works reliably.

### 5. Background/foreground lifecycle is Android-hostile
Needed TTS to keep running when user switched to YouTube. `staysActiveInBackground: true` is an iOS concept — ignored on Android. Had to write a native Kotlin `ForegroundService` class, register it in the manifest, bridge it to JS, and start it from the listening screen. The McCauleys app has no background processing requirement, so this is a non-issue with PWA.

### 6. expo-speech volume doesn't work on Android
`KEY_PARAM_VOLUME` (the Android TTS bundle param) is deprecated since API 21 and ignored by most device TTS engines. There is no way to independently control TTS volume from media volume on Android without native code. Not relevant to this app, but a good example of how "it's in the docs" ≠ "it works."

### 7. Kotlin native module required for any gap
When the standard Expo/RN packages didn't cover a use case, the fix was always: write Kotlin, register a package, rebuild from scratch. That's fine for a long-lived native app. For a utility app like a feed tracker, it's overkill.

---

## When Expo IS the right answer

- Background audio/TTS (like the TTS Chat Reader itself)
- Camera, Bluetooth, NFC, accelerometer
- Push notifications with background delivery
- Complex audio mixing
- Anything that genuinely needs a native background service

The McCauleys app needs none of these.

---

## PWA specifics for this app

**Storage:** Use `localStorage` (same as prototype, same key `mc_feed_tracker_v4`) for the full JSON blob. The dataset is tiny (weeks × feeds × ~6 numbers). No SQLite needed. If the spec ever expands to hundreds of weeks, migrate to IndexedDB — same API surface, bigger limits.

**SMS:** `sms:+18595372418?body=Can+we+please+get…` — Android Chrome opens Messages pre-filled. iOS uses `sms:+1…&body=…` (different delimiter). Test on both.

**Export:** `navigator.share({ files: [jsonFile, csvFile] })` opens the native Android share sheet. Fallback: `<a download>` link. Same as what every Android file-sharing app does.

**Save to contacts:** The prototype already generates a `.vcf` download. Keep doing that. The Web Contacts API exists but requires a secure origin and has spotty support; vCard download is more reliable and already in the spec.

**Install to home screen:** Add a `manifest.json` with `"display": "standalone"` and the MC icon. Android Chrome will prompt "Add to Home Screen" automatically after a couple of visits. Once installed, it runs without browser chrome and looks native.

**Offline:** Add a Service Worker via Vite's `vite-plugin-pwa`. Cache the app shell on install. All logic is local — no fetch calls to worry about.

**Build and test cycle:** `npm run dev` → open on phone browser → instant refresh. No USB cable, no 10-minute builds. Deploy to any static host (or just serve over local network) to test. Massive developer velocity win.

---

## If the client later decides they need native contacts API

Migrating from React PWA to Capacitor is straightforward:
1. `npm install @capacitor/core @capacitor/cli`
2. `npx cap add android`
3. Swap the vCard download for `@capacitor-community/contacts`
4. Swap Web Share for `@capacitor/share`

The entire React codebase stays identical. Capacitor wraps it in a WebView, so it's the same code, just with native plugin bridges. This migration takes a day, not a rewrite.

---

## Bottom line for the other Claude

**Answer: React PWA (Vite).** Port `app-data.jsx` first (it's already framework-agnostic pure functions). Use `localStorage` with the same key and JSON shape as the prototype. The PWA web APIs cover every feature in the spec. Do not use Expo for this app — the only thing it adds over a PWA here is build pain.

The code style already in the prototype (`app-data.jsx`, `app-ui.jsx`, `app-screens-*.jsx`) is clean React — porting to Vite + TypeScript is mostly adding types and replacing the Babel-in-HTML script tags with `import` statements.
