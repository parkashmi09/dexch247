// Mobile browsers (iOS Safari especially) lie about `100vh`. We pin
// `--app-height` to the real `window.innerHeight` so layouts that need a
// full-screen container can use `height: var(--app-height)`.
//
// Default value comes from variables.css; this script overrides it at runtime.

export function installAppHeight() {
  if (typeof window === "undefined") return;
  const set = () => {
    document.documentElement.style.setProperty(
      "--app-height",
      `${window.innerHeight}px`,
    );
  };
  set();
  window.addEventListener("resize", set);
  window.addEventListener("orientationchange", set);
}
