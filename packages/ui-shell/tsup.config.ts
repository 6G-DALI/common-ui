import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  // ESM only: both consumers are Vite apps on "type": "module". A CJS build
  // would have to be maintained without anything exercising it.
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'es2020',
  // Everything the host app already has stays external, so the consumer ends up
  // with one React, one react-icons and one Keycloak adapter. The theme is
  // external too, which leaves `import '@6g-dali/ui-theme/shell.css'` in the
  // output for the consumer's bundler to resolve.
  external: ['react', 'react-dom', 'react-icons', 'keycloak-js', /^@6g-dali\//],
})
