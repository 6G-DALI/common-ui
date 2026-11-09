# General GUI Guidelines

## Mission Control — Dark Precision

## 1. Purpose

This document defines the visual language, frontend architecture, interaction patterns, and implementation conventions for a modern technical web application.

It is intended for platforms that expose complex resources, operations, infrastructure, telemetry, and administrative capabilities through a dense but readable interface.

The application should feel like serious, purpose-built infrastructure rather than a generic SaaS product or marketing website.

The guidelines are domain-independent. Product-specific entities such as resources, jobs, services, environments, projects, and policies should be adapted to the terminology of the target platform.

### 1.1 How this document relates to the packages

This document is the specification. The two packages in this repository are its
implementation, and the sections below say which is which:

| Package | Implements |
| --- | --- |
| `@6g-dali/ui-theme` | §4 tokens, §5 typography, §8 motion, and the CSS half of §6 layout. No framework dependency. |
| `@6g-dali/ui-shell` | §6.1 application shell, §7 navigation, §11 configuration resolution, and the Keycloak helpers behind §18. React. |

Consumers today are `portal-ui` and `dataops-ui`. Both previously carried their
own copy of all of it, hand-synchronised; §2.4 is the reason that was worth
ending.

**Do not copy the token or component definitions out of this document into an
application.** Install the packages. Where this document and the packages
disagree, the packages are what actually ships — fix the document, or fix the
package and then the document, but never resolve it by re-implementing locally.

### 1.2 Stylesheet order

Every consuming application imports styles in this order, in `main.tsx`:

```ts
import 'bootstrap/dist/css/bootstrap.min.css'
import 'admin-lte/dist/css/adminlte.min.css'
import 'admin-lte/dist/js/adminlte.min.js'
import '@6g-dali/ui-theme/fonts.css'
import '@6g-dali/ui-theme'
import './index.css'   // the application's own styles, last
```

The order is normative, and it encodes a layering rule: the theme is written to
override Bootstrap and AdminLTE, so it must come after them; an application must
be able to override the theme, so its own styles come after that.

Getting this wrong is not a cosmetic risk. Component stylesheets imported by
components are evaluated when the component's module is first imported — so
`import App from './App'` placed above the theme import silently moves every
component stylesheet *before* it, inverting the layering for the whole
application.

---

## 2. Design Principles

### 2.1 Operational clarity

The interface must make the current system state immediately understandable.

Users should be able to identify:

- what is active;
- what requires attention;
- what recently changed;
- which actions are available;
- whether an operation is progressing, blocked, completed, or failed.

### 2.2 High information density

The application should present substantial technical information without feeling crowded.

Use:

- compact cards;
- clear grouping;
- consistent spacing;
- readable tables;
- progressive disclosure;
- collapsible technical details;
- concise labels;
- stable visual hierarchy.

Avoid oversized headings, excessive empty space, and decorative elements that reduce the amount of useful information visible on screen.

### 2.3 Precision over decoration

Every visual element should communicate structure, state, priority, or interaction.

Decorative effects must remain subtle. Glows, gradients, blur, and animation should reinforce active or live states rather than act as general embellishment.

### 2.4 Consistency

The same entity, state, action, or data type must always use the same visual treatment.

Examples:

- identifiers always use a monospace font;
- destructive actions always use the danger treatment;
- running states always use the same animated indicator;
- detail pages always follow the same header and section structure;
- tables always expose sorting, filtering, loading, empty, and error states consistently.

### 2.5 Progressive disclosure

Show the information required for decision-making first. Keep raw JSON, internal identifiers, advanced configuration, logs, and metadata available without making them the dominant visual layer.

---

## 3. Aesthetic Direction

### Theme

**Mission Control — Dark Precision**

### Visual references

The visual direction is inspired by:

- deep-space operations dashboards;
- scientific control rooms;
- infrastructure monitoring systems;
- modern command-and-control interfaces;
- Bloomberg Terminal-style information density adapted for the web.

The result should feel:

- technical;
- reliable;
- precise;
- calm;
- highly responsive;
- designed for expert users.

It should not feel like:

- a startup landing page;
- a generic administration template;
- a consumer mobile application;
- a neon-heavy cyberpunk interface;
- a decorative science-fiction mock-up.

---

## 4. Design Tokens

Use CSS custom properties as the single source of truth for colors, surfaces, borders, spacing, shadows, and animation timing.

> **As implemented:** these live in `@6g-dali/ui-theme/tokens.css` and arrive
> with `import '@6g-dali/ui-theme'`. The listing below documents them; it is not
> a thing to paste into an application. Changing a token means releasing the
> theme, which is the point — one change reaches every front end.

### 4.0 What the shared theme may style

The theme is a *layer under other people's applications*, so its selectors are
constrained:

- **Document-level base styling may use element selectors** — `html`, `body`,
  headings, `a`, `code`/`pre`, form controls. These establish the page and are
  what a theme is for.
- **Component styling may not.** Use a class, or — for a Bootstrap component —
  set its `--bs-*` custom properties, which apply at Bootstrap's own specificity
  and only to elements that opted in.

This rule was learned rather than assumed. The theme once styled bare
`thead th`, `tbody tr`, `tbody tr:hover` and `tbody td`. Those reached into
every table in every consuming application whether or not it wanted them, and
which declaration won came down to stylesheet order rather than intent.
`dataops-ui` has light tables; it silently picked up this dark palette's
`--bg-elevated` (`#1a2035`) as its row-hover colour whenever the theme happened
to load last, and the disagreement with Bootstrap's instantly-painted cell
overlay surfaced as a flicker when the pointer left a row. Those rules are gone;
tables are themed through `.table { --bs-table-* }` alone.

