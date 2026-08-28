import Keycloak from 'keycloak-js'
import type { KeycloakConfig } from 'keycloak-js'
import type { DaliAuthConfig } from '../config'

/**
 * Keycloak adapter factory.
 *
 * The 6G-DALI front ends share one realm on one IdP host: once a user
 * authenticates anywhere in the suite, following a link to another service
 * completes its own login silently against the existing session. That holds
 * only while `url` and `realm` match across apps — which is why they come from
 * the shared config (`VITE_AUTH_URL`, `VITE_KEYCLOAK_REALM`) rather than being
 * written out per application. The *client* differs per app, since each needs
 * its own redirect URIs.
 *
 * A factory rather than a shared instance: each app still owns one module-level
 * adapter and its own `init()` policy — dataops-ui forces
 * `onLoad: 'login-required'`, the portal uses `check-sso` so its landing page
 * stays public.
 */
export function createKeycloak(config: DaliAuthConfig): Keycloak {
  const settings: KeycloakConfig = {
    url: config.authUrl,
    realm: config.keycloakRealm,
    clientId: config.keycloakClientId,
  }
  return new Keycloak(settings)
}

/** Clean base URL (no hash) used as the OAuth redirect target. */
export function redirectUri(): string {
  return window.location.origin + window.location.pathname
}

/**
 * Display name for the navbar, with the same fallback chain both front ends
 * used. `'user'` rather than an empty label, so the control never collapses.
 */
export function usernameOf(keycloak: Pick<Keycloak, 'tokenParsed'>): string {
  return (
    keycloak.tokenParsed?.preferred_username
    ?? keycloak.tokenParsed?.name
    ?? 'user'
  )
}
