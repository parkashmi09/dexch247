---
name: whitelabel-theme
description: Use when adding, renaming, or overriding theme colors / brand assets so the frontend can be re-skinned per whitelabel client without touching component code. Triggers on phrases like "whitelabel", "rebrand", "theme override", "primary color", "client-specific theme".
---

# Whitelabel theming

This site is built to be **whitelabel-able**. A single deployment can be re-skinned
for many brands by changing CSS variables and a small set of brand assets — no JS
or component changes.

## Single source of truth

`old-frontend/d99-latest/new-d99-frontend/frontend/src/styles/variables.css` defines every theme token in `:root` blocks:

- Brand palette (`--bg-primary`, `--bg-secondary`, `--text-primary`, …)
- App layout (`--app-height`, `--bg-body`, `--bg-sidebar`, …)
- Sport-specific accents (`--cricket`, `--tennis`, `--football`, …)
- Third-party widget tokens that the reference site sets:
  - `--PhoneInput*`        (react-phone-number-input)
  - `--swal2-*`            (SweetAlert2)
  - `--w3-*`               (w3 cell layout)
  - `--bs-*`               (Bootstrap 5 — only the ones the reference customizes)

`variables.css` is imported **first** in `main.jsx`, before any other stylesheet,
so every other rule inherits these tokens.

## Per-whitelabel overrides

A whitelabel brand provides:
1. A small JSON or CSS override file (`themes/<brand>.css`) with only the variables
   it wants to change.
2. Optionally a brand `logo.svg` and `favicon.svg`, downloaded into
   `public/assets/brand/<brand>/` via the asset-downloader agent.

The override file is loaded **after** `variables.css` and **after** the reference
CSS, so it always wins. Selection is driven by `VITE_BRAND` or by hostname (see
`src/config.js`).

## Hard rules

1. **Never** hardcode a hex color in a component. Use `var(--token)`.
2. **Never** add a new color directly to `style.css` or `theme.css` (those are
   reference copies). Add to `variables.css` instead.
3. When introducing a new token, add it to:
   - `variables.css` (the default value)
   - The whitelabel override template (`themes/_template.css`)
4. Never read `--bs-*` tokens from a component — use the corresponding semantic
   token (e.g. `--text-primary`) so a whitelabel can override them in one place.
5. Logo/favicon paths must come from `config.js`, not be hardcoded in JSX.

## Checklist when adding a new whitelabel

- [ ] `themes/<brand>.css` created with overrides
- [ ] Brand assets added to `scripts/assets.manifest.json` with
      `"out": "brand/<brand>/..."` paths
- [ ] `npm run sync-assets` run to pull the new files
- [ ] `VITE_BRAND=<brand>` documented in `.env.example`
- [ ] Visual smoke test on mobile / tablet / desktop
