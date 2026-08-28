/**
 * Sets every package in this repo to one version.
 *
 *   npm run version:set -- 0.1.2
 *
 * The two packages release in lockstep — @6g-dali/ui-shell depends on an exact
 * @6g-dali/ui-theme version — so a bump has to touch three places: both
 * package.json versions and that dependency pin. Doing it by hand is how v0.1.1
 * ended up tagged while the packages still said 0.1.0, which the publish
 * workflow's version guard rejects.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const repoRoot = fileURLToPath(new URL('..', import.meta.url))
const version = process.argv[2]

if (!/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/.test(version ?? '')) {
  console.error('usage: npm run version:set -- <x.y.z>')
  process.exit(1)
}

const targets = ['package.json', 'packages/ui-theme/package.json', 'packages/ui-shell/package.json']

for (const target of targets) {
  const path = `${repoRoot}${target}`
  const pkg = JSON.parse(readFileSync(path, 'utf8'))
  pkg.version = version

  // Keep the lockstep pin in step with the version being set.
  if (pkg.dependencies?.['@6g-dali/ui-theme']) {
    pkg.dependencies['@6g-dali/ui-theme'] = version
  }

  writeFileSync(path, `${JSON.stringify(pkg, null, 2)}\n`)
  console.log(`${target} -> ${version}`)
}

console.log('\nNext: npm install --package-lock-only && git commit -am "v%s" && git tag v%s', version, version)
