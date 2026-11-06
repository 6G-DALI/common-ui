import type { ReactNode } from 'react'
import '@6g-dali/ui-theme/shell.css'

export interface BrandLogoProps {
  /** The product the app is, shown after the logo: `DataOps`, `Portal`, `Data Space`. Omit for the logo alone. */
  product?: ReactNode
  /** Accessible name of the logo image. Defaults to `6G-DALI`. */
  label?: string
  /** Extra class on the logo element, for an app that shows it larger than the sidebar does (e.g. a landing page). */
  className?: string
}

/**
 * The 6G-DALI logo, with the product name beside it: what the sidebar brand slot of `AppShell` shows.
 *
 *   <AppShell brand={<BrandLogo product="DataOps" />} ... />
 *
 * The logo follows the shared theme: white letters in dark mode, black in light mode (`.brand-logo` in
 * @6g-dali/ui-theme/shell.css, driven by the `data-theme` attribute). Size it with `className`, or with the
 * `height` of `.brand-logo`; the width follows from the logo's aspect ratio.
 */
export function BrandLogo({ product, label = '6G-DALI', className }: BrandLogoProps) {
  return (
    <span className="brand-lockup">
      <span className={className ? `brand-logo ${className}` : 'brand-logo'} role="img" aria-label={label} />
      {product != null && product !== false && <span className="brand-product">{product}</span>}
    </span>
  )
}
