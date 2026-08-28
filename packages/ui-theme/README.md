# @6g-dali/ui-theme

The CSS half of the shared 6G-DALI front-end layer — design tokens, the theme
built on them, the utility classes, and the app-shell styling. Deliberately free
of any framework dependency, so a Vue or plain-HTML front end (the piveau
catalogue, for one) can adopt the look without adopting React.

## Install

```
npm i @6g-dali/ui-theme
```

Needs an `.npmrc` pointing the scope at GitHub Packages — see the repository
root README.

## Use

```ts
import 'bootstrap/dist/css/bootstrap.min.css'
import 'admin-lte/dist/css/adminlte.min.css'
import 'admin-lte/dist/js/adminlte.min.js'
import '@6g-dali/ui-theme/fonts.css'
import '@6g-dali/ui-theme'
import './index.css'   // your app's own styles, last
```

Order matters. The theme is written to override Bootstrap and AdminLTE, so it
must come after them; your app's styles come after the theme.

## Entry points

| Import | Contents |
| --- | --- |
| `@6g-dali/ui-theme` (or `/index.css`) | tokens + animations + theme + ui + base, in dependency order |
| `@6g-dali/ui-theme/fonts.css` | the self-hosted `@fontsource` faces (§5.1) |
| `@6g-dali/ui-theme/shell.css` | app-shell styling; imported for you by `@6g-dali/ui-shell` |
| `/tokens.css`, `/theme.css`, `/ui.css`, `/animations.css`, `/base.css` | the individual layers, for a consumer that wants only some |

`fonts.css` is separate so a front end that already self-hosts these faces does
not ship a second copy. `shell.css` is separate so an app that does not use the
React shell is not paying for it.
