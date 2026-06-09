# Feed Order Tracker — Mane Characters

Weekly McCauley's feed order tracker, built as an offline-first **React PWA**
(Vite + TypeScript). Ported from the prototype in `../App Design Focus/`.
See `../spec.md` for the build plan and `../STACK-DECISION.md` for why PWA.

## Run

```bash
npm install
npm run dev       # dev server at http://localhost:5173
npm run build     # type-check + production PWA bundle in dist/
npm run preview   # serve the production build
npm test          # 32 tests: §18 validation + UI smoke
```

To use on a phone: `npm run dev -- --host`, open the Network URL in mobile
Chrome, then "Add to Home Screen". Or deploy `dist/` to any static host.

## Architecture

| Path | Role |
|---|---|
| `src/lib/data.ts` | The brain — verbatim TypeScript port of `app-data.jsx`: feeds, calc (§5), message composition (§7), seed (App. A), storage (key `mc_feed_tracker_v4`), carry-forward, export, vCard, phone helpers. Pure functions. |
| `src/lib/data.test.ts` | §18 validation harness — reproduces every derived value + exact Appendix B messages. |
| `src/lib/platform.ts` | Web handoffs: download, vCard, Web Share (export), clipboard, external links. |
| `src/ui/` | Brand tokens, icons, and primitives (TopBar, TabBar, Stepper, Toggle, Segmented, Chip, Button, Sheet, Toast, HoldButton, ContactCard). |
| `src/screens/` | This Week (cards + grid), Order Message, History (+ detail/edit/hold-delete), Backup/Export, Settings. |
| `src/App.tsx` | Shell — routing, toast, buffer + UI prefs, start-new-week. |

## Notes

- **Offline-first.** All data in `localStorage`; service worker precaches the
  shell. No network needed for any core function.
- **Storage shape** is identical to the prototype (BUILD_SPEC §16), so JSON
  exports are interchangeable.
- **SMS / dialer / contacts** use `sms:` / `tel:` links and vCard download —
  the app never auto-sends or auto-dials (§8, §14.1).
- **Capacitor escape hatch:** if native contacts is ever required, wrap this
  same React code per `STACK-DECISION.md` — no rewrite.
- The Mane Characters design system fonts (`public/fonts/`) and logo
  (`public/assets/round-white.png`, also the PWA icon) are bundled.
