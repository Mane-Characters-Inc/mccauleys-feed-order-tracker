# Feed Order Tracker — Mobile App Build Specification

**Client:** Mane Characters Equine Reserve & Retirement
**Document purpose:** Complete build specification for a mobile app developer. Self-contained — all business logic, formulas, message formats, and historical examples needed to build the app are here.
**Branding:** Apply the **Mane Characters Design System** throughout (colors, typography, logo, naming, contact details, etc.).

> **This handoff includes a working prototype.** Sections 1–11 and Appendices A–B below are the authoritative client spec. Sections 12–18 document the **interactive prototype** that already implements all of it — open `Feed Order Tracker.html` in any browser to use it. Where this spec and the prototype agree (they're built to match), the prototype is your reference implementation; port its logic (`app-data.jsx`) verbatim. See **§12** for the file map and **§18** for exact validation values your port must reproduce.

---

## 1. Project Summary

Mane Characters orders horse feed weekly from a supplier (McCauley's) jointly with a second farm, **Maplehurst**. Every order is split evenly between the two farms' accounts, so **all bag quantities must be even numbers**.

Today the process is run with a weekly Excel spreadsheet plus photos of the feed room, which is clunky: each new week's spreadsheet doesn't know last week's numbers, so staff must track down the prior week's photo/spreadsheet to re-enter data that was already recorded.

The app replaces that process. It must:

1. Persist all data locally so each week's starting numbers **carry forward automatically** from the prior week.
2. Compute usage and a suggested order from a simple, fixed formula (§5).
3. Compose the exact order text message in the supplier's required format (§7).
4. Allow **every value and the final message text to be manually overridden** before sending.
5. Work **fully offline** — no network connection required for any core function.
6. Store data in an **exportable, portable format** (§9).
7. Let the user complete the entire weekly task **from the app itself**, including launching the text message to the supplier (§8).

---

## 2. Envisioned App Structure (Pages / Sections)

The developer should apply the Mane Characters Design System to the visual specifics; the following lays out the structural foundation.

### 2.1 This Week (home screen)
The default landing screen and the heart of the app. Shows the active week's worksheet:

- Order date (defaults to the current/next Tuesday, editable).
- A ledger-style grid, one column per feed, with rows for: **Had last week** (auto-carried), **Ordered last week** (auto-carried), **Have today** (the only required new entry each week), **Used** (computed, read-only display), **Suggested order** (computed, read-only display), and **Order this week** (auto-filled from suggestion, editable).
- Visual distinction between auto-calculated values and manually overridden values (an accent color from the design system on overridden cells), and a clear warning state on any odd order quantity (odd quantities cannot be split between the two accounts).
- Rice Bran Oil toggle + billing account selector (§6).
- A primary action leading to the Order Message screen (message review must happen before send).

### 2.2 Order Message
Displays the auto-composed text message (format in §7) in an editable text area.

- A note indicating whether the message is auto-composed or has been manually edited.
- Actions: **Send via text** (opens the device SMS composer pre-filled, §8), **Copy to clipboard**, and **Rebuild from numbers** (discards manual edits and re-composes from current quantities).
- Marking the order as "Sent" finalizes the week (§4.4).

### 2.3 History
Reverse-chronological list of all past weeks. Each entry shows the date, the full grid of numbers (had / ordered / have / used / order sent), whether Rice Bran Oil was included and which account it was billed to, and the exact message text that was sent. Past weeks are viewable and editable (with a confirmation step) — note that editing a past week does **not** retroactively recompute later weeks; later weeks keep their stored values. Past weeks can also be **deleted**, behind an accident-proof confirmation (§13.2).

### 2.4 Export / Backup
Export the full dataset (§9) via the OS share sheet (email, AirDrop, Drive, files, etc.). Also include an import/restore function accepting the same format.

### 2.5 Settings
- Safety buffer value (default 2; see §5.3).
- **Supplier contacts** — see §14. Multiple numbers, each with its own permitted action(s), all user-editable for privacy.
- **Supplier links** — website + Facebook, user-editable (§14.3).
- Feed list management (§3.3): add/remove(archive)/rename feeds and set their display order, for when feeds change over time.
- Default billing account for Rice Bran Oil (default: Mane Characters).

---

## 3. Feeds

### 3.1 Current feed list

| Full name (as it must appear in messages) |
|-------------------------------------------|
| Top Breeder cubes                          |
| Original 14 cubes                          |
| M10 Balancer cubes                         |
| Alam cubes                                 |

> **Short codes retired.** Earlier notes used shorthand (tb / o / m / a). These were data-entry artifacts and are **not surfaced anywhere in the app**. Internally each feed has a stable id (used only to key records); the user never sees or types it. New feeds get an id auto-generated from their name. See §15.

### 3.2 "Cubes" wording — required
Some of the supplier's feeds are offered in both **pellet** and **cube** form. Mane Characters uses **cubes only**, and the word "cubes" is stated in the message for **every** feed — even when that feed is only offered in cube form. The full names above (including "cubes") must be used verbatim in composed messages. (In tight UI spots like grid headers and history chips the trailing "cubes" may be dropped for space — e.g. "Top Breeder" — but never in the composed message.)

### 3.3 Feeds change over time
Horses come and go and feed needs change, so the feed list must not be hard-coded. The app must allow adding, renaming, **archiving** (stop ordering but keep all history), reactivating, reordering, and — behind a guard — permanently deleting feeds. See §15 for the full model. The four feeds above are the initial/default set.

---

## 4. Weekly Workflow & Data Model

### 4.1 Cadence
- Orders are placed **every Tuesday**.
- Delivery arrives **Thursday** — sometimes **before** Thursday's morning feeding, sometimes **after** it.
- Because delivery timing is uncertain, each order must be sized to last **through the end of Thursday morning's feeding of the following week** (~8 days of coverage, not 7). This is the rationale behind the safety buffer in §5.3 — convey it to the user in UI helper text so the rule isn't lost.

### 4.2 Per-week record
Each week is a record containing, **per feed**:

| Field    | Meaning | Source |
|----------|---------|--------|
| `had`    | Bags on hand at the time of the **last** order | Auto-carried from previous week's `have` |
| `ordered`| Bags ordered in the **last** order | Auto-carried from previous week's order quantity |
| `have`   | Bags on hand **today** (counted at order time) | User entry — the only required new input each week |
| `used`   | Bags consumed since the last order | Computed: `had + ordered − have` |
| `suggested` | Suggested order quantity | Computed: see §5 |
| `orderSent` | Quantity actually ordered | Defaults to `suggested`; user-overridable |

Plus week-level fields: order date, Rice Bran Oil flag + billing account (§6), final message text, a per-feed "manually overridden" flag, and a sent/finalized flag.

### 4.3 Carry-forward (critical)
When a new week is started, the app automatically populates:

- New week `had` ← previous week `have`
- New week `ordered` ← previous week's order quantity (`orderSent`)

This carry-forward is the single biggest pain point of the current spreadsheet system and is the core value of the app. The carried values must still be **editable** (e.g., if a count was wrong, or feed was acquired outside the normal order). Only **active** feeds carry into a new week (§15).

### 4.4 Finalizing a week
After the message is sent, the week is marked sent/finalized and moves to History when the next week begins. Starting a new week should be blocked (or warned) if the current week has no `have` counts or no order quantities, since those are needed for carry-forward.

### 4.5 Override everything (critical)
**Every field value must be overridable.** Before the final message is composed the user must be able to adjust any number — `had`, `ordered`, `have`, and especially `orderSent` — and additionally edit the final message text freely (§7.4). Overridden order quantities are visually flagged, with a way to revert a cell back to the auto-suggested value.

---

## 5. Calculation Logic

### 5.1 Usage
```
used = had + ordered − have
```

### 5.2 Suggested order
```
deficit   = used − have + buffer
suggested = deficit rounded UP to the nearest even number
suggested = max(suggested, 0)
```

### 5.3 Buffer
The client's working rule is "add **2 to 4** to avoid running out" — enough to guarantee coverage through the **end of Thursday morning the following week** (§4.1). Implement as a single configurable buffer (default **2**) in Settings, applied per feed to the deficit before even-rounding. The user can effectively apply a larger buffer on any feed/week by overriding the order quantity.

### 5.4 Even-number rule (critical)
Orders are **always even numbers** so the supplier can split the order evenly across the two accounts — even if that means ordering one extra bag than is strictly needed. The suggestion rounds up to even; if the user manually enters an odd number, show a prominent warning (do not hard-block — the user has final say, per §4.5).

### 5.5 Zero quantities
Feeds with an order quantity of 0 are simply omitted from the message.

---

## 6. Rice Bran Oil

- Optional add-on line in the order, toggled per week.
- Always purchased **one gallon at a time** — quantity is always one; no quantity field. A gallon lasts several weeks (probably over 2 months), so it appears only occasionally.
- **Usually used only for Mane Characters horses**, so the default billing account is **Mane Characters** — but the app must allow selecting **Maplehurst** instead.
- It is **not** split between accounts and is **not** part of the even-number rule; billed entirely to the selected account via its own sentence (§7.3).
- Nice-to-have: when ~8 weeks have passed since the last oil purchase, optionally show a gentle reminder ("Rice Bran Oil was last ordered on \<date\> — running low?"). Purely informational; never auto-add it. (Implemented; toggleable.)

---

## 7. Message Composition (supplier-required format)

The supplier requested this exact format for text orders. Reproduce it precisely.

### 7.1 Template
```
Can we please get {list of feed quantities}? Please split the order and bill half to Maplehurst and half to Mane Characters.

[Also, one gallon of Rice Bran Oil billed to {Mane Characters | Maplehurst}.]

Thank you!
```
The bracketed Rice Bran Oil sentence appears only when the oil toggle is on, as its own paragraph between the main order sentence and "Thank you!".

### 7.2 List construction rules
- Each item: `{number-word} bags of {full feed name}` — e.g. `twelve bags of Top Breeder cubes`.
- **Quantities spelled out as words**, lowercase, hyphenated above twenty (`two`, `six`, `twelve`, `twenty-two`). Singular "bag" for a quantity of one.
- Feed order in the sentence follows the configurable active-feed order from Settings (default: Top Breeder, Original 14, M10 Balancer, Alam).
- Serial (Oxford) comma: two items → `X and Y`; three or more → `X, Y, and Z`.
- Feeds with quantity 0 are omitted entirely.

### 7.3 Rice Bran Oil sentence
`Also, one gallon of Rice Bran Oil billed to {account}.` — exact wording, own paragraph.

### 7.4 Manual edit of final message (critical)
The composed message is a **starting point**. The user must be able to freely edit the final text before sending. Once manually edited, recalculation must **not** silently overwrite their edits; an explicit "Rebuild from numbers" action re-composes.

---

## 8. Sending the Order

- Primary action: open the device's native **SMS composer** pre-filled with the **order text number** (§14) and the final message body. **The app never sends the SMS itself** — the user reviews in their Messages app and taps Send. (This keeps the app fully offline-capable.)
- Secondary action: **Copy to clipboard**.
- After sending, the user marks the order sent, which finalizes the week (§4.4) and records the exact message text in History.

---

## 9. Offline Operation & Data Export (critical)

- **Offline-first:** every feature — entry, calculation, message composition, history, export-file generation — works with zero connectivity. Local on-device storage (SQLite or equivalent) is the source of truth. No account, no login, no cloud dependency.
- **Exportable format:** full data export as **JSON** (complete fidelity: all weeks, all fields, settings, message texts) **and** as **CSV** (one row per week per feed: date, feed id, feed name, active/archived, had, ordered, have, used, order_sent, overridden, plus week-level oil flag, oil account, message). Delivered through the OS share sheet.
- **Import/restore** from the JSON export, for device migration or recovery.
- Recommended: an automatic local backup snapshot retained on-device so a bad edit is recoverable.

---

## 10. Seed Data

Pre-load the app with the three historical weeks in Appendix A so the user's first real week (6/16/2026) carries forward correctly from 6/9/2026 — i.e. first new week starts with `had` = {Top Breeder 2, Original 14 5, M10 2, Alam 1} and `ordered` = {Top Breeder 12, Original 14 8, M10 4, Alam 0}. The prototype seeds exactly these weeks; see §18 for the exact stored values (including the two judgment overrides on 6/9 and the per-week sent quantities that make the carry-forward chain in Appendix A internally consistent).

---

## 11. Acceptance Criteria (summary checklist)

1. New week carries forward `had` and `ordered` automatically from the prior week; user only enters today's counts.
2. `used` and `suggested` compute per §5; suggestions are always even; manual odd entries warn.
3. Every numeric field and the final message text are overridable; overrides are visually flagged and revertible.
4. Message output matches the supplier format exactly: spelled-out numbers, "cubes" on every feed, feed ordering, split-billing sentence, optional Rice Bran Oil paragraph with selectable account, closing "Thank you!".
5. Rice Bran Oil: one gallon only, defaults to Mane Characters billing, Maplehurst selectable.
6. App is fully functional offline; SMS handoff uses the native composer and never auto-sends.
7. JSON + CSV export and JSON import work via the share sheet.
8. History preserves every week's numbers and exact sent message; weeks are deletable behind a guard.
9. Feed list is user-manageable (add / rename / archive / reactivate / reorder / delete) and history is always retained.
10. Supplier contacts (§14) support the per-number call/text rules and "save to phone contacts"; supplier links open the website and Facebook.
11. UI follows the Mane Characters Design System.

---

## Appendix A — Historical Spreadsheet Data (last 3 weeks)

Feed codes (historical shorthand only): o = Original 14 cubes, tb = Top Breeder cubes, a = Alam cubes, m = M10 Balancer cubes.

### Week of 5/26/2026
| Feed | had | ordered | have | used | need |
|------|----:|--------:|-----:|-----:|-----:|
| o    | 12  | 14      | 13   | 13   | 8    |
| tb   | 11  | 10      | 9    | 12   | 6    |
| a    | 1   | 0       | 0    | 1    | 2    |
| m    | 3   | 2       | 2    | 3    | 0    |

### Week of 6/2/2026
| Feed | had | ordered | have | used | need |
|------|----:|--------:|-----:|-----:|-----:|
| o    | 14  | 8       | 10   | 12   | 6    |
| tb   | 9   | 6       | 5    | 10   | 8    |
| a    | 0   | 2       | 2    | 0    | 0    |
| m    | 2   | 2       | 2    | 2    | 2    |

### Week of 6/9/2026
| Feed | had | ordered | have | used | need |
|------|----:|--------:|-----:|-----:|-----:|
| o    | 10  | 6       | 5    | 11   | 8    |
| tb   | 5   | 8       | 2    | 11   | 12   |
| a    | 2   | 0       | 1    | 1    | 0    |
| m    | 2   | 2       | 2    | 2    | 4    |

> The "need" values include the client's judgment-call buffer, even-rounding, and occasional manual override (e.g. m = 4 on 6/9 despite zero deficit; a = 0 dropped from a suggestion of 2). This is exactly why §4.5 override capability is mandatory. **Note:** the 5/26 "need" for `m` is listed as 0 in the original table but the actual sent message (Appendix B) ordered **two** bags of M10; the carry-forward into 6/2 (`ordered` = 2 for m) confirms 2 was sent. The prototype seeds the **as-sent** quantities so every historical message reproduces exactly (§18).

## Appendix B — Historical Sent Messages (exact format reference)

**5/12/2026**
```
Can we please get twelve bags of Top Breeder cubes, eighteen bags of Original 14 cubes, and four bags of M10 Balancer cubes? Please split the order and bill half to Maplehurst and half to Mane Characters.

Thank you!
```

**5/19/2026**
```
Can we please get ten bags of Top Breeder cubes, fourteen bags of Original 14 cubes, and two bags of M10 Balancer cubes? Please split the order and bill half to Maplehurst and half to Mane Characters.

Thank you!
```

**5/26/2026**
```
Can we please get six bags of Top Breeder cubes, eight bags of Original 14 cubes, two bags of M10 Balancer cubes, and two bags of Alam cubes? Please split the order and bill half to Maplehurst and half to Mane Characters.

Thank you!
```

**6/2/2026**
```
Can we please get eight bags of Top Breeder cubes, six bags of Original 14 cubes, and two bags of M10 Balancer cubes? Please split the order and bill half to Maplehurst and half to Mane Characters.

Also, one gallon of Rice Bran Oil billed to Mane Characters.

Thank you!
```

**6/9/2026**
```
Can we please get twelve bags of Top Breeder cubes, eight bags of Original 14 cubes, and four bags of M10 Balancer cubes? Please split the order and bill half to Maplehurst and half to Mane Characters.

Thank you!
```

---
---

# Part II — Prototype Reference (what's already built)

## 12. The prototype & file map

Open **`Feed Order Tracker.html`** in a browser. Everything works: enter counts, edit orders, compose & "send", browse/delete history, manage feeds & contacts, export. Data persists in `localStorage` (key `mc_feed_tracker_v4`); the Backup tab can reset to sample data.

| File | Role |
|---|---|
| `Feed Order Tracker.html` | App shell — loads everything, root state, routing, device scaling, Tweaks panel. |
| `app-data.jsx` | **The brain.** Feed registry, all calculation logic, message composition, contacts/links model, date helpers, seed data, storage + migration, export builders, phone/vCard helpers. Pure functions — port these first and exactly. |
| `app-ui.jsx` | Shared UI primitives + brand tokens (`C`, fonts), icons, TopBar, TabBar, Stepper, Toggle, Segmented, Chip, Button, Sheet, Toast, **HoldButton** (press-and-hold confirm), **ContactCard**. |
| `app-screens-week.jsx` | This Week worksheet (card + spreadsheet layouts) and the Order Message screen. |
| `app-screens-more.jsx` | History (+ week detail / edit / delete), Backup/Export, Settings (buffer, contacts, links, feeds, oil). |
| `ios-frame.jsx`, `tweaks-panel.jsx` | **Prototype chrome only — do not ship.** |
| `_ds/…`, `assets/round-white.png` | Mane Characters design system + app logo. |

> Prototype stack is React 18 + Babel-in-browser purely so it runs from a file. **Don't ship that.** Use any native/cross-platform stack; port `app-data.jsx` (framework-agnostic) verbatim and test against §18 before building UI.

## 13. History retention & deletion

- **Editing** a past week (in its detail sheet) changes only that week; later weeks keep their saved numbers (a banner states this).
- **Deleting** a week is gated by a **press-and-hold** button (~1.1s fill) — a tap does nothing, preventing accidental loss. The current (not-yet-sent) week cannot be deleted.
- A week's stored message and numbers are preserved exactly as sent.

## 14. Supplier contacts (model)

Three contacts ship by default, each with its own permitted actions. Numbers are **not hardcoded into logic** — they live in settings and are editable in Settings for privacy.

| id | Default name | Role | Default number | Call | Text |
|---|---|---|---|:--:|:--:|
| `orderText` | McCauley's Feed — Orders | Order text line | **(859) 537-2418** | — | ✓ |
| `office` | McCauley's Feed — Office | Office | **(859) 873-3333** | ✓ | — |
| `amy` | Amy Parker | Nutritionist, McCauley's | *(blank — user sets)* | ✓ | ✓ |

### 14.1 Action behavior (important)
- **Call** opens the phone's dialer **pre-filled** with the number via `tel:` — the user must press the dial button to actually call. The app never places a call.
- **Text** opens the Messages app **pre-filled** with the number via `sms:` — the user must press send. The app never sends.
  - The **order line** text/send pre-fills the **order message body**.
  - **Amy's** text opens the message thread with her with **no pre-filled body** (just opens the conversation).
- The weekly order (§8) always goes to the `orderText` contact.

### 14.2 Save to phone contacts
Each contact has a **save-to-contacts** action (and a "Save all"). The prototype generates a **vCard (.vcf)** download; production should use the native contacts API / share the vCard. Capability maps to the vCard `TEL` type (CELL for text-capable, WORK/VOICE for call-only).

### 14.3 Supplier links
Editable links open in the browser:
- **Website:** https://www.mccauleysfeeds.com/
- **Facebook:** https://www.facebook.com/mccauleysfeeds/

## 15. Feed registry (model)

Feeds live in one ordered registry; each entry: `{ id, name, active }`.

- **Active feeds** (in registry order) drive the worksheet and the message order.
- **Add:** creates `{ id: slug(name), name, active:true }` and adds a cell to the **current** (not-yet-sent) week only — past weeks are never backfilled (a feed didn't exist before it was added).
- **Rename:** updates the name (used in future messages); past weeks keep what was actually sent.
- **Archive (the "remove" action):** sets `active:false` and drops the feed from the current unsent week. **All past weeks keep their records** — archived feeds still appear in the weeks they were ordered, in history and exports. Reversible.
- **Reactivate:** sets `active:true` and re-adds a cell to the current week.
- **Delete permanently:** removes the feed from the registry **and** purges its records from every week. This is the only destructive feed action and is gated by a **press-and-hold** confirmation. Use archive instead unless the feed should truly vanish from history.
- **Reorder:** moves an active feed up/down; this is the message order.
- **IDs are internal only** (never shown/typed). Defaults retain ids `tb/o/m/a` purely as record keys; new feeds get a name-derived slug.

## 16. Data model (exact JSON)

```jsonc
{
  "settings": {
    "buffer": 2,
    "supplierName": "McCauley's Feed",
    "contacts": [
      { "id": "orderText", "name": "McCauley's Feed — Orders", "role": "Order text line",
        "phone": "(859) 537-2418", "canCall": false, "canText": true },
      { "id": "office", "name": "McCauley's Feed — Office", "role": "Office",
        "phone": "(859) 873-3333", "canCall": true, "canText": false },
      { "id": "amy", "name": "Amy Parker", "role": "Nutritionist, McCauley's",
        "phone": "", "canCall": true, "canText": true }
    ],
    "links": [
      { "id": "web", "label": "Website",  "url": "https://www.mccauleysfeeds.com/", "icon": "globe" },
      { "id": "fb",  "label": "Facebook", "url": "https://www.facebook.com/mccauleysfeeds/", "icon": "facebook" }
    ],
    "oilDefaultAccount": "mane",          // "mane" | "maple"
    "feeds": [                            // registry; order = message order
      { "code": "tb", "name": "Top Breeder cubes",  "active": true },
      { "code": "o",  "name": "Original 14 cubes",  "active": true },
      { "code": "m",  "name": "M10 Balancer cubes", "active": true },
      { "code": "a",  "name": "Alam cubes",         "active": true }
    ]
  },
  "weeks": [
    {
      "id": "2026-06-16",                 // == date
      "date": "2026-06-16",               // ISO yyyy-mm-dd
      "feeds": {                          // keyed by feed id
        "tb": { "had": 2, "ordered": 12, "have": 4, "orderSent": null, "overridden": false }
        // ... one per feed present that week
      },
      "oil":  { "on": false, "account": "mane" },
      "message": null,                    // saved text (null until composed/sent)
      "messageEdited": false,
      "sent": false
    }
  ]
}
```
> `code` is the internal id field name (legacy). `have: null` = not yet counted. An overridden cell stores its quantity in `orderSent` with `overridden: true`. Older saved states are migrated on load (feeds gain `active`; `contacts`/`links` are added from defaults).

## 17. Calculation & message — reference functions (`app-data.jsx`)

```
roundUpEven(x):  x<=0 -> 0;  c = ceil(x);  return c even ? c : c+1
calcUsed(cell):  have==null ? null : had + ordered - have
calcSuggested(cell, buffer):  used==null ? null : max(roundUpEven(used - have + buffer), 0)
orderQty(cell, buffer):  cell.overridden ? (orderSent ?? 0) : (suggested ?? orderSent ?? 0)
isOdd(n):  |n % 2| === 1
```
- **Message:** iterate the week's feeds (registry order), include those with `orderQty > 0`, spell out numbers, serial-comma join, wrap in the §7 template, append oil paragraph if on, then "Thank you!". Paragraphs joined with `\n\n`.
- **Carry-forward (`startNewWeek`):** next date = prev + 7 days; for each **active** feed: `had`←prev `have`, `ordered`←prev `orderQty`, `have`←null, reset override; oil resets to `{off, default account}`.
- **Phone:** `tel:` / `sms:` hrefs from digits; `sms` includes `&body=` only when a body is passed (order line yes, Amy no).

## 18. Validation reference (port must reproduce)

Buffer = 2. Derived values from the seed:

| Week | Feed | had | ordered | have | used | suggested | order sent | note |
|---|---|--:|--:|--:|--:|--:|--:|---|
| 5/26 | Top Breeder | 11 | 10 | 9 | 12 | 6 | 6 | |
| | Original 14 | 12 | 14 | 13 | 13 | 2 | **8** | override (as sent) |
| | M10 Balancer | 3 | 2 | 2 | 3 | 4 | **2** | override (as sent) |
| | Alam | 1 | 0 | 0 | 1 | 4 | **2** | override (as sent) |
| 6/2 (oil→Mane) | Top Breeder | 9 | 6 | 5 | 10 | 8 | 8 | |
| | Original 14 | 14 | 8 | 10 | 12 | 4 | **6** | override (as sent) |
| | M10 Balancer | 2 | 2 | 2 | 2 | 2 | 2 | |
| | Alam | 0 | 2 | 2 | 0 | 0 | 0 | |
| 6/9 | Top Breeder | 5 | 8 | 2 | 11 | 12 | 12 | |
| | Original 14 | 10 | 6 | 5 | 11 | 8 | 8 | |
| | M10 Balancer | 2 | 2 | 2 | 2 | 2 | **4** | override |
| | Alam | 2 | 0 | 1 | 1 | 2 | **0** | override |
| 6/16 (active) | Top Breeder | 2 | 12 | 4 | 10 | 8 | — | not yet sent |
| | Original 14 | 5 | 8 | 6 | 7 | 4 | — | |
| | M10 Balancer | 2 | 4 | 3 | 3 | 2 | — | |
| | Alam | 1 | 0 | 1 | 0 | 2 | — | |

With these, the composed messages for 5/26, 6/2 (incl. oil), and 6/9 **exactly equal** Appendix B, and the 6/16 carry-forward equals §10. The live 6/16 message composes as:

> Can we please get eight bags of Top Breeder cubes, four bags of Original 14 cubes, two bags of M10 Balancer cubes, and two bags of Alam cubes? Please split the order and bill half to Maplehurst and half to Mane Characters.
>
> Thank you!

## 19. Branding applied

Follows the Mane Characters Design System (bundled under `_ds/`): *purple frames, teal speaks* — deep purple `#2C1A3E` chrome, teal `#108A81` for suggested values / key actions; gold `#C9A84C` (or a configurable accent) for override flags; warnings `#C0492F`. Roboto UI type (900 buttons / 600 headings / 400 body, 16px floor), Britannic Bold display moments, rounded cards with soft purple-tinted shadows, round white-text logo on the top bar, gentle 200ms motion. The Tweaks panel (prototype-only) exposes worksheet layout, buffer, chrome shade, override-flag color, and the low-oil reminder.

## 20. Mocked vs. production

| Concern | Prototype | Production |
|---|---|---|
| Storage | `localStorage` | On-device store (SQLite / app storage); same JSON shape. |
| Send/Call/Text | `sms:` / `tel:` links (pre-fill only) | Native SMS/dialer intents — never auto-send/dial. |
| Save to contacts | vCard `.vcf` download | Native contacts API / share vCard. |
| Export | Browser file download | Native share sheet (JSON + CSV). |
| Links | `target=_blank` | In-app browser / external open. |
| Device frame, Tweaks panel | Present | Strip them. |

## 21. Open questions for the client

- Confirm Amy Parker's cell number (left blank — set in Settings).
- Confirm the order text line (859) 537-2418 and office (859) 873-3333 are current.
- Default safety buffer — 2 assumed; client says "2 to 4."
- Worksheet default: **cards** or **spreadsheet**? (Both built; toggle in Tweaks.)
- Keep the ~8-week low-oil reminder, and is 8 weeks right?

---

*Full interactive reference: open `Feed Order Tracker.html`. Exact logic, seed & helpers: `app-data.jsx`.*
