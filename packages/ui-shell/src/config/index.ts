/**
 * Runtime configuration shared by every 6G-DALI front end.
 *
 * Vite inlines `import.meta.env.VITE_*` into the bundle, so a container built by
 * CI — where no .env exists — ships with whatever the build machine had, and
 * Docker Compose `environment:` values cannot change an already-built image.
 * Guidelines §27 warns about exactly this and recommends a generated runtime
 * config; that is what each app's `public/config.js` is.
 *
 * Resolution order, highest first:
 *   1. `window.__DALI_CONFIG__`   (public/config.js — replaceable in the image)
 *   2. `import.meta.env.VITE_*`   (build-time, used by `npm run dev`)
 *   3. the app's own defaults
 *
 * The single `__DALI_CONFIG__` key is the point: dataops-ui and portal-ui each
 * used to read their own (`__DATAOPS_CONFIG__`, `__PORTAL_CONFIG__`) while
 * agreeing on the VITE_* names underneath, which meant one deployment had to
 * write two config.js files that could silently disagree about where the
 * navbar links point. One key, one file, every front end.
 *
 * Those per-app keys are no longer read. A deployment that mounts its own
 * pre-unification config.js would otherwise lose every value at once and fall
 * back to the compiled-in defaults without saying so, which for the identity
 * provider means an app that looks configured and is not — so their presence is
 * reported loudly instead. See `warnAboutLegacyConfig`.
 */

/** The shared tool suite. Same names in every front end. */
export interface DaliToolUrls {
  daliUrl: string
  portalUrl: string
  dataspaceUrl: string
  dataopsUrl: string
  mlopsUrl: string
}

export const DALI_TOOL_ENV_KEYS: Record<keyof DaliToolUrls, string> = {
  daliUrl: 'VITE_DALI_URL',
  portalUrl: 'VITE_PORTAL_URL',
  dataspaceUrl: 'VITE_DATASPACE_URL',
  dataopsUrl: 'VITE_DATAOPS_URL',
  mlopsUrl: 'VITE_MLOPS_URL',
}

/**
 * Single sign-on. Realm and IdP host must match across the front ends for the
 * shared SSO session to work; the client is per-application.
 */
export interface DaliAuthConfig {
  authUrl: string
  keycloakRealm: string
  keycloakClientId: string
}

export const DALI_AUTH_ENV_KEYS: Record<keyof DaliAuthConfig, string> = {
  authUrl: 'VITE_AUTH_URL',
  keycloakRealm: 'VITE_KEYCLOAK_REALM',
  keycloakClientId: 'VITE_KEYCLOAK_CLIENT_ID',
}

/** The keys of the config every 6G-DALI front end shares. */
export type DaliBaseConfig = DaliToolUrls & DaliAuthConfig

export const DALI_ENV_KEYS: Record<keyof DaliBaseConfig, string> = {
  ...DALI_TOOL_ENV_KEYS,
  ...DALI_AUTH_ENV_KEYS,
}

export const RUNTIME_CONFIG_KEY = '__DALI_CONFIG__'

/**
 * Per-app globals that predate the unified key. No longer read — listed only so
 * that a config.js still using one is reported rather than silently ignored.
 */
const RETIRED_RUNTIME_CONFIG_KEYS = ['__DATAOPS_CONFIG__', '__PORTAL_CONFIG__']

let warned = false

/**
 * Warns once if a retired config global is present.
 *
 * Removing a compatibility shim turns a working deployment into a broken one at
 * the moment its image is upgraded, and a configuration that silently falls back
 * to defaults is the hardest kind to diagnose — the app renders, it just points
 * at the wrong services. A console error costs nothing and names the fix.
 */
function warnAboutLegacyConfig(): void {
  if (warned || typeof window === 'undefined') return
  const w = window as unknown as Record<string, unknown>
  const found = RETIRED_RUNTIME_CONFIG_KEYS.filter(k => w[k])
  if (found.length === 0) return
  warned = true
  console.error(
    `[6g-dali] Ignoring ${found.join(' and ')}: 6G-DALI front ends read `
    + `window.${RUNTIME_CONFIG_KEY} only. This deployment is running on `
    + 'compiled-in defaults. Regenerate public/config.js from the container '
    + `entrypoint, or rename the object in the mounted file to ${RUNTIME_CONFIG_KEY}.`,
  )
}

