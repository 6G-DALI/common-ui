import { useEffect, useState } from 'react'
import { getPreferredTheme, initTheme, toggleTheme } from '@6g-dali/ui-theme/theme.js'
import '@6g-dali/ui-theme/shell.css'

/**
 * Switches the suite's shared dark/light theme (@6g-dali/ui-theme's
 * `data-theme` attribute). Call `initTheme()` once, before the app renders
 * (e.g. at the top of main.tsx), to apply the stored/OS-preferred theme
 * before first paint — this component only reflects and flips it afterward.
 *
 * Icon + track/thumb switch, styled by `.dali-theme-toggle*` in
 * @6g-dali/ui-theme/shell.css — the same markup and classes vanilla's Vue
 * DarkModeToggle uses, so the control looks identical across every front end
 * rather than each framework growing its own version.
 */
export function ThemeToggle() {
  // Re-reads on mount rather than assuming 'dark': initTheme() may have
  // already resolved a stored or OS-preferred 'light' before this renders.
  const [theme, setTheme] = useState<'light' | 'dark'>(() => getPreferredTheme())

  // Keeps this in sync if initTheme() runs after this component mounts, or
  // if another tab changes the theme and updates the attribute.
  useEffect(() => {
    setTheme(initTheme())
  }, [])

  const isDark = theme === 'dark'

  return (
    <label className="dali-theme-toggle" title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}>
      <svg className="dali-theme-toggle-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {isDark ? (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        )}
      </svg>
      <span className="dali-theme-toggle-track">
        <input
          type="checkbox"
          className="dali-theme-toggle-input"
          checked={isDark}
          aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          onChange={() => setTheme(toggleTheme())}
        />
        <span className="dali-theme-toggle-thumb" />
      </span>
    </label>
  )
}