```css
:root {
  /* Backgrounds */
  --bg-base: #0a0d12;
  --bg-surface: #111620;
  --bg-elevated: #1a2035;
  --bg-overlay: rgba(10, 13, 18, 0.82);

  /* Borders */
  --border: #1f2d45;
  --border-bright: #2a4070;
  --border-subtle: rgba(122, 144, 176, 0.14);

  /* Text */
  --text-primary: #e8edf5;
  --text-secondary: #7a90b0;
  --text-muted: #3d5070;
  --text-inverse: #071014;

  /* Accents */
  --accent-cyan: #00d4ff;
  --accent-cyan-dim: #004d5e;
  --accent-green: #00e5a0;
  --accent-amber: #ffb340;
  --accent-red: #ff4d6a;
  --accent-purple: #a78bfa;

  /* Gradients */
  --gradient-hero: linear-gradient(
    135deg,
    #0a0d12 0%,
    #0f1a2e 50%,
    #0a1520 100%
  );

  /* Shadows */
  --shadow-panel: 0 12px 32px rgba(0, 0, 0, 0.22);
  --shadow-focus: 0 0 0 3px rgba(0, 212, 255, 0.16);
  --shadow-live: 0 0 18px rgba(0, 212, 255, 0.22);

  /* Radius */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;

  /* Motion */
  --duration-fast: 100ms;
  --duration-normal: 150ms;
  --duration-slow: 240ms;
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
}
```

### 4.1 Color usage

| Token | Intended use |
|---|---|
| `--bg-base` | Application background |
| `--bg-surface` | Cards, panels, sidebar, tables |
| `--bg-elevated` | Hover, selected, expanded, and active surfaces |
| `--border` | Default structural borders |
| `--border-bright` | Focused or selected elements |
| `--text-primary` | Main content and headings |
| `--text-secondary` | Labels, captions, metadata |
| `--text-muted` | Disabled content and placeholders |
| `--accent-cyan` | Primary action, live state, active navigation |
| `--accent-green` | Healthy, successful, completed |
| `--accent-amber` | Running, pending, warning |
| `--accent-red` | Error, failure, destructive action |
| `--accent-purple` | Secondary technical highlight |

### 4.2 Color constraints

- Do not use accent colors as large page backgrounds.
- Do not use glow effects on static elements.
- Do not rely on color alone to communicate state.
- Pair state colors with text labels, icons, or patterns.
- Use cyan primarily for interaction and live-system emphasis.
- Reserve red for errors, destructive actions, and critical alerts.

---

## 5. Typography

### 5.1 Font families

**Display and technical headings:** `Space Mono`

Use for:

- page titles;
- metric values;
- status labels;
- technical section headings;
- compact navigation labels;
- prominent timestamps.

**Body and interface text:** `DM Sans`

Use for:

- paragraphs;
- form labels;
- descriptions;
- table text;
- helper text;
- menus;
- buttons.

**Code and identifiers:** `JetBrains Mono`

Use for:

- UUIDs;
- API paths;
- file paths;
- endpoint URLs;
- configuration keys;
- JSON;
- logs;
- commands.

### 5.2 Suggested type scale

| Role | Size | Weight | Font |
|---|---:|---:|---|
| Page title | 28–32 px | 600 | Space Mono |
| Section title | 18–20 px | 600 | Space Mono |
| Card title | 14–16 px | 600 | Space Mono |
| Metric value | 28–40 px | 600 | Space Mono |
| Body | 14–15 px | 400 | DM Sans |
| Label | 12–13 px | 500 | DM Sans |
| Caption | 11–12 px | 400 | DM Sans |
| Identifier | 12–13 px | 400 | JetBrains Mono |

### 5.3 Typography rules

- Use sentence case for headings and labels.
- Avoid full uppercase except for short technical tags.
- Use tabular numerals for metrics and timestamps.
- Keep labels concise and place descriptions in secondary text.
- Avoid using monospace for long paragraphs.
- Use a maximum body line length of approximately 75 characters where possible.

### 5.4 Dates and times

> **As implemented:** `formatDateTime`, `formatDate` and `formatTime` from
> `@6g-dali/ui-shell`. An application calls these and does not format dates
> itself.

- Show dates and times in ISO 8601 order, in UTC: `2026-11-06 10:52:50 UTC`.
  One moment then reads the same for every user and matches what the services
  store (`2026-11-06T10:52:50+00:00`).
- Do not use the browser's locale or time zone (`toLocaleString`,
  `toLocaleTimeString`, `Intl.DateTimeFormat` without a fixed zone).
- A date without a time (`issued`, `modified`) is a calendar day: show
  `2026-11-06` and never shift it by a time zone.
- Dense places (log lines, chart axes, a column whose header says UTC) may drop
  the ` UTC` suffix (`{ zone: false }`) and show milliseconds where they matter
  (`{ millis: true }`).
- Show an empty value as an em dash (`—`). Show a value that is not a date as
  it came.

---

## 6. Layout System

### 6.1 Application shell

> **As implemented:** `AppShell` from `@6g-dali/ui-shell`. An application does
> not rebuild this — it supplies what differs and nothing else:
>
> | Prop | What the application supplies |
> | --- | --- |
> | `brand`, `footer`, `footerBrand` | its own name and footer line |
> | `nav`, `activeView`, `homeView`, `onNavigate` | its sidebar and routing |
> | `breadcrumbs` | a `Crumb[]`, each carrying its own click handler |
> | `tools` | the shared suite, from `daliTools(config)` |
> | `username`, `account`, `onLogout` | who is signed in and what the name links to |
> | `build` | the commit the bundle was built from (§27) |
>
> Navigation *parameters* deliberately do not cross the package boundary: each
> application builds its own breadcrumb trail and hands over ready-made
> handlers. That is what lets one shell serve a two-level portal and a
> five-level DAG → run → task trail without knowing about either.

The primary desktop layout consists of:

- a fixed left sidebar;
- a persistent top bar;
- a scrollable main content area;
- optional contextual side panels or drawers.

Recommended dimensions:

```text
Sidebar width:         240 px
Collapsed sidebar:      72 px
Top bar height:         64 px
Content max width:    1280 px
Page horizontal gap: 24–32 px
Grid columns:            12
```

### 6.2 Main content

