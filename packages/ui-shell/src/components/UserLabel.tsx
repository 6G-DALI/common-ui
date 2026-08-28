import { FiUser } from 'react-icons/fi'
import type { AccountAction } from '../types'

interface Props {
  username: string
  account?: AccountAction
}

/**
 * The username in the navbar, optionally linking to the account page.
 *
 * Where that page lives differs per app — the portal owns it as one of its own
 * views, dataops-ui links out to the portal's copy — so the destination is a
 * prop. With no `account` the username is plain text, which is also the
 * fallback when a deployment has not configured a portal URL.
 */
export function UserLabel({ username, account }: Props) {
  const content = (
    <>
      <FiUser />
      {username}
    </>
  )

  // Deliberately not `.nav-link`: that selector is sized 1.2rem for the
  // navbar's icon buttons and outranks Bootstrap's `.small`, which would
  // enlarge the label.
  const className =
    'navbar-text text-muted small account-link d-inline-flex align-items-center gap-1 me-2'

  if (!account) {
    return (
      <span className="navbar-text text-muted small d-inline-flex align-items-center gap-1 me-2">
        {content}
      </span>
    )
  }

  if ('href' in account) {
    return (
      <a
        className={className}
        href={account.href}
        // A separate tab is the right default only for cross-app links, where
        // this app may be holding unsaved form state; an in-app account page
        // passes `onSelect` instead and never gets here.
        target={account.newTab ? '_blank' : undefined}
        rel={account.newTab ? 'noopener noreferrer' : undefined}
        title={account.title ?? 'Account settings'}
      >
        {content}
      </a>
    )
  }

  return (
    <a
      className={className}
      href="#/account"
      onClick={e => { e.preventDefault(); account.onSelect() }}
      title={account.title ?? 'Account settings'}
    >
      {content}
    </a>
  )
}
