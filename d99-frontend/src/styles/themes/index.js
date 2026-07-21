// ============================================================================
// CENTRAL THEME REGISTRY — the single place that decides every brand theme.
//
// The CSS for ALL brands lives in src/styles/theme.css:
//   default → base `:root { ... }`
//   others  → `:root[data-brand="<brand>"] { ... }`
//
// To add a new brand:
//   1. Add its `:root[data-brand="<brand>"]` block to styles/theme.css
//   2. Add the brand name to THEMES below
// Nothing else anywhere needs to change — the whitelabel config (or
// VITE_BRAND) just has to send that brand name.
// ============================================================================

/** Every brand the app knows. */
export const THEMES = ["default", "demo"];

export const DEFAULT_THEME = "default";

/** Resolve an incoming brand (API/env/hostname) to a known theme. */
export function resolveBrand(brand) {
  return THEMES.includes(brand) ? brand : DEFAULT_THEME;
}