- Use a 12-column grid.
- Most views should be single-column with grouped sections.
- Use two-column layouts for detail pages when a secondary actions or metadata panel is useful.
- Keep the main content centered when the viewport exceeds the maximum width.
- Preserve stable horizontal alignment across pages.

### 6.3 Cards and panels

Cards should use:

```css
.panel {
  background: rgba(17, 22, 32, 0.88);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-panel);
  backdrop-filter: blur(8px);
}
```

Rules:

- Avoid excessive nesting of cards.
- Use borders and spacing before introducing additional shadows.
- Use elevated backgrounds for hover and selected states.
- Keep card headers compact.
- Align actions consistently in the top-right corner.

### 6.4 Spacing

Use a 4 px base spacing scale.

```text
4 px   micro spacing
8 px   icon and label spacing
12 px  compact control spacing
16 px  default internal spacing
24 px  section spacing
32 px  major section spacing
48 px  page-level separation
```

---

## 7. Navigation

### 7.1 Sidebar

The sidebar should contain:

- product or platform identity;
- current workspace or project selector;
- primary navigation;
- administrative navigation when authorized;
- connection or platform health indicator;
- collapse control.

The active item should use:

- a cyan left border;
- elevated background;
- brighter text;
- subtle glow;
- animated movement of the active indicator.

### 7.2 Top bar

The top bar should contain:

- breadcrumb or current section;
- current workspace or project;
- optional global search;
- notifications;
- user menu;
- connection or environment indicator when relevant.

### 7.3 Breadcrumbs

Use breadcrumbs on detail, edit, and nested administration pages.

Example:

```text
Resources / Resource Name / Configuration
```

The current page should not be clickable.

---

## 8. Motion and Interaction

Motion should make state changes easier to understand without distracting users.

### 8.1 Standard transitions

- Page transition: fade plus 4 px upward movement, 150 ms ease-out.
- Modal and drawer: fade plus scale or horizontal slide, 150–200 ms.
- Table row entrance: optional staggered fade, 20 ms per row.
- Sidebar indicator: animated vertical movement between active items.
- Number changes: smooth numeric interpolation for live metrics.

### 8.2 Live-state animation

Use a slow breathing glow for active states such as:

- running;
- in progress;
- online;
- deployed;
- live connection.

The animation should be subtle and should not flash.

```css
@keyframes status-breathe {
  0%,
  100% {
    opacity: 0.65;
    box-shadow: 0 0 0 rgba(0, 212, 255, 0);
  }

  50% {
    opacity: 1;
    box-shadow: 0 0 12px rgba(0, 212, 255, 0.35);
  }
}
```

### 8.3 Reduced motion

Respect `prefers-reduced-motion`.

When reduced motion is enabled:

- disable breathing and pulse effects;
- remove staggered entrances;
- replace movement transitions with simple fades;
- avoid animated counters.

---

## 9. Frontend Technology Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | React 18 + Vite | Fast development workflow and modern build tooling |
| Language | TypeScript | Type safety for APIs, components, and application state |
| Routing | React Router v6 | Explicit nested routing and route guards |
| Client state | Zustand | Lightweight global state without excessive boilerplate |
| Server state | TanStack Query v5 | Caching, retries, invalidation, background refetching, and polling |
| UI primitives | Radix UI | Accessible, headless primitives that support custom styling |
| Styling | Tailwind CSS v3 + CSS variables | Utility classes backed by centralized design tokens |
| Forms | React Hook Form + Zod | Performant, type-safe validation and form state |
| Charts | Recharts | Responsive operational and time-series visualizations |
| Code and JSON | Monaco Editor, read-only | Structured configuration, logs, and JSON inspection |
| Icons | Lucide React | Consistent technical iconography |
| Notifications | Sonner | Compact and non-intrusive toast notifications |
| HTTP client | Axios | Typed interceptors and centralized request handling |
| Dates | date-fns | Lightweight date and duration formatting |
| Animations | Framer Motion | Controlled page and component transitions |

### 9.1 Optional additions

Use only when required:

| Need | Recommended option |
|---|---|
| Large virtualized tables | TanStack Virtual |
| Advanced table behavior | TanStack Table |
| WebSocket transport | Native WebSocket or Socket.IO client |
| Feature flags | Central typed feature-flag service |
| Internationalization | react-i18next |
| End-to-end testing | Playwright |
| Unit and component testing | Vitest + React Testing Library |

---

## 10. Repository Structure

> **As implemented:** three repositories, not one. `6G-DALI/common-ui` holds the
> two shared packages and this document; `6G-DALI/portal-ui` and
> `6G-DALI/dataops-toolstack` (which contains `dataops-ui/`) each hold an
> application. They are separate repositories rather than a workspace because
> they already were — so the shared layer is consumed as a published dependency,
> and a change to it is: edit, version, publish, bump the consumers.
>
> The layout below is the shape of each **application**. What it no longer
> contains is as important as what it does: no `styles/tokens.css`,
> `theme.css`, `ui.css`, `animations.css` or `Layout.css`, and no
> hand-written application shell. Those come from the packages. An application
> keeps only the stylesheets that are genuinely its own.

