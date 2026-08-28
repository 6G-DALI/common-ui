/**
 * AdminLTE's sidebar state, reimplemented.
 *
 * AdminLTE binds its toggle with a one-shot
 * `document.querySelectorAll('[data-lte-toggle="sidebar"]')` on
 * DOMContentLoaded. React renders the navbar *after* that runs, so the element
 * never receives AdminLTE's listener — and since that listener is also what
 * calls preventDefault(), an `<a href="#">` toggle silently cleared the
 * location hash instead, which a hash router then resolves to its default view.
 * Hence a real `<button>` plus these class manipulations, which mirror
 * AdminLTE's PushMenu (the classes and the 992px sidebarBreakpoint in
 * adminlte.min.js).
 *
 * Both front ends had carried their own copy of this, comment included.
 */
export const SIDEBAR_COLLAPSE_CLASS = 'sidebar-collapse'
export const SIDEBAR_OPEN_CLASS = 'sidebar-open'
export const SIDEBAR_BREAKPOINT = 992

export function toggleSidebar(): void {
  const body = document.body
  if (body.classList.contains(SIDEBAR_COLLAPSE_CLASS)) {
    // expand
    body.classList.remove(SIDEBAR_COLLAPSE_CLASS)
    // On small screens the sidebar is an overlay that needs opening explicitly.
    if (globalThis.innerWidth <= SIDEBAR_BREAKPOINT) body.classList.add(SIDEBAR_OPEN_CLASS)
  } else {
    // collapse
    body.classList.remove(SIDEBAR_OPEN_CLASS)
    body.classList.add(SIDEBAR_COLLAPSE_CLASS)
  }
}
