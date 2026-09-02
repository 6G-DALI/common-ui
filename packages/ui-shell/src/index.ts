/**
 * @6g-dali/ui-shell — the application frame shared by the 6G-DALI front ends.
 *
 * The CSS lives in @6g-dali/ui-theme; `AppShell` imports the shell layer it
 * needs, so consumers only have to import the theme itself (see that package's
 * README for the required order relative to Bootstrap and AdminLTE).
 */

export { AppShell } from './components/AppShell'
export { ExternalToolLinks } from './components/ExternalToolLinks'
export { ThemeToggle } from './components/ThemeToggle'
export { UserLabel } from './components/UserLabel'

export {
  toggleSidebar,
  SIDEBAR_BREAKPOINT,
  SIDEBAR_COLLAPSE_CLASS,
  SIDEBAR_OPEN_CLASS,
} from './sidebar'

export {
  resolveConfig,
  daliTools,
  portalAccountUrl,
  DALI_ENV_KEYS,
  DALI_TOOL_ENV_KEYS,
  DALI_AUTH_ENV_KEYS,
  RUNTIME_CONFIG_KEY,
} from './config'
export type {
  DaliBaseConfig,
  DaliToolUrls,
  DaliAuthConfig,
  ResolveConfigOptions,
} from './config'

export { createKeycloak, redirectUri, usernameOf } from './auth/keycloak'

export { isNavItem, isNavHeading } from './types'
export type {
  AccountAction,
  AppShellProps,
  Crumb,
  ExternalTool,
  NavExternalLink,
  NavHeading,
  NavItem,
  SidebarEntry,
} from './types'
