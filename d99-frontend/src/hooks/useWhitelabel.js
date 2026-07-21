import { useSyncExternalStore } from "react";
import {
  WHITELABEL_DEFAULTS,
  fetchWhitelabelConfig,
} from "../apiservices/whitelabelApi.js";
import { resolveBrand } from "../styles/themes/index.js";

// Tiny module-level store: starts with the static defaults, swaps to the
// API config once loaded. Components re-render via useSyncExternalStore.
let current = WHITELABEL_DEFAULTS;
const listeners = new Set();

function subscribe(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot() {
  return current;
}

/** Upsert a <meta name=...> tag. */
function setMeta(name, content) {
  if (!content) return;
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/** Upsert a <link rel=...> tag. */
function setLink(rel, href) {
  if (!href) return;
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/** Apply config to the document: title, meta tags, favicon, brand attr. */
function applyToDom(wl) {
  if (wl.title) document.title = wl.title;
  setMeta("description", wl.description);
  setMeta("theme-color", wl.themeColor);
  setLink("icon", wl.favicon);
  setLink("apple-touch-icon", wl.favicon);
  // Theme: resolved against the central registry (styles/themes/index.js) —
  // unknown brands fall back to the default theme.
  document.documentElement.setAttribute("data-brand", resolveBrand(wl.brand));
}

/**
 * Kick off the whitelabel load (call once at boot). Defaults apply
 * immediately; API values overwrite when they arrive.
 */
export function initWhitelabel() {
  applyToDom(current);
  fetchWhitelabelConfig().then((cfg) => {
    current = cfg;
    applyToDom(cfg);
    listeners.forEach((cb) => cb());
  });
}

/** Read the whitelabel config inside components (re-renders on load). */
export function useWhitelabel() {
  return useSyncExternalStore(subscribe, getSnapshot);
}