```text
frontend/
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── Dockerfile
├── nginx.conf
├── .env.example
│
└── src/
    ├── main.tsx
    ├── App.tsx
    │
    ├── api/
    │   ├── client.ts
    │   ├── auth.ts
    │   ├── resources.ts
    │   ├── operations.ts
    │   ├── environments.ts
    │   └── admin.ts
    │
    ├── types/
    │   ├── auth.ts
    │   ├── resource.ts
    │   ├── operation.ts
    │   ├── environment.ts
    │   └── admin.ts
    │
    ├── store/
    │   ├── auth.store.ts
    │   ├── workspace.store.ts
    │   └── ui.store.ts
    │
    ├── hooks/
    │   ├── useAuth.ts
    │   ├── useWorkspace.ts
    │   ├── usePolling.ts
    │   ├── usePermissions.ts
    │   └── useDocumentTitle.ts
    │
    ├── components/
    │   ├── layout/
    │   │   ├── AppShell.tsx
    │   │   ├── Sidebar.tsx
    │   │   ├── TopBar.tsx
    │   │   ├── PageHeader.tsx
    │   │   └── Breadcrumbs.tsx
    │   │
    │   ├── ui/
    │   │   ├── Badge.tsx
    │   │   ├── Button.tsx
    │   │   ├── Card.tsx
    │   │   ├── DataTable.tsx
    │   │   ├── EmptyState.tsx
    │   │   ├── ErrorBoundary.tsx
    │   │   ├── Input.tsx
    │   │   ├── Select.tsx
    │   │   ├── Modal.tsx
    │   │   ├── Drawer.tsx
    │   │   ├── Tabs.tsx
    │   │   ├── MetricCard.tsx
    │   │   ├── StatusDot.tsx
    │   │   ├── StatusBadge.tsx
    │   │   ├── Skeleton.tsx
    │   │   ├── JsonView.tsx
    │   │   ├── CopyableId.tsx
    │   │   ├── ConfirmDialog.tsx
    │   │   └── KeyValueEditor.tsx
    │   │
    │   ├── charts/
    │   │   ├── TimeSeriesChart.tsx
    │   │   ├── ResourceGauge.tsx
    │   │   ├── DistributionChart.tsx
    │   │   └── StatusTimeline.tsx
    │   │
    │   └── domain/
    │       ├── ResourceCard.tsx
    │       ├── EnvironmentCard.tsx
    │       ├── OperationRow.tsx
    │       └── StatusBanner.tsx
    │
    ├── pages/
    │   ├── auth/
    │   │   └── LoginPage.tsx
    │   │
    │   ├── dashboard/
    │   │   └── DashboardPage.tsx
    │   │
    │   ├── resources/
    │   │   ├── ResourceListPage.tsx
    │   │   ├── ResourceDetailPage.tsx
    │   │   └── ResourceCreatePage.tsx
    │   │
    │   ├── operations/
    │   │   ├── OperationListPage.tsx
    │   │   ├── OperationDetailPage.tsx
    │   │   └── OperationCreatePage.tsx
    │   │
    │   ├── environments/
    │   │   ├── EnvironmentListPage.tsx
    │   │   └── EnvironmentDetailPage.tsx
    │   │
    │   └── admin/
    │       ├── AdminPage.tsx
    │       ├── UsersPage.tsx
    │       ├── ProjectsPage.tsx
    │       └── PoliciesPage.tsx
    │
    ├── routes/
    │   ├── router.tsx
    │   ├── AuthGuard.tsx
    │   └── RoleGuard.tsx
    │
    ├── lib/
    │   ├── formatters.ts
    │   ├── status.ts
    │   ├── permissions.ts
    │   └── constants.ts
    │
    └── styles/
        ├── globals.css
        ├── tokens.css
        └── animations.css
```

### 10.1 Structure rules

- Keep API calls separate from UI components.
- Keep transport types and view models explicit.
- Do not place page-specific logic in generic design-system components.
- Store domain-specific compound components under `components/domain`.
- Keep global state limited to authentication, workspace context, permissions, and truly shared UI state.
- Prefer TanStack Query for server-owned data.

---

## 11. Environment Configuration

Use Vite environment variables for build-time configuration.

```bash
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_APP_NAME=Mission Control
VITE_ENABLE_ADMIN=true
VITE_ENABLE_LIVE_UPDATES=true
```

Provide a documented `.env.example` without secrets.

### 11.1 Runtime configuration, as implemented

Build-time variables alone are not enough — see the note in §27. Configuration
is resolved by `resolveConfig` from `@6g-dali/ui-shell`, highest source first:

1. `window.__DALI_CONFIG__` — `public/config.js`, replaceable in the image
2. `import.meta.env.VITE_*` — build-time, used by `npm run dev`
3. the application's own defaults

**`__DALI_CONFIG__` is a single key shared by every 6G-DALI front end.** Each
application reads the keys it knows and ignores the rest, so one generated
`config.js` configures the whole suite. This matters more than it looks: while
each application read its own global, a single deployment had to write one
config file per application, and those could disagree about where the shared
navigation links pointed — §2.4 violated by construction rather than by
oversight.

Two conventions follow from it:

- **Shared keys keep shared names.** The tool-suite and single-sign-on keys come
  from `DaliBaseConfig` and its `DALI_ENV_KEYS`, so an application cannot invent
  a private spelling for something the whole suite depends on. An application
  extends that interface with its own keys and supplies their `VITE_*` names.
- **Renaming a key is a migration, not an edit.** When `dataops-ui` moved from
  its own `keycloakUrl`/`VITE_KEYCLOAK_URL` to the shared `authUrl`/
  `VITE_AUTH_URL`, the old name was kept as a deprecated alias that the new one
  fell back to, and the entrypoint script emitted both, until every deployment
  had moved. Without that, upgrading an image would have silently repointed the
  application at its compiled-in default identity provider — working by luck
  wherever the two happened to match, and wrong everywhere else.
- **Retiring a compatibility shim is also a migration.** Removing one turns a
  working deployment into a broken one the moment its image is upgraded, and a
  configuration that quietly falls back to defaults is the hardest kind to
  diagnose: the application renders perfectly and points at the wrong services.
  So a retired key is not merely deleted — its presence is detected and reported
  on the console, naming the fix. `resolveConfig` does this for the retired
  `__DATAOPS_CONFIG__` and `__PORTAL_CONFIG__` globals.

Values are normalised on the way through: a trailing slash is stripped from
every source, including the defaults, so callers can append paths
unconditionally.

Pass `import.meta.env` into `resolveConfig` explicitly. Vite substitutes it in
the *application's* source; a pre-bundled dependency cannot rely on that
substitution reaching it.

Do not expose:

- private API keys;
- service credentials;
- signing secrets;
- infrastructure passwords;
- privileged tokens.

---

## 12. Routing Conventions

Recommended route structure:

