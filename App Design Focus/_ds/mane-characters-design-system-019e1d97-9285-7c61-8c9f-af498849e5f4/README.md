# Mane Characters — Design System

> **Every Horse, A Tale To Tell. Every Tale, A Mane Character.**

This is the working design system for **Mane Characters Equine Reserve & Retirement**, a registered 501(c)(3) nonprofit equine rescue at **Maplehurst Stock Farm, Paris, Bourbon County, Kentucky**. The system covers everything needed to produce on-brand interfaces, social graphics, slides, print, and merch — colors, type, logos, status badges, components, and a website UI kit recreating the live experience at **manecharacters.org**.

When the brand guidelines and the technical design system disagree, **brand guidelines win**. Both source documents are preserved under `references/`.

---

## What's in this project

| Path | What it is |
|---|---|
| `colors_and_type.css` | All tokens as CSS vars + semantic role helpers (`.mc-h1`, `.mc-name`, `.mc-display`, etc.) |
| `fonts/` | Self-hosted display fonts (Britannic Bold, American Captain, Libre Franklin Bold) |
| `assets/logos/` | Round + rectangle logos, black/white/on-purple variants |
| `assets/badges/` | Five horse-status badges as PNG (source of truth — never redraw) |
| `references/` | Original brand guidelines + design system MD files (authoritative reference) |
| `preview/` | Per-token / per-component preview cards rendered in the Design System tab |
| `ui_kits/website/` | Click-through high-fidelity recreation of the manecharacters.org website |
| `SKILL.md` | Agent Skill spec so this design system can be loaded into Claude Code or invoked here |

---

## Source materials

