---
name: css-variable-audit
description: Use when the user pastes a `:root { ... }` snippet from devtools or asks to "sync variables", "audit theme tokens", or "match variables to the reference". This skill merges new tokens into old-frontend/d99-latest/new-d99-frontend/frontend/src/styles/variables.css without losing existing ones.
---

# CSS variable audit

When the user pastes one or more `:root { ... }` blocks (typically copied from
the reference site's devtools), follow this procedure exactly.

## Procedure

1. **Read** `old-frontend/d99-latest/new-d99-frontend/frontend/src/styles/variables.css` — this is the single source of
   truth.
2. **Parse** every `:root` block in the pasted snippet. Treat each block as a
   group:
   - PhoneInput tokens     → `:root.phone-input` block
   - swal2 tokens          → `:root.swal2` block
   - w3 tokens             → `:root.w3` block
   - bs (bootstrap) tokens → `:root.bs` block
   - brand palette         → top-level `:root` block
   - sport accents         → `:root.sports` block
3. **Merge**: for each token in the snippet, if it does not exist in
   `variables.css`, add it to its group. If it does exist with a different
   value, do **not** overwrite — instead leave a `/* upstream: <value> */`
   comment next to the existing line so the user can decide.
4. **Preserve order** within groups: never reorder tokens the user has already
   curated.
5. **Never** add a token outside the appropriate `:root` block. Never inline
   raw colors in component CSS.
6. After merging, report:
   - new tokens added (count + names)
   - conflicts left as comments (count + names)
   - groups touched

## Hard rules

- Don't touch `reference/*` files. They're read-only.
- Don't import vendor stylesheets (PhoneInput, SweetAlert2) just to add their
  tokens — only the tokens go into `variables.css`. The actual stylesheets are
  imported from their npm packages when those features ship.
- Media-query scoped `:root` blocks (e.g. `@media (max-width: 720px) { :root { ... } }`)
  must be preserved as media queries in `variables.css`, not flattened.
