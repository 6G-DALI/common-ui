# 6G-DALI common UI

The navigation bar, application frame and theme that every 6G-DALI front end
renders identically, extracted so they exist once instead of being kept in sync
by hand.

| Package | What it is |
| --- | --- |
| [`@6g-dali/ui-theme`](packages/ui-theme) | Design tokens, theme, utilities, app-shell CSS. **No framework dependency** — a Vue or plain-HTML front end can take it. |
| [`@6g-dali/ui-shell`](packages/ui-shell) | React `AppShell` (navbar, sidebar, breadcrumb, footer) plus the runtime-config and Keycloak helpers the apps agree on. |

Consumers today: [`dataops-ui`](https://github.com/6G-DALI/dataops-toolstack)
and [`portal-ui`](https://github.com/6G-DALI/portal-ui). Both previously carried
their own copy of all of it — `theme.css`, `tokens.css`, `ui.css` and
`animations.css` were byte-identical, and `portal-ui`'s `Layout.tsx` opened with
a comment asking future editors to keep it "structurally identical to
dataops-ui".

## Installing in an app

```
npm i @6g-dali/ui-shell @6g-dali/ui-theme
```

That is the whole setup — no `.npmrc`, no token. Both packages are public on
**npmjs.com**.

> **Why not GitHub Packages?** Its npm registry authenticates every read, with
> no anonymous tier even for public packages (ghcr.io is the exception, not the
> rule). That would put a live token in both Dockerfiles, in every CI job and on
> every developer machine, permanently. npmjs serves public packages
> anonymously, so only the publish workflow holds a credential.

### main.tsx

```ts
import 'bootstrap/dist/css/bootstrap.min.css'
import 'admin-lte/dist/css/adminlte.min.css'
import 'admin-lte/dist/js/adminlte.min.js'
import '@6g-dali/ui-theme/fonts.css'
import '@6g-dali/ui-theme'
import './index.css'   // your app's own styles, last
```

The theme overrides Bootstrap and AdminLTE, so it must come after them. Your
app's `index.css` keeps only what is genuinely its own; the resets, `body`,
link and `.skip-to-content` rules now live in `@6g-dali/ui-theme/base.css`.

### config.ts

```ts
import { resolveConfig, DALI_ENV_KEYS, type DaliBaseConfig } from '@6g-dali/ui-shell'

export interface DataopsConfig extends DaliBaseConfig {
  orchestratorUrl: string
  catalogueBaseUrl: string
}

export const config = resolveConfig<DataopsConfig>({
  defaults: {
    daliUrl: '', portalUrl: '', dataspaceUrl: '', dataopsUrl: '', mlopsUrl: '',
    authUrl: 'https://auth.dspace.sparkworks.net/auth',
    keycloakRealm: 'dspace',
    keycloakClientId: 'dataops-ui',
    orchestratorUrl: '',
    catalogueBaseUrl: '',
  },
  envKeys: {
    ...DALI_ENV_KEYS,
    orchestratorUrl: 'VITE_ORCHESTRATOR_URL',
    catalogueBaseUrl: 'VITE_CATALOGUE_BASE_URL',
  },
  // Passed in, not read inside the package: `import.meta.env` is substituted by
  // Vite in *your* source, and a pre-bundled dependency cannot count on that
  // substitution reaching it.
  env: import.meta.env,
})
```

Resolution order is `window.__DALI_CONFIG__` → `import.meta.env.VITE_*` →
defaults, with trailing slashes stripped. **One** runtime key for the whole
suite, so a single generated `config.js` configures every front end and the
navbar links cannot disagree between apps. `__DATAOPS_CONFIG__` and
`__PORTAL_CONFIG__` are still read as a fallback so the apps can migrate one at
a time; drop that once both entrypoint scripts emit `__DALI_CONFIG__`.

### auth/keycloak.ts

```ts
import { createKeycloak, redirectUri } from '@6g-dali/ui-shell'
import { config } from '../config'

export { redirectUri }
export default createKeycloak(config)
```

Each app keeps its own `init()` policy — `dataops-ui` forces
`onLoad: 'login-required'`, the portal uses `check-sso` so its landing page
stays public. Only the realm and IdP host are shared, which is what makes the
single sign-on session work across the suite.

### Layout.tsx

`dataops-ui` — the username links out to the portal's account page, and it
builds a multi-level breadcrumb from `dagId`/`runId`/`taskId`:

```tsx
import { AppShell, BrandLogo, daliTools, portalAccountUrl, usernameOf } from '@6g-dali/ui-shell'

<AppShell<View>
  brand={<BrandLogo product="DataOps" />}
  homeView="home"
  nav={NAV_ITEMS}
  activeView={activeTopView}
  onNavigate={view => onNavigate(view, {})}
  tools={daliTools(config)}
  breadcrumbs={crumbs.map(c => ({
    label: c.label,
    onSelect: () => onNavigate(c.view, c.params),
  }))}
  username={usernameOf(keycloak)}
  account={(url => url ? { href: url, newTab: true } : undefined)(portalAccountUrl(config.portalUrl))}
  onLogout={() => keycloak.logout({ redirectUri: redirectUri() })}
  footer={<strong>DataOps &mdash; Apache Airflow control plane.</strong>}
>
  {children}
</AppShell>
```

`portal-ui` — the account page is one of its own views:

```tsx
<AppShell<View>
  brand={<BrandLogo product="Portal" />}
  homeView="overview"
  nav={NAV_ITEMS}
  activeView={view}
  onNavigate={onNavigate}
  tools={daliTools(config)}
  breadcrumbs={view === 'overview'
    ? [{ label: 'Overview' }]
    : [{ label: 'Overview', onSelect: () => onNavigate('overview') }, { label: PAGE_LABEL[view] }]}
  username={usernameOf(keycloak)}
  account={{ onSelect: () => onNavigate('account') }}
  onLogout={() => keycloak.logout({ redirectUri: redirectUri() })}
  footer={<strong>Portal &mdash; entry point to the 6G-DALI data ecosystem.</strong>}
>
  {children}
</AppShell>
```

Note what is *not* in the shell: `NavParams`. Each app builds its own breadcrumb
trail and hands over ready-made click handlers, which is what lets one component
serve a two-level portal and a five-level DAG/run/task trail.

`AppShell` is generic over the app's route union, so `dataops-ui`'s `View` and
`portal-ui`'s `View` both stay string-literal unions instead of widening to
`string` at the boundary.

### Dates and times

Show every date and time with `formatDateTime`, `formatDate` or `formatTime`
from `@6g-dali/ui-shell`, not with `toLocaleString()`. They write ISO 8601 order
in UTC, so one moment reads the same for every user (guidelines §5.4):

```ts
formatDateTime('2026-11-06T12:52:50+02:00')   // '2026-11-06 10:52:50 UTC'
formatDate('2026-11-06')                      // '2026-11-06' (a calendar day, never shifted)
formatTime(Date.now(), { zone: false })       // '10:52:50'
formatDateTime(ts, { zone: false, millis: true })   // log lines: '2026-11-06 10:52:50.123'
```

## Developing across repos

The cost of three repos instead of a workspace: every shell change is
edit → build → tag → bump two consumers. To shorten the loop locally,

```
cd common-ui && npm run build && npm link -w @6g-dali/ui-shell -w @6g-dali/ui-theme
cd ../dataops-ui && npm link @6g-dali/ui-shell @6g-dali/ui-theme
```

`npm run dev -w @6g-dali/ui-shell` rebuilds on change. Undo with
`npm unlink @6g-dali/ui-shell @6g-dali/ui-theme && npm ci`.

## Releasing

Both packages are versioned in lockstep — `ui-shell` pins an exact `ui-theme`
version — so one tag releases both. Publishing needs an `NPM_TOKEN` repository
secret: a **Granular Access Token** with read/write on the `@6g-dali` scope.

If the publish step fails with `EOTP`, the account's two-factor mode is set to
"authorization and writes", which requires a one-time password on every publish
and so can never succeed from CI; set it to "authorization only" (and check the
org's own 2FA setting, which can impose it independently).

```
npm run version:set -- 0.2.0       # both package.json files AND the lockstep pin
npm install --package-lock-only
git commit -am "v0.2.0" && git tag v0.2.0
git push origin main v0.2.0   # not --follow-tags: it pushes annotated tags only
```

`.github/workflows/publish.yml` refuses to publish if the tag and the package
versions disagree — which is what silently stopped v0.1.1, tagged while both
packages still said 0.1.0. Run `version:set` before tagging, never after.

Consumers pin a caret range (`^0.2.0`) and pick changes up with a normal
dependency bump.