```text
/login

/dashboard

/resources
/resources/new
/resources/:resourceId
/resources/:resourceId/edit

/operations
/operations/new
/operations/:operationId

/environments
/environments/:environmentId

/admin
/admin/users
/admin/projects
/admin/projects/:projectId
/admin/policies
```

### 12.1 Route rules

- Authentication is required for all routes except `/login` and explicitly public pages.
- Administrative routes require a role or permission guard.
- Use stable entity identifiers in URLs.
- Store filter and pagination state in query parameters where practical.
- Preserve list state when returning from a detail page.
- Use route-level lazy loading for major page groups.
- Provide a dedicated not-found page and unauthorized page.

---

## 13. Page Templates

## 13.1 Login Page

Use a full-screen split layout.

### Left panel

- platform identity;
- concise product tagline;
- subtle animated technical background;
- optional organizational or consortium logos;
- environment label when multiple environments exist.

### Right panel

- email or username field;
- password field;
- primary login button;
- optional single sign-on actions;
- error message area;
- platform attribution.

### Behavior

```text
Submit credentials
→ receive access token
→ store authentication state
→ fetch current user and permissions
→ redirect to the original requested route or dashboard
```

The login page must remain visually calm and should not contain dashboard navigation.

---

## 13.2 Overview Dashboard

The dashboard should summarize the health and recent activity of the platform.

### Recommended structure

**Top row:** four to six metric cards

Examples:

- total registered resources;
- active operations;
- active services;
- online environments;
- current alerts;
- completed operations over a selected period.

**Middle section:** two columns

- left: recent activity feed;
- right: environment or subsystem health summary.

**Bottom section:** compact recent-item tables

- recent operations;
- recent changes;
- recent alerts;
- recent administrative actions.

### Dashboard rules

- Every metric must link to the corresponding filtered view.
- Always show the data timestamp.
- Distinguish zero from unavailable data.
- Use polling only for values that can change while the user watches.
- Pause or reduce polling when the browser tab is hidden.
- Do not display decorative charts without operational value.

---

## 13.3 List and Catalogue Pages

Use list pages for resources, operations, users, projects, policies, and environments.

### Standard structure

1. Page header with title, description, and primary action.
2. Search field.
3. Filter controls or filter chips.
4. Result count and active-filter summary.
5. Grid or table.
6. Pagination or virtualized scrolling.
7. Empty, loading, and error states.

### Grid view

Use when entities benefit from visual summaries.

Each card should contain:

- name;
- identifier or version;
- category or type;
- current status;
- two to four key attributes;
- primary quick action;
- secondary overflow menu.

### Table view

Use when comparison, sorting, and bulk scanning matter more than visual identity.

Tables should support:

- sorting;
- filtering;
- pagination;
- column visibility where useful;
- row selection for bulk actions;
- stable loading skeletons;
- keyboard navigation where practical.

---

## 13.4 Detail Pages

Detail pages should use a consistent structure.

### Header

- breadcrumb;
- entity name;
- status badge;
- short identifier;
- primary actions;
- overflow actions.

### Main content

Use tabs or sections such as:

- Overview;
- Configuration;
- Activity;
- Metrics;
- Related entities;
- Raw data.

### Two-column layout

Recommended split:

```text
Main information:  60–70%
Actions/metadata:  30–40%
```

The right panel may contain:

- actions;
- ownership;
- tags;
- timestamps;
- access information;
- related links;
- compact metadata.

### Raw technical content

Show JSON, logs, configuration, or payloads in collapsible panels using a read-only code viewer.

---

## 13.5 Create and Edit Flows

Use a single-page form for simple entities and a wizard for complex operations.

### Single-page form

Use when:

- the form has fewer than approximately ten fields;
- fields belong to one conceptual group;
- review is not required;
- there are few conditional branches.

### Multi-step wizard

Use when the flow includes several independent decisions.

Recommended steps:

1. Select the primary resource.
2. Select the target environment or context.
3. Configure parameters.
4. Review and submit.

### Wizard rules

- Show the current step and total steps.
- Preserve entered data when moving backward.
- Validate each step before advancing.
- Provide a complete read-only review before submission.
- Show the result and next actions after successful submission.
- Warn before abandoning unsaved progress.

---

## 13.6 Live Operation Page

Use this pattern for any long-running process.

### Header banner

Show:

- operation identifier;
- current status;
- target environment;
- creation time;
- elapsed duration;
- responsible user or service when available.

### Default live tab

Show:

- progress indicator;
- current phase or step;
- live metrics;
- recent log events;
- external orchestrator or execution identifier;
- available actions such as cancel, suspend, resume, retry, or stop.

### Additional tabs

**Configuration**

Read-only view of the submitted request and resolved configuration.

**Report or outcome**

Available when the operation completes. Include:

- summary metrics;
- duration;
- generated artifacts;
- related resources;
- warnings;
- errors;
- raw result payload.

### Live-data rules

- Poll only while the operation is non-terminal.
- Stop polling after completion, failure, or cancellation.
- Display the last successful update time.
- Show a non-blocking stale-data warning when updates fail.
- Keep the last known data visible during transient errors.

---

## 13.7 Environment or Infrastructure Page

Use a grid for the list and a technical summary for the detail page.

### Environment card

Include:

- name;
- status;
- location or logical region;
- environment type;
- capability summary;
- active workload count;
- last heartbeat.

### Environment detail

Recommended sections:

- resource capacity;
- software or tools stack;
- active workloads;
- connectivity or health;
- metadata;
- maintenance state;
- administrative actions.

Use gauges sparingly. Exact values must always be visible alongside graphical indicators.

---

## 13.8 Administration Pages

Administrative interfaces should follow the same visual language as the rest of the application.

Typical sections:

- users;
- roles;
- projects or workspaces;
- memberships;
- access policies;
- audit events;
- system configuration.

Administrative actions should:

- clearly state their scope;
- require confirmation when destructive;
- expose permission changes explicitly;
- show success or failure feedback;
- record an audit event when supported.

---

## 14. Core Component Specifications

## 14.1 StatusBadge

