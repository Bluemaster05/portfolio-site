/**
 * Color theme: follows the system unless the visitor picks light or dark. The choice is kept in
 * localStorage and applied as data-theme on <html> by an inline script before first paint, so
 * pages stay statically prerendered (no cookies() read) and never flash the wrong scheme.
 */
export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

/** Runs in <head> while the HTML is parsed. Keep in sync with readStoredTheme(). */
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("${STORAGE_KEY}");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

function readStoredTheme(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

function systemTheme(): Theme {
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Puts the stored choice back on <html> (React's dev Strict Mode remount clears it). */
export function applyStoredTheme(): void {
  const theme = readStoredTheme();
  if (theme) document.documentElement.dataset.theme = theme;
}

/** Switches to the other scheme. Picking the system's own scheme goes back to following the system. */
export function toggleTheme(): void {
  const root = document.documentElement;
  const system = systemTheme();
  const next: Theme = (readStoredTheme() ?? system) === 'dark' ? 'light' : 'dark';
  try {
    if (next === system) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Storage blocked: the switch still applies to this page view.
  }
  if (next === system) delete root.dataset.theme;
  else root.dataset.theme = next;
}
