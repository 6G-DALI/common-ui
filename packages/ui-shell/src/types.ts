import type { ReactNode } from 'react'
import type { IconType } from 'react-icons'

/**
 * A sidebar entry that routes inside the host application.
 *
 * `view` is the app's own route identifier, kept generic so each front end
 * keeps its own string-literal union (dataops-ui's `View`, portal-ui's `View`)
 * instead of widening to `string` at the shell boundary.
 */
export interface NavItem<V extends string = string> {
  label: string
  view: V
  icon: IconType
}

/** An uppercase heading that groups the entries below it. */
export interface NavHeading {
  heading: string
}

/** A sidebar entry that leaves the application; marked with an outbound glyph. */
export interface NavExternalLink {
  label: string
  href: string
  icon?: IconType
  /** Same tab by default; set for links that should open alongside the app. */
  newTab?: boolean
  title?: string
}

export type SidebarEntry<V extends string = string> =
  | NavItem<V>
  | NavHeading
  | NavExternalLink

export function isNavItem<V extends string>(e: SidebarEntry<V>): e is NavItem<V> {
  return 'view' in e
}

export function isNavHeading<V extends string>(e: SidebarEntry<V>): e is NavHeading {
  return 'heading' in e
}

/**
 * One breadcrumb.
 *
 * The shell does not know how to build a trail — dataops-ui derives one from
 * `dagId`/`runId`/`taskId`, the portal has at most two levels — so each app
 * builds its own and hands over ready-made click handlers. Keeping the
 * navigation *parameters* out of this type is what lets one shell serve both:
 * `NavParams` never crosses the package boundary.
 *
 * The last crumb is always rendered as the inactive current page, whatever it
 * carries (§7.3).
 */
export interface Crumb {
  label: string
  /** Called instead of following `href`; omit for a non-clickable crumb. */
  onSelect?: () => void
  /** Real href, so the crumb is middle-clickable and shows a status-bar target. */
  href?: string
}

/**
 * What the username in the navbar does.
 *
 *   - `{ href }`  — dataops-ui: the portal owns the single account page for the
 *                   whole SSO environment, so it links out to it.
 *   - `{ onSelect }` — portal-ui: the account page is one of its own views.
 *   - omitted     — the username renders as plain text, which is also the
 *                   fallback when a deployment has not configured a portal URL.
 */
export type AccountAction =
  | { href: string; newTab?: boolean; title?: string }
  | { onSelect: () => void; title?: string }

/** One entry in the shared 6G-DALI tool suite shown in the navbar. */
export interface ExternalTool {
  label: string
  /** Dropped from the bar when unset — see `daliTools`. */
  url: string | undefined
  title: string
}

export interface AppShellProps<V extends string = string> {
  /** Sidebar brand, e.g. `<BrandLogo product="DataOps" />` (the 6G-DALI logo and the product's name). */
  brand: ReactNode
  /** Where the brand link goes. Defaults to the first routable sidebar entry. */
  homeView?: V
  nav: SidebarEntry<V>[]
  /** Which sidebar entry is highlighted. Apps with sub-views map them to a top-level one. */
  activeView: V
  onNavigate: (view: V) => void
  /** The shared tool suite. Pass `daliTools(config)`; omit to hide the group. */
  tools?: ExternalTool[]
  breadcrumbs?: Crumb[]
  /** Content-header heading. Defaults to the last breadcrumb's label. */
  pageTitle?: ReactNode
  username?: string
  account?: AccountAction
  /** Omit to hide the logout button (a front end with no forced login). */
  onLogout?: () => void
  /** Footer text, e.g. `<strong>DataOps — Apache Airflow control plane.</strong>`. */
  footer?: ReactNode
  /** Right-hand footer mark. Defaults to `6G-DALI`. */
  footerBrand?: ReactNode
  /**
   * Build marker for the footer — the short commit SHA the bundle was built
   * from, so a deployed page can be traced back to a commit.
   *
   * A prop rather than something the shell derives: the shell has no access to
   * git, and in a container neither does the build (each app's .dockerignore
   * excludes .git, as it should), so the value has to be threaded in from the
   * app's own build-time configuration.
   */
  build?: ReactNode
  /** Target of the `.skip-to-content` link in @6g-dali/ui-theme. */
  contentId?: string
  children: ReactNode
}