All application statuses must map to a centralized visual configuration.

```ts
export type StatusConfig = {
  label: string;
  textClass: string;
  borderClass: string;
  backgroundClass?: string;
  glow: boolean;
  icon?: React.ComponentType;
};

export const STATUS_CONFIG: Record<string, StatusConfig> = {
  not_started: {
    label: "Not Started",
    textClass: "text-text-muted",
    borderClass: "border-border",
    glow: false,
  },
  accepted: {
    label: "Accepted",
    textClass: "text-accent-cyan",
    borderClass: "border-accent-cyan",
    glow: false,
  },
  pending: {
    label: "Pending",
    textClass: "text-accent-amber",
    borderClass: "border-accent-amber",
    glow: false,
  },
  in_progress: {
    label: "In Progress",
    textClass: "text-accent-amber",
    borderClass: "border-accent-amber",
    glow: true,
  },
  running: {
    label: "Running",
    textClass: "text-accent-amber",
    borderClass: "border-accent-amber",
    glow: true,
  },
  suspended: {
    label: "Suspended",
    textClass: "text-accent-purple",
    borderClass: "border-accent-purple",
    glow: false,
  },
  completed: {
    label: "Completed",
    textClass: "text-accent-green",
    borderClass: "border-accent-green",
    glow: false,
  },
  finished: {
    label: "Finished",
    textClass: "text-accent-green",
    borderClass: "border-accent-green",
    glow: false,
  },
  failed: {
    label: "Failed",
    textClass: "text-accent-red",
    borderClass: "border-accent-red",
    glow: false,
  },
  cancelled: {
    label: "Cancelled",
    textClass: "text-text-muted",
    borderClass: "border-border",
    glow: false,
  },
  online: {
    label: "Online",
    textClass: "text-accent-green",
    borderClass: "border-accent-green",
    glow: true,
  },
  offline: {
    label: "Offline",
    textClass: "text-accent-red",
    borderClass: "border-accent-red",
    glow: false,
  },
  maintenance: {
    label: "Maintenance",
    textClass: "text-accent-amber",
    borderClass: "border-accent-amber",
    glow: false,
  },
  healthy: {
    label: "Healthy",
    textClass: "text-accent-green",
    borderClass: "border-accent-green",
    glow: false,
  },
  unhealthy: {
    label: "Unhealthy",
    textClass: "text-accent-red",
    borderClass: "border-accent-red",
    glow: true,
  },
  draft: {
    label: "Draft",
    textClass: "text-text-muted",
    borderClass: "border-border",
    glow: false,
  },
  active: {
    label: "Active",
    textClass: "text-accent-cyan",
    borderClass: "border-accent-cyan",
    glow: false,
  },
  deprecated: {
    label: "Deprecated",
    textClass: "text-accent-red",
    borderClass: "border-border",
    glow: false,
  },
  archived: {
    label: "Archived",
    textClass: "text-text-muted",
    borderClass: "border-border",
    glow: false,
  },
};
```

Unknown statuses should use a neutral fallback and display the normalized raw value.

---

## 14.2 Button

Recommended variants:

- `primary` — principal page action;
- `secondary` — normal action;
- `ghost` — low-emphasis toolbar action;
- `danger` — destructive action;
- `link` — inline navigation;
- `icon` — icon-only control with tooltip and accessible label.

Rules:

- Only one primary action should dominate a section.
- Destructive actions must not use the primary cyan treatment.
- Loading buttons should preserve their width.
- Disabled buttons must explain why when the reason is not obvious.

---

## 14.3 MetricCard

A metric card should contain:

- label;
- main value;
- optional unit;
- trend or delta;
- comparison period;
- optional status icon;
- optional navigation target.

Do not show a trend arrow without a stated comparison period.

---

## 14.4 CopyableId

Use for UUIDs, paths, endpoints, and long identifiers.

Behavior:

- render in `JetBrains Mono`;
- truncate visually when necessary;
- preserve the complete value in the copy action;
- show a tooltip or temporary confirmation after copying;
- expose the full value on focus or hover.

---

## 14.5 JsonView

The JSON viewer should support:

- read-only Monaco rendering;
- formatted JSON;
- line wrapping toggle;
- copy action;
- collapse and expand;
- optional search;
- maximum initial height;
- graceful rendering of invalid or non-JSON text.

---

## 14.6 DataTable

The generic table component should expose:

- typed columns;
- sortable headers;
- filters;
- pagination;
- loading skeletons;
- empty state;
- error state;
- row actions;
- optional row selection;
- optional column visibility;
- stable row keys.

Avoid embedding business logic directly in the generic table component.

---

## 14.7 StatusTimeline

Use a horizontal timeline for short, ordered process states.

Each step should indicate:

- completed;
- current;
- pending;
- failed;
- skipped, when applicable.

Always include text labels. Do not rely only on dots or color.

---

## 15. Forms

### 15.1 Form layout

- Use a single column for most forms.
- Use two columns only for short, clearly related fields.
- Keep labels above fields.
- Place helper text below labels or controls.
- Place validation errors directly below the affected control.
- Group advanced settings in collapsible sections.

### 15.2 Validation

Use Zod schemas as the source of truth.

Validation should occur:

- on submit by default;
- on blur for fields with clear constraints;
- immediately for destructive or irreversible configuration conflicts;
- before advancing to the next wizard step.

### 15.3 Key-value editor

Use a reusable key-value editor for:

- environment variables;
- metadata;
- labels;
- parameters;
- headers;
- custom configuration.

The editor should support add, remove, reorder, duplicate-key validation, and optional secret masking.

### 15.4 Destructive changes

Require explicit confirmation for actions such as:

- delete;
- revoke;
- deactivate;
- stop;
- cancel;
- reset;
- remove membership;
- replace an active configuration.

Confirmation text should name the affected entity.

---

## 16. Data Visualization

### 16.1 Chart principles

Charts should answer an operational question.

Every chart should provide:

- title;
- clear axis labels;
- units;
- legend when multiple series exist;
- time range;
- tooltip values;
- loading and empty states.

