/**
 * Light/dark theme switching, shared by every 6G-DALI front end.
 *
 * Framework-agnostic on purpose: @6g-dali/ui-theme has no framework
 * dependency, so a Vue app (vanilla) and a React app (dataops-ui/portal-ui,
 * via @6g-dali/ui-shell's ThemeToggle) can both drive the same
 * `data-theme` attribute and localStorage key instead of each keeping its
 * own copy of this logic.
 *
 * Convention: dark is the implicit default (tokens.css's bare `:root`
 * requires no attribute at all to render dark), but `applyTheme` always
 * writes the attribute explicitly for *both* values rather than removing it
 * for dark. That costs nothing here — dark renders identically whether the
 * attribute says "dark" or is absent — and it matters for apps (vanilla)
 * that layer their *own* `[data-theme="dark"]`-gated tokens on the same
 * attribute for their content area: an explicit "dark" is what drives that,
 * where a merely-absent attribute would not.
 */

const STORAGE_KEY = 'dali-theme'
const ATTR = 'data-theme'
// Bootstrap 5.3's own color-mode attribute. AdminLTE's sidebar CSS reads it
// directly (`[data-bs-theme=dark] .app-sidebar { --lte-sidebar-color: ... }`)
// with specificity our own token overrides can't beat, and it matches through
// any ancestor — so a static `data-bs-theme="dark"` anywhere up the tree
// (dataops-ui/portal-ui's index.html both hardcode one, for pre-JS FOUC
// prevention) locks AdminLTE into dark regardless of `data-theme`. Keeping
// this in lockstep with `data-theme` is what actually fixes it; apps with no
// Bootstrap (vanilla) just get an inert extra attribute.
const BS_ATTR = 'data-bs-theme'

/** @returns {'light' | 'dark' | null} the explicitly stored choice, or null if none. */
export function getStoredTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === 'light' || stored === 'dark' ? stored : null
  }
  catch {
    // Private browsing / storage disabled: fall through to no stored preference.
    return null
  }
}

/**
 * The theme to render: the stored choice if one exists, otherwise the OS
 * preference — `prefers-color-scheme: light` opts into light, anything else
 * (including no preference expressed) stays dark, matching the tokens'
 * default.
 * @returns {'light' | 'dark'}
 */
export function getPreferredTheme() {
  const stored = getStoredTheme()
  if (stored) return stored
  if (typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light'
  }
  return 'dark'
}

/**
 * Applies a theme to the document and persists the choice.
 * @param {'light' | 'dark'} theme
 */
export function applyTheme(theme) {
  document.documentElement.setAttribute(ATTR, theme)
  document.documentElement.setAttribute(BS_ATTR, theme)
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  }
  catch {
    // Best-effort persistence only.
  }
}

/**
 * Call once, as early as possible (before first paint), to apply the stored
 * or OS-preferred theme and avoid a flash of the wrong theme.
 * @returns {'light' | 'dark'} the theme that was applied
 */
export function initTheme() {
  const theme = getPreferredTheme()
  applyTheme(theme)
  return theme
}

/**
 * Flips the current theme and returns the new value — the toggle button's
 * whole click handler.
 * @returns {'light' | 'dark'}
 */
export function toggleTheme() {
  const current = document.documentElement.getAttribute(ATTR) === 'light' ? 'light' : 'dark'
  const next = current === 'light' ? 'dark' : 'light'
  applyTheme(next)
  return next
}
