import { FiLogOut, FiMenu } from 'react-icons/fi'
import { ExternalToolLinks } from './ExternalToolLinks'
import { UserLabel } from './UserLabel'
import { toggleSidebar } from '../sidebar'
import { isNavHeading, isNavItem } from '../types'
import type { AppShellProps, SidebarEntry } from '../types'
import '@6g-dali/ui-theme/shell.css'

/**
 * The 6G-DALI application shell: navbar, sidebar, content header with
 * breadcrumb, and footer — the AdminLTE frame every front end in the suite
 * renders identically.
 *
 * It had been maintained as two hand-synchronised copies
 * (dataops-ui/src/components/Layout.tsx and portal-ui/src/components/Layout.tsx,
 * the latter carrying a comment asking future editors to keep them
 * "structurally identical"). Everything that genuinely differed between them is
 * a prop: the brand, the sidebar entries, the breadcrumb trail, what the
 * username does, and the footer text.
 */
export function AppShell<V extends string>(props: AppShellProps<V>) {
  const {
    brand,
    homeView,
    nav,
    activeView,
    onNavigate,
    tools = [],
    breadcrumbs = [],
    pageTitle,
    username,
    account,
    onLogout,
    footer,
    footerBrand = '6G-DALI',
    build,
    contentId = 'main',
    children,
  } = props

  // The brand links to the app's home. Falling back to the first routable entry
  // means a caller that forgets `homeView` still gets a working link rather
  // than an `#/undefined` that a hash router resolves to its default view.
  const brandView = homeView ?? nav.find(isNavItem)?.view
  const heading = pageTitle ?? breadcrumbs[breadcrumbs.length - 1]?.label ?? ''

  return (
    <div className="app-wrapper">
      {/* Header / navbar */}
      <nav className="app-header navbar navbar-expand bg-body">
        <div className="container-fluid">
          <ul className="navbar-nav">
            <li className="nav-item">
              {/* A <button>, not an <a href="#">: the anchor's default action
                  cleared the location hash and navigated away (see
                  toggleSidebar). data-lte-toggle is deliberately omitted so
                  AdminLTE cannot also bind here and double-toggle. */}
              <button
                type="button"
                className="nav-link border-0 bg-transparent"
                onClick={toggleSidebar}
                aria-label="Toggle sidebar"
              >
                <FiMenu />
              </button>
            </li>
          </ul>
          <ul className="navbar-nav ms-auto align-items-center">
            <ExternalToolLinks tools={tools} />
            {username && (
              <li className="nav-item">
                <UserLabel username={username} account={account} />
              </li>
            )}
            {onLogout && (
              <li className="nav-item">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
                  onClick={onLogout}
                >
                  <FiLogOut />
                  Logout
                </button>
              </li>
            )}
          </ul>
        </div>
      </nav>

      {/* Sidebar */}
      <aside className="app-sidebar bg-body-secondary shadow" data-bs-theme="dark">
        <div className="sidebar-brand">
          <a
            href={brandView ? `#/${brandView}` : '#'}
            className="brand-link"
            onClick={e => {
              e.preventDefault()
              if (brandView) onNavigate(brandView)
            }}
          >
            <span className="brand-text fw-light">{brand}</span>
          </a>
        </div>
        <div className="sidebar-wrapper">
          <nav className="mt-2">
            <ul className="nav sidebar-menu flex-column" role="menu">
              {nav.map((entry, i) => (
                <SidebarRow
                  key={sidebarKey(entry, i)}
                  entry={entry}
                  activeView={activeView}
                  onNavigate={onNavigate}
                />
              ))}
            </ul>
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <main className="app-main">
        <div className="app-content-header">
          <div className="container-fluid">
            <div className="row align-items-center">
              <div className="col-sm-6">
                <h1 className="mb-0 h4">{heading}</h1>
              </div>
              <div className="col-sm-6">
                <ol className="breadcrumb float-sm-end mb-0">
                  {breadcrumbs.map((crumb, i) => {
                    // §7.3: the current page is never a link, whatever the
                    // caller put on the crumb.
                    const isLast = i === breadcrumbs.length - 1
                    const clickable = !isLast && (crumb.onSelect || crumb.href)
                    return (
                      <li
                        key={`${crumb.label}-${i}`}
                        className={`breadcrumb-item${isLast ? ' active' : ''}`}
                      >
                        {clickable ? (
                          <a
                            href={crumb.href ?? '#'}
                            onClick={e => {
                              if (crumb.onSelect) {
                                e.preventDefault()
                                crumb.onSelect()
                              }
                            }}
                          >
                            {crumb.label}
                          </a>
                        ) : (
                          crumb.label
                        )}
                      </li>
                    )
                  })}
                </ol>
              </div>
            </div>
          </div>
        </div>

        <div className="app-content" id={contentId}>
          <div className="container-fluid">{children}</div>
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="float-end d-none d-sm-inline">{footerBrand}</div>
        {footer}
        {build && (
          <span className="app-footer-build" title="Build this page was served from">
            {build}
          </span>
        )}
      </footer>
    </div>
  )
}

function sidebarKey<V extends string>(entry: SidebarEntry<V>, i: number): string {
  if (isNavHeading(entry)) return `heading-${entry.heading}-${i}`
  if (isNavItem(entry)) return `view-${entry.view}`
  return `link-${entry.href}`
}

interface SidebarRowProps<V extends string> {
  entry: SidebarEntry<V>
  activeView: V
  onNavigate: (view: V) => void
}

function SidebarRow<V extends string>({ entry, activeView, onNavigate }: SidebarRowProps<V>) {
  if (isNavHeading(entry)) {
    return <li className="nav-header" role="presentation">{entry.heading}</li>
  }

  if (isNavItem(entry)) {
    const Icon = entry.icon
    const active = activeView === entry.view
    return (
      <li className="nav-item">
        <a
          href={`#/${entry.view}`}
          className={`nav-link${active ? ' active' : ''}`}
          onClick={e => { e.preventDefault(); onNavigate(entry.view) }}
        >
          <Icon className="nav-icon" />
          <p>{entry.label}</p>
        </a>
      </li>
    )
  }

  const Icon = entry.icon
  return (
    <li className="nav-item">
      <a
        href={entry.href}
        className="nav-link"
        title={entry.title}
        target={entry.newTab ? '_blank' : undefined}
        rel={entry.newTab ? 'noopener noreferrer' : undefined}
      >
        {Icon && <Icon className="nav-icon" />}
        <p>
          {entry.label}
          <span className="nav-external" aria-hidden="true">&#8599;</span>
        </p>
      </a>
    </li>
  )
}