### 16.2 Time-series charts

Use for:

- telemetry;
- performance;
- resource usage;
- progress metrics;
- event rates;
- historical state.

Avoid smoothing that could hide real spikes unless the raw values remain accessible.

### 16.3 Gauges

Use gauges only for bounded values such as:

- percentage utilization;
- capacity;
- quota;
- health score.

Always show the exact numeric value next to the gauge.

### 16.4 Colors in charts

- Cyan: primary live series.
- Purple: secondary comparison series.
- Green: successful or healthy threshold.
- Amber: warning threshold.
- Red: critical threshold.

Do not use more series colors than users can reliably distinguish.

---

## 17. API Client

Centralize HTTP behavior in a single Axios client.

```ts
// src/api/client.ts
import axios from "axios";
import { useAuthStore } from "../store/auth.store";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30_000,
});

client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();

      const currentPath = `${window.location.pathname}${window.location.search}`;
      const redirect = encodeURIComponent(currentPath);

      window.location.href = `/login?redirect=${redirect}`;
    }

    return Promise.reject(error);
  },
);

export default client;
```

### 17.1 API rules

- Define request and response types.
- Normalize transport errors before exposing them to the UI.
- Keep authentication handling centralized.
- Use query invalidation after mutations.
- Avoid direct Axios calls inside presentational components.
- Attach correlation or request IDs when the backend supports them.
- Do not silently retry destructive mutations.

---

## 18. Authentication and Authorization

### 18.1 Authentication state

The authentication store may contain:

- current user;
- access token;
- refresh token when used;
- token expiration;
- active workspace or project;
- granted roles or permissions.

### 18.2 Storage

Prefer secure, HTTP-only cookies when supported by the backend.

When local storage is required:

- store the minimum necessary information;
- never store passwords;
- clear state on logout;
- handle token expiration;
- avoid storing privileged response payloads.

### 18.3 Authorization

Authorization must be enforced by the backend. Frontend guards are for user experience only.

The UI should:

- hide unavailable navigation;
- disable unauthorized actions when visibility is useful;
- explain missing permissions;
- provide a dedicated unauthorized state;
- avoid briefly rendering protected content before access checks complete.

---

## 19. Server State and Polling

Use TanStack Query for server-owned data.

### 19.1 Query key conventions

```ts
["resources"]
["resources", filters]
["resource", resourceId]
["operations"]
["operation", operationId]
["environment", environmentId]
```

### 19.2 Polling hook

```ts
import { useQuery } from "@tanstack/react-query";
import { getOperation } from "../api/operations";

const TERMINAL_STATUSES = [
  "completed",
  "finished",
  "failed",
  "cancelled",
];

export function useOperation(operationId: string) {
  return useQuery({
    queryKey: ["operation", operationId],
    queryFn: () => getOperation(operationId),
    enabled: Boolean(operationId),
    refetchInterval: (query) => {
      const operation = query.state.data;

      if (
        operation &&
        TERMINAL_STATUSES.includes(operation.status)
      ) {
        return false;
      }

      return 5_000;
    },
    refetchIntervalInBackground: false,
  });
}
```

### 19.3 Polling rules

- Use 5-second polling for live process detail views.
- Use 15–30-second polling for dashboard summaries.
- Stop polling terminal entities.
- Pause polling when the page is not visible unless background updates are essential.
- Prefer WebSockets or server-sent events when update frequency is high.
- Display last-updated time for operational data.

---

## 20. Loading, Empty, Error, and Stale States

Every data-driven component must define four states.

### Loading

- Use skeletons that approximate the final layout.
- Avoid replacing the entire page with a spinner.
- Preserve page structure during refetches.

### Empty

An empty state should explain:

- what is missing;
- why it may be empty;
- what the user can do next.

### Error

An error state should include:

- concise human-readable message;
- retry action when appropriate;
- correlation or request ID when available;
- access to technical details without exposing secrets.

### Stale data

When a refresh fails but previous data exists:

- keep the previous data visible;
- show a subtle stale-data warning;
- display the last successful update time;
- allow manual retry.

---

## 21. Notifications and Feedback

Use toast notifications for transient feedback such as:

- action completed;
- copy successful;
- background refresh failed;
- item created;
- item updated.

Do not use toasts as the only place for:

- validation errors;
- critical failures;
- destructive confirmations;
- long technical messages;
- information the user may need to reference later.

Use inline feedback for form and page-level problems.

---

## 22. Accessibility

The application should target WCAG 2.1 AA behavior.

Requirements:

- full keyboard navigation;
- visible focus states;
- semantic headings;
- form labels associated with inputs;
- accessible names for icon-only buttons;
- dialogs with focus trapping;
- adequate color contrast;
- screen-reader text for status indicators;
- reduced-motion support;
- no color-only communication;
- logical tab order;
- skip-to-content link.

Data visualizations should include textual summaries or accessible tabular alternatives when the chart communicates critical information.

---

## 23. Responsive Behavior

The application is desktop-first but must remain usable on smaller screens.

### Desktop

- fixed expanded sidebar;
- multi-column dashboard;
- full tables;
- persistent metadata panels.

### Tablet

- collapsible sidebar;
- two-column sections collapse when needed;
- tables may hide low-priority columns;
- detail sidebars move below main content.

### Mobile

- sidebar becomes a drawer;
- top bar is simplified;
- cards use one column;
- tables switch to compact cards or horizontal scrolling;
- sticky action bars may be used for primary actions;
- avoid complex drag-and-drop as the only input method.

Do not reduce text below accessible sizes to preserve density.

---

## 24. Performance Guidelines

- Use route-level code splitting.
- Lazy-load Monaco and heavy chart packages.
- Memoize expensive derived values, not every component.
- Virtualize lists with hundreds of rows.
- Debounce server-side search inputs.
- Cancel stale requests when supported.
- Avoid polling data that is not visible.
- Keep animation properties limited to opacity and transforms.
- Optimize icon and font loading.
- Prefer SVG or CSS backgrounds over large decorative images.
- Track bundle size and page-load regressions.