- **`references/MANE_CHARACTERS_BRAND_GUIDELINES.md`** — the authoritative brand reference (894 lines). Covers strategy, color, type, logo, visual system, components, voice, hashtags, sponsorship, legal, and quick-reference.
- **`references/MANE_CHARACTERS_DESIGN_SYSTEM.md`** — the technical companion: CSS variables, site layout, social handles, anti-patterns, font stacks, badge file names.
- **Live site:** [manecharacters.org](https://manecharacters.org) — the production WordPress site informs the website UI kit. Note: several recommendations in the brand guidelines (utility-bar → purple, body → 16px, footer → deep purple) are **not yet live on the production site**; the UI kit reflects the *recommended target*, not the current site.

---

## Brand at a glance

- **Voice:** Family member sharing news about horses they personally know and love. National Geographic meets Kentucky Derby program.
- **Core feelings (in order):** Trust, Connection, Warmth, Pride.
- **Five programs (always in this order):** Rescue · Rehabilitation · Re-Training · Re-Homing · Retirement.
- **The 20ms test:** within one glance — round logo + purple structural band + Britannic Bold display + full-bleed horse photo → unmistakable.

### Color heart

| Role | Hex | What it does |
|---|---|---|
| **Purple** `#69428A` | structure — headers, footers, buttons, side rules. The frame. |
| **Teal** `#108A81` | storytelling — horse names, pull quotes, key stats. The heart. *Logo left horse: this color never changes.* |
| **Gold Bright** `#C9A84C` | awards, Eternal Characters typographic treatment, premium callouts |
| **Deep Purple** `#2C1A3E` | dark surfaces, slide headers, app tab bars |
| **Off-White** `#F9F8F8` | light backgrounds; replaces black on dark |

**Deployment rule, drilled-in:** *Purple frames. Teal speaks.* They never compete on the same element.

---

## CONTENT FUNDAMENTALS

### How Mane Characters writes

The voice is the brand. It is not corporate, it is not journalistic, it is not advocacy. It is **a family member sharing news about horses they know personally**. Read it aloud — if it doesn't sound like a person, it isn't on brand.

#### Four rules, never broken
1. **Every horse gets their name. Every time.** The horse is the protagonist; the name is a hook.
2. **The facts carry the emotion — don't manufacture it.** A body-condition score of 0 doesn't need an adjective.
3. **End on hope, joy, or gratitude. Always.**
4. **Write full sentences.** No stacked fragments for drama (*"She's 29. She's home."* — never).

#### Person & casing
- **First person plural — always.** "We," "our," "us." Even on LinkedIn.
- **You** is the reader (a supporter), not the audience-at-large.
- **Brand name** is "Mane Characters" in copy. The full DBA "Mane Characters Equine Reserve & Retirement" is for formal/legal contexts only — **always ampersand, never "and."**
- **Headings:** Title Case on big display moments ("Every Horse, A Tale To Tell"); sentence case in product UI is acceptable.
- **CTAs:** uppercase, tracked (Roboto 900, +0.08em letter-spacing). Specific: *"Sponsor Spirit Seeker Now!"* — not *"Donate Now"*.

#### Tone vibe
Warm. Specific. Quietly confident. The horse is the hero; the org is the steward.

#### Emoji
**On brand, used sparingly, used on the right surface.** Allowed:
- 💗 💜 🥰 😆 🙏 🎁 💐 🐴 🎉 👏 💪

Surface rules:
- **X / Instagram / Facebook / TikTok:** yes — they punctuate emotion.
- **LinkedIn:** **never.**
- **Website body, product UI, print, slides:** generally no. The brand mark and color do the work.
- **Email:** sparingly, in copy not chrome.

#### Hashtags
- **Core (always on Instagram):** `#ManeCharacters` `#HorseRescue` `#KentuckyHorses`
- **Regular:** `#manecharacters` `#horserescue` `#wherehorsesheal`
- **Topical:** `#horselife` `#farmlife` `#equinewelfare`
- **Breed-specific (only when accurate):** `#thoroughbredaftercare` `#standardbredaftercare`

#### Voice examples — match this

> **Yes:** "5 month progress pictures of Spirit Seeker! 🎉 Thanks, everyone, for believing and helping us help him. 🙏 He's pretty special. 💜💜💜"
>
> **Yes:** "Today, Spirit Seeker was evaluated. He came with a body score of 0 (you remember). He's a 3.5 now, still gaining, and this all in the harshest winter in a while. He's beaten the odds. 🙏 We wanted to pass that on, to all of you who care about him 💗 It's a good day. 💪"
>
> **No (corporate):** "We are pleased to announce the successful rehabilitation of an equine rescue case."
>
> **No (guilt):** "Without your help, horses like this have nowhere to go."
>
> **No (stacked drama):** "She's 29. She's home. That's where we begin."

#### Sponsorship vs. adoption — careful
- **Sponsorship** is Pay-What-You-Can per-horse support. No tiers, no benefits delta. *"Sponsor [Name] Now!"* / *"Follow [Name]'s Journey!"*
- **Adoption** is the actual adoption program. The word "adopt" is **reserved for that program** and never used in sponsorship copy.

---

## VISUAL FOUNDATIONS

### The four-element recognition system
Every piece of content must carry **at least three** of these; all four together is the strongest signal:

1. **The round logo** — present, with correct light/dark variant
2. **A purple structural band** — header, footer, title band, or side rule in `#69428A` or `#2C1A3E`
3. **Britannic Bold display text** — horse names, headlines, the thumb-stopper word
4. **Full-bleed horse photography** — the horse is the hero, identifiable, named in teal

### Color usage
- *Purple frames. Teal speaks.* Never both on the same element.
- **Gold = `#C9A84C` (bright) for type and small marks.** The deep `#725604` is reserved for large surfaces.
- Background rhythm on long pages: alternate `#F9F8F8` / `#F5F0FA` Purple Whisper / `#E8F7F6` Teal Whisper.
- Status colors (`#ACACAC` Eternal · `#69A1DA` Rehab · `#83CFA3` Retired · `#8CD4CF` Adoptable · `#B9F7F2` Adopted) apply **only** to a horse profile page's utility bar and bio section — never anywhere else.

### Type
- **Display:** Britannic Bold first, American Captain second (stenciled, supporting), Libre Franklin Bold third (editorial credibility).
- **UI:** Roboto across the board — 900 for buttons, 600 for headings, 400 body, 300 fine print.
- **Editorial body:** Roboto Slab 400 for long-form horse stories ("My Story").
- **Body floor:** 16px on web and product, no smaller. The audience skews older — readability is trust.
- **Display tracking:** Britannic Bold gets a small negative track (-0.01em) at hero scale. American Captain gets +0.04em. Buttons get +0.08em.

### Spacing
- **4-px base scale**, named 1–10 (`--mc-space-1` = 4px through `--mc-space-10` = 128px).
- **Generous white space** on light layouts — crowded content signals amateur.
- **Container max:** 1200px standard, 1440px wide.
- **Gutter:** 24px standard.

### Imagery
- **Warm color temperature.** Natural light — golden hour, overcast, barn light. Avoid harsh flash and clinical/cool processing.
- **Horse is always the hero.** Tight portraits and wide environmental shots both work — never crop out the face/eyes.
- **Action and quiet both** — trotting / rolling / nuzzling / grazing. Don't lead with distress.
- **Black & white is reserved.** It is the visual convention for **Eternal Characters** (deceased) and used nowhere else. Train the eye.
- **Naming in teal.** Any graphic featuring a specific horse must name them in `#108A81` (or `#8CD4CF` on dark). Never an afterthought.

### Backgrounds
- **Full-bleed photo** for hero moments + social graphics + slide title cards.
- **Solid color flats** for content slides (`#F9F8F8` or `#F5F0FA`).
- **No patterns, no textures, no busy backgrounds behind body text.** Body text always sits on clean white or a whisper tint.
- **No bluish-purple gradients** — they read AI-generic and conflict with the brand purple. If a dark surface needs depth, use a solid `#2C1A3E` with a subtle vignette, not a gradient.
- **Protection gradients** are acceptable *only* under text on a photo — a bottom-anchored dark scrim (`rgba(0,0,0,0.45)` → transparent over ~40% of the frame). Never decorative.

### Borders, dividers, cards
- **Rounded corners on cards, never sharp rectangles.**
  - `6px` for buttons
  - `8px` for small cards (`--mc-radius-md`)
  - `12px` for large content cards (`--mc-radius-lg`) — the horse card default
  - `16px` for hero elements
  - `999px` pill — only social/mobile contexts
- **Dividers:** `#D7CCCC` warm gray, 1px.
- **Border-strong:** `#69428A` purple, 2px (used on secondary buttons and side-rule callouts).

### Shadows / elevation
- **Soft and purple-tinted.** Shadows use `rgba(44, 26, 62, …)` (deep purple at low alpha), not gray-black. This keeps elevation feeling warm.
- `--mc-shadow-sm` for inline UI, `--mc-shadow-card` for resting cards, `--mc-shadow-lg` for floating menus / modals.
- **Inner shadow / scrim** on photo cards: a bottom-anchored inset shadow holds the horse name legible without an extra DOM layer.
- **No drop shadows on the logo.** Ever.

### Animation
- **Gentle.** Standard `cubic-bezier(0.4, 0, 0.2, 1)`, 200ms default, 320ms slow, 120ms for hover-color tweaks.
- **Fades and small scales — no bounces, no springs.** The brand is quiet confidence; bouncy = playful = wrong register.
- **Photo card hover:** `transform: scale(1.02)` + scrim deepens to `rgba(0,0,0,0.6)`.
- **Reduced motion:** respect `prefers-reduced-motion` — drop all transforms, keep only opacity fades.

### Hover & press states
- **Primary button hover:** purple lightens to `#7d52a0`. Press: drop to base `#69428A`, no shrink.
- **Secondary button hover:** outline fills `#69428A`, text inverts to off-white.
- **Teal CTA hover:** darkens to `#0d7068`.
- **Nav link hover:** color shifts to `#108A81` teal (the active state). Underline appears at 2px offset.
- **Photo card hover:** subtle 1.02 scale + scrim darken. No tilt, no glow.
- **Press states:** color-only — never shrink an element on click. Touch targets must remain a stable ≥44px hit area.

### Transparency & blur
- **Used purposefully.** Photo scrims (`rgba(0,0,0,0.45)` / `0.6` on hover) — yes. Frosted-glass app chrome — no, unless on a dark photo backdrop and there's a real reason.
- **No translucent purple/teal washes over content.** They muddy brand color.

### Layout rules
- **Photography first, everything else second.** Layouts are built around the photo, not the other way around. Text goes where the photo leaves room.
- **The purple anchor.** Every layout — every one — has at least one purple structural element.
- **Teal sparingly.** It must always mean something: a name, a stat, a CTA, a quote.
- **Fixed elements:** sticky utility bar (purple) + nav (white) on desktop. On mobile, utility bar collapses; only the white nav stays. Footer is never sticky.

---

## ICONOGRAPHY

### Approach
Mane Characters does **not** have a proprietary icon set. The brand is photography-led; iconography is utilitarian and intentionally low-key — small line icons in nav chrome and content meta, never decorative illustration.

### What's used where

- **Utility bar (header):** phone, envelope, map pin — paired with the contact strings. Small, white at ~14px on the purple bar.
- **Social icons:** Facebook, Instagram, X, YouTube, Pinterest, TikTok, LinkedIn — brand-mark glyphs. White on dark, purple on light. Always brand marks, never invented glyphs.
- **Navigation:** sign-in (user), bell (notifications), cart (shopping) — line icons at 20px.
- **Buttons:** right-arrow prefix on the primary "Donate" CTA. This is part of the button's identity — match it across primary CTAs.
- **Status:** the **PNG badges** (`assets/badges/`) are the official status iconography on profile pages. They are not redrawn in SVG anywhere — the leather/embossed texture is the point.
- **Logo icon-cluster:** horseshoe + heart, teal, only appears as part of the round logo. **Do not extract or re-use** that mark as a standalone icon.

### Implementation guidance (substitution flagged)

⚠️ **The codebase wasn't attached, so we don't have proprietary icon SVGs.** This system uses **[Lucide](https://lucide.dev)** as the line-icon source — 1.5px stroke, 24px box, square caps. Lucide is the closest CDN match to the line weight visible on the live site's WordPress theme, and it's stable, fully tree-shakable, and matches the brand's quiet, utilitarian tone.

Substitutions made:
- Phone, mail, map-pin → `lucide:phone`, `lucide:mail`, `lucide:map-pin`
- Sign-in / bell / cart → `lucide:log-in`, `lucide:bell`, `lucide:shopping-cart`
- Right arrow on CTAs → `lucide:arrow-right`
- Social brand marks → **[Simple Icons](https://simpleicons.org)** (brand-faithful one-color glyphs)

**Ask for the user:** if the codebase has its own icon font / sprite (very common on WordPress themes), please attach the codebase and we'll swap Lucide for the original set. Same for any custom SVGs in `wp-content/themes/.../images/`.

### Emoji as iconography
**No.** Emoji are *copy* (in social posts), not chrome. They never appear in nav, buttons, badges, or product UI. Two exceptions, both copy not UI:
- Short-form bio: closes with 🐴💜
- Social captions: 💗 💜 🥰 😆 🙏 🎁 💐 punctuate emotional moments

### Unicode glyphs as iconography
**Avoid.** Use a real icon. Star ratings or status pips, if added, should be SVG (Lucide `star`, `star-fill`) at 16–20px.

---

## Anti-patterns — never do these

1. The left-facing teal horse `#108A81` is never another color. Ever.
2. Black-text logo on dark background, or white-text on light. Never.
3. No logo stretching, recoloring, drop shadows, glows, or effects.
4. Never type "Mane Characters" in a font — use the logo file.
5. Never use the WordPress theme default blue `#398ffc` anywhere in brand materials.
6. Never fabricate horse details, health information, or backstory.
7. Never lead with abuse history, weight-loss photos, pity, or guilt.
8. Never stack short dramatic sentences. Write full sentences.
9. Never use "adoption" language in sponsorship contexts.
10. Never use "and" in the full DBA — it's always an ampersand.
11. Never refer to Maplehurst Stock Farm as the org name.
12. Bluish-purple gradients are AI-slop and conflict with the brand purple. Don't.

---

## Caveats / known gaps

- **No production codebase attached.** The website UI kit was built from the brand guidelines + live-site survey notes in the source MDs. If you can share the WordPress theme (or a Figma file), we can lift exact spacing, the real icon set, and any breakpoints we missed.
- **Lucide + Simple Icons used as icon substitutes** — see the iconography section. Flagged for swap if the codebase has its own set.
- **Roboto / Roboto Slab** load from Google Fonts. They are not self-hosted.
- **No sample slides were provided**, so this system doesn't include a slide deck template. The visual foundations + UI kit are enough to build one — happy to scaffold a slide system on request.
- **No mobile app screens** were provided either. The brand has guidance for a mobile app (tab bar `#2C1A3E`, active `#108A81`); we can mock screens if you want to seed an app-side kit.

---

## How to use this system

**For a new web/product piece**

```html
<link rel="stylesheet" href="/colors_and_type.css">

<h1 class="mc-h1">Spirit Seeker</h1>
<p class="mc-slab">Five months ago he came to us with a body condition score of zero…</p>
<button class="mc-btn mc-btn-primary mc-btn-label">Sponsor Spirit Now</button>
```

**For a social graphic**
- 1080×1080 (feed) or 1080×1920 (story).
- Full-bleed horse photo.
- Bottom purple band: horse name in teal-light + round white-text logo right-aligned.
- Britannic Bold headline, upper or center, white.

**For a slide**
- Title: Deep Purple `#2C1A3E` bg, Britannic Bold off-white, teal-light sub, purple accent bar bottom.
- Content: Off-white bg, Roboto 600 purple heading, Roboto 400 body, teal accents, round black-text logo lower-right.
- Section divider: Purple `#69428A` bg, Britannic Bold off-white centered, teal-light accent.

---

*Mane Characters Design System · v1.0 · May 2026*
