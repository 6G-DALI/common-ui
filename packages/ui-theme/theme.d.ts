export type Theme = 'light' | 'dark'

/** The explicitly stored choice, or null if none. */
export function getStoredTheme(): Theme | null

/** The theme to render: the stored choice, else the OS preference (defaults to dark). */
export function getPreferredTheme(): Theme

/** Applies a theme to the document and persists the choice. */
export function applyTheme(theme: Theme): void

/** Applies the stored/OS-preferred theme; call once, before first paint. */
export function initTheme(): Theme

/** Flips the current theme and returns the new value. */
export function toggleTheme(): Theme