---

## 25. Security Guidelines

- Treat all frontend validation as convenience, not security.
- Sanitize untrusted rendered content.
- Do not render arbitrary HTML from API responses.
- Avoid exposing secrets in logs, URLs, JSON viewers, or error messages.
- Apply a restrictive Content Security Policy where possible.
- Protect against clickjacking and cross-site scripting.
- Use secure cookies and CSRF protection when authentication uses cookies.
- Confirm destructive operations.
- Do not place tokens in query parameters.
- Redact secret fields in configuration viewers.

---

## 26. Testing Strategy

### Unit tests

Cover:

- formatters;
- status mappings;
- validation schemas;
- permission helpers;
- reducers or stores;
- API response normalization.

### Component tests

Cover:

- form validation;
- loading, empty, and error states;
- status rendering;
- table interactions;
- modal behavior;
- permission-dependent controls.

### End-to-end tests

Cover critical flows:

- login and logout;
- navigation;
- create and edit flow;
- long-running operation monitoring;
- cancellation or stop flow;
- administrative permission checks;
- expired-session handling.

---

## 27. Docker Integration

The frontend should be built as static assets and served through Nginx.

### Example Dockerfile

```dockerfile
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Example Nginx configuration

```nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff2?)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Example Docker Compose service

```yaml
services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    depends_on:
      - api
```

### Build-time environment note

Vite environment variables are normally resolved during the build.

Do not rely on Docker Compose runtime `environment` values to change an already-built static bundle unless a runtime configuration mechanism is explicitly implemented.

Recommended alternatives:

1. pass variables as Docker build arguments;
2. generate a runtime `config.js` file from an entrypoint script;
3. proxy API requests through Nginx and use a relative `/api` base URL.

For portable deployments, using a relative API path is often preferable:

```bash
VITE_API_BASE_URL=/api/v1
```

### Build marker

Every application shows the commit its bundle was built from, in the footer, via
`AppShell`'s `build` prop. It is deliberately quiet — small, monospace, muted,
`user-select: all` so one click selects the whole SHA for pasting into an issue.
It exists to answer "which version am I looking at" when a deployment
misbehaves.

The SHA is resolved in `vite.config.ts`, in this order:

1. `process.env.GIT_SHA` — supplied as a Docker build argument
2. `git rev-parse --short=7 HEAD` — local development
3. `"unknown"`

The order is forced by the container build: `.dockerignore` excludes `.git`, as
it should, so the image build has no repository to ask. CI passes
`GIT_SHA=${{ github.sha }}` as a `build-arg`, and the `Dockerfile` declares
`ARG GIT_SHA` before `npm run build`.

Note what the fallback does: a build with no SHA available is *unmarked*, not
failed. A missing build number must never be the reason a release cannot be cut.

It is the **application's** commit, not the shared package's. The package's
identity is its version number; the footer answers a question about the
deployed application.

### Package distribution

The shared packages are published to **npmjs.com**, public, rather than to
GitHub Packages. The npm registry on GitHub Packages authenticates every read
and has no anonymous tier even for public packages — ghcr.io is the exception
among GitHub's registries, not the rule. Publishing there would have put a live
credential in every `Dockerfile`, every CI job and on every developer machine,
permanently. On npmjs, `npm ci` needs no configuration anywhere and only the
publish workflow holds a token.

The two packages release in lockstep — `ui-shell` pins an exact `ui-theme`
version — from a single version tag, and `npm run version:set -- <x.y.z>`
rewrites both versions and the pin together. The publish workflow refuses a tag
whose version disagrees with the packages.

---

## 28. Implementation Checklist

### Shared layer

- [ ] `@6g-dali/ui-theme` and `@6g-dali/ui-shell` installed, not reimplemented
- [ ] stylesheet import order per §1.2, application styles last
- [ ] shell is `AppShell`; only the differing props are supplied
- [ ] configuration resolved with `resolveConfig`, reading `__DALI_CONFIG__`
- [ ] shared keys use their shared names from `DaliBaseConfig`
- [ ] footer carries the build marker, wired per §27
- [ ] no local copy of a token, theme rule or shell fragment

### Visual system

- [ ] CSS variables define all colors and surfaces.
- [ ] Typography uses Space Mono, DM Sans, and JetBrains Mono consistently.
- [ ] Accent colors follow semantic roles.
- [ ] Focus states are visible.
- [ ] Live glows are limited to live states.
- [ ] Reduced-motion behavior is implemented.

### Layout

- [ ] Sidebar and top bar are consistent across protected pages.
- [ ] Main content uses the 12-column grid.
- [ ] Cards use consistent radius, border, and spacing.
- [ ] Detail pages follow a stable header and section pattern.
- [ ] Responsive behavior is defined for tablet and mobile.

### Components

- [ ] Status mapping is centralized.
- [ ] Buttons support primary, secondary, ghost, and danger variants.
- [ ] Tables support loading, empty, error, and pagination states.
- [ ] IDs and endpoints are copyable.
- [ ] JSON and logs use a dedicated viewer.
- [ ] Destructive actions use confirmation dialogs.

### Data and state

- [ ] Axios client injects authentication centrally.
- [ ] TanStack Query owns server state.
- [ ] Polling stops for terminal states.
- [ ] Last-updated time is visible for live data.
- [ ] Stale data remains visible after refresh failures.
- [ ] Mutations invalidate the correct queries.

### Quality

- [ ] Core flows are covered by end-to-end tests.
- [ ] Protected routes use authentication and role guards.
- [ ] Heavy modules are lazy-loaded.
- [ ] Accessibility checks are included in development.
- [ ] Secrets are never rendered or stored in the frontend.
- [ ] Docker deployment supports SPA routing.

---

## 29. Final Design Rule

The interface should always prioritize the user's operational questions:

```text
What is happening?
What changed?
Is the system healthy?
What requires attention?
What can I do next?
```

Every page, component, animation, chart, and interaction should make at least one of these questions easier to answer.