type RuntimeBag = Record<string, string | undefined> | undefined

function runtimeValue(key: string, windowKeys: string[]): string | undefined {
  if (typeof window === 'undefined') return undefined
  const w = window as unknown as Record<string, RuntimeBag>
  for (const windowKey of windowKeys) {
    const value = w[windowKey]?.[key]
    if (value) return value
  }
  return undefined
}

/** Trailing slashes are stripped so callers can append paths unconditionally
 *  (`${portalUrl}/#/account`) without producing a double slash. */
function stripTrailingSlash(url: string): string {
  return url.endsWith('/') && url.length > 1 ? url.slice(0, -1) : url
}

export interface ResolveConfigOptions<T extends Record<keyof T, string>> {
  /** Per-app fallbacks. Also fixes the shape of the returned object. */
  defaults: T
  /** `VITE_*` name for each key. */
  envKeys: Record<keyof T, string>
  /**
   * The consumer's `import.meta.env`.
   *
   * Passed in rather than read here on purpose: `import.meta.env` is replaced
   * by Vite in the *consuming* app's source, and a pre-bundled dependency
   * cannot rely on that substitution reaching it.
   */
  env?: Record<string, unknown>
  /** Override for tests, or to read an additional global. */
  runtimeKeys?: string[]
}

/**
 * Resolves one config object from runtime globals, build-time env and defaults.
 *
 * Every value is normalised with `stripTrailingSlash`, including defaults —
 * the hand-written versions normalised only the first two sources, so a default
 * ending in `/` behaved differently from the same value supplied by env.
 */
export function resolveConfig<T extends Record<keyof T, string>>(
  options: ResolveConfigOptions<T>,
): T {
  const {
    defaults,
    envKeys,
    env,
    runtimeKeys = [RUNTIME_CONFIG_KEY],
  } = options

  warnAboutLegacyConfig()

  const out = {} as T
  for (const key of Object.keys(defaults) as (keyof T)[]) {
    const name = String(key)

    const runtime = runtimeValue(name, runtimeKeys)
    if (runtime) {
      out[key] = stripTrailingSlash(runtime) as T[keyof T]
      continue
    }

    const buildTime = env?.[envKeys[key]]
    if (typeof buildTime === 'string' && buildTime) {
      out[key] = stripTrailingSlash(buildTime) as T[keyof T]
      continue
    }

    out[key] = stripTrailingSlash(defaults[key]) as T[keyof T]
  }
  return out
}

/**
 * The 6G-DALI tool suite as navbar entries — same labels, order and titles in
 * every front end, which is the whole point of sharing them.
 *
 * Entries whose URL is unset are dropped by the shell rather than pointing
 * somewhere that does not exist, so a partially configured deployment simply
 * shows fewer links.
 */
export function daliTools(urls: Partial<DaliToolUrls>) {
  return [
    {
      label: '6G-DALI',
      url: urls.daliUrl,
      title: 'The 6G-DALI project site',
    },
    {
      // The portal is the entry point to the whole suite, so it leads the apps.
      label: 'Portal',
      url: urls.portalUrl,
      title: 'The 6G-DALI Portal — all services and documentation',
    },
    {
      label: 'Data Space',
      url: urls.dataspaceUrl,
      title: 'Browse and search the 6G-DALI Data Space catalogue',
    },
    {
      label: 'Data Ops',
      url: urls.dataopsUrl,
      title: 'Data Ops — pipelines, datasets and data quality',
    },
    {
      label: 'ML Ops',
      url: urls.mlopsUrl,
      title: 'ML Ops — model training and serving',
    },
  ]
}

/**
 * The portal owns the single account page for the whole DALI SSO environment.
 * Returns undefined when no portal URL is configured, so the caller leaves the
 * username as plain text instead of linking somewhere that does not exist.
 */
export function portalAccountUrl(portalUrl: string | undefined): string | undefined {
  return portalUrl ? `${stripTrailingSlash(portalUrl)}/#/account` : undefined
}
