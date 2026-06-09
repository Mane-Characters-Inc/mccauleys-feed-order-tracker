# Feed Order Tracker — Build Plan (spec.md)

Production build of the McCauley's Feed Order Tracker mobile app, ported from the
working prototype in `App Design Focus/`. Authoritative requirements live in
`App Design Focus/BUILD_SPEC.md` (§1–11 + Appendices A–B). This file records the
implementation plan and the locked decisions.

## Locked decisions

| Decision | Choice | Rationale |
|---|---|---|
| Stack | **React PWA — Vite + TypeScript** | Per `STACK-DECISION.md`: every spec feature maps to web APIs; Expo adds only Windows build pain. Capacitor is a 1-day escape hatch if native contacts is ever required. |
| Storage | `localStorage`, key `mc_feed_tracker_v4`, identical JSON shape | Same as prototype; dataset is tiny. IndexedDB only if it grows to hundreds of weeks. |
| Data layer | Port `app-data.jsx` **verbatim** into `src/lib/data.ts` | Framework-agnostic pure functions; behavior must not change. |
| Buffer default | **2** | Reproduces §18 validation table exactly; editable in Settings. |
| Worksheet default | **Cards**, with Settings toggle to Spreadsheet grid | Cards are more tappable on phones; both built (prototype parity). |
| Contacts seed | Order line (859) 537-2418 [text], Office (859) 873-3333 [call], nutritionist slot blank (no hardcoded name **or** number) | Documented §16 defaults; nutritionist name + number are both blank by default and editable in Settings. |

## Native concerns → web mapping

| Concern | Implementation |
|---|---|
| SMS pre-fill | `sms:` href with `?&body=` (prototype's `smsHref`) — opens Messages, never auto-sends |
| Dialer | `tel:` href |
| Save to contacts | vCard `.vcf` download (`vcardFor`); Web Share when available |
| Export JSON + CSV | Web Share API with file fallback to `<a download>` |
| Import | `<input type=file>` + paste-JSON, parse → restore |
| Links | open in new tab |
| Offline | `vite-plugin-pwa` service worker, app-shell precache; no runtime fetches |
| Installable | PWA manifest, `display: standalone`, MC round logo icons |
| Safe areas | CSS `env(safe-area-inset-*)` in chrome/tab bar |

## Architecture

```
app/
  index.html               # fonts, manifest link, viewport
  vite.config.ts           # react + vite-plugin-pwa
  public/
    icons/                 # MC round-white logo → PWA icons
    fonts/                 # Britannic Bold, American Captain (self-hosted)
  src/
    main.tsx               # mount
    App.tsx                # shell: routing (tab + view), toast, startNewWeek, buffer
    styles/tokens.css      # MC design tokens (from colors_and_type.css) + globals
    lib/
      data.ts              # PORT of app-data.jsx (pure logic + types)
      data.test.ts         # §18 validation harness (must pass before UI)
      platform.ts          # web handoffs: share, download, vCard, sms/tel (thin)
    ui/                    # primitives (port of app-ui.jsx)
      tokens.ts  icons.tsx  TopBar  TabBar  Stepper  Toggle  Segmented
      Chip  SectionLabel  Button  Sheet  Toast  HoldButton  ContactCard
    screens/
      ThisWeek.tsx  Message.tsx  History.tsx  Backup.tsx  Settings.tsx
      FeedCard.tsx  GridSheet.tsx  WeekDetail.tsx
```

Prototype chrome that is **not** ported: `ios-frame.jsx`, `tweaks-panel.jsx`,
device scaling. Tweaks (layout, buffer, override color, oil reminder) become real
Settings instead. App fills the viewport (responsive, mobile-first).

## Build order

1. **spec.md** (this file).
2. **Scaffold** Vite+TS+PWA, tokens, fonts, logo icons, manifest.
3. **Port `data.ts`** verbatim from `app-data.jsx`, fully typed.
4. **Verify §18** — Vitest harness reproduces every validation value + exact
   Appendix B messages (5/26, 6/2+oil, 6/9) and live 6/16 message. Gate before UI.
5. **UI primitives** from `app-ui.jsx`.
6. **Screens + shell** — This Week (cards/grid), Order Message, History (+detail/
   edit/hold-delete), Backup/Export, Settings (buffer, contacts, links, feeds, oil,
   layout). Wire web handoffs via `platform.ts`.
7. **Run + verify** in browser, then `npm run build` clean.

## Acceptance (BUILD_SPEC §11) — to verify at the end

1. Carry-forward auto-populates `had`/`ordered`; only `have` is entered.
2. `used`/`suggested` per §5; suggestions even; odd manual entries warn.
3. Every field + final message overridable; overrides flagged + revertible.
4. Message matches supplier format exactly (spelled numbers, "cubes", order,
   split-billing, optional oil paragraph, "Thank you!").
5. Rice Bran Oil: one gallon, default Mane Characters, Maplehurst selectable.
6. Fully offline; SMS via native composer, never auto-sends.
7. JSON + CSV export and JSON import work.
8. History preserves numbers + exact sent message; weeks deletable behind hold.
9. Feeds: add / rename / archive / reactivate / reorder / delete; history retained.
10. Supplier contacts: per-number call/text rules + save-to-contacts; links open.
11. UI follows the Mane Characters Design System.

## Brand (BUILD_SPEC §19)

Deep purple `#2C1A3E` chrome, purple `#69428A` structure, teal `#108A81` for
suggested values / key actions, gold `#C9A84C` override flags, warnings `#C0492F`.
Roboto UI (900 buttons / 600 headings / 400 body, 16px floor), Britannic Bold
display, American Captain stencil sublabels, rounded cards, soft purple-tinted
shadows, round white-text logo on the top bar, gentle 200ms motion. No em dashes
in UI copy; tagline never altered.
