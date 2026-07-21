/**
 * Viewport mode from env: when true, use responsive viewport (width=device-width).
 * When false, use fixed width (e.g. 1020) for desktop-style layout on mobile.
 * Single source of truth for VITE_USE_VIEWPORT.
 */
const USE_RESPONSIVE_VIEWPORT = import.meta.env.VITE_USE_VIEWPORT !== 'false'

/**
 * Hook: whether to use responsive viewport (true) or desktop-on-mobile (false).
 * Use in Layout/Header for viewport meta and compact header styling.
 */
export function useViewport() {
  return USE_RESPONSIVE_VIEWPORT
}

/** For use outside React (e.g. main.jsx). */
export { USE_RESPONSIVE_VIEWPORT }
