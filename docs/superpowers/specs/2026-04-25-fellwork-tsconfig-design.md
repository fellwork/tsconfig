# `@fellwork/tsconfig` — Design

- **Date:** 2026-04-25
- **Author:** Shane McGuirt (with Claude)
- **Status:** Approved (ready for implementation plan)
- **Repo:** `fellwork/tsconfig`

## Summary

A small, open-source npm package that ships shared TypeScript configurations for every Fellwork project. Four composable presets (`base`, `node`, `browser`, `library`) consumed via an explicit `exports` map. Mirrors `fellwork/scribe`'s toolchain (bun + proto + moon + biome) stripped down to what a JSON-only package needs. Designed to remove the duplicated `tsconfig.base.json` files across `scribe`, `fellwork-ops`, `fellwork-web`, and future repos while centralizing strictness, security, and best-practice defaults.

## Goals

- **Single source of truth** for TS strictness across Fellwork repos.
- **Composable** via TS 5.0+ array `extends` — pick one environment preset, optionally overlay `library`.
- **Minimal surface** — four files, no compile step, raw JSON is the artifact.
- **Correct by default** — `${configDir}` paths (TS 5.5+) so library emit lands in the consumer's directory, not in `node_modules/@fellwork/tsconfig/`.
- **Modern tooling parity** with scribe so contributor onboarding is identical.

## Non-goals

- Lint or format rules (those live in `fellwork/lint`).
- Framework-specific presets (`nuxt`, `react`, `vue`, `svelte`) — covered by composition or YAGNI.
- A `vitest` overlay — vitest types belong in `vitest.config.ts`.
- Pre-compiled output. JSON ships raw.
- Multi-package monorepo (single root-level package; promote to multi-package only if presets diverge in versioning needs).
- Changesets or `release-please`. Manual semver is sufficient for one package.

## Decisions

| # | Question | Decision | Rationale |
|---|---|---|---|
| 1 | Distribution model | **Public npm registry** (`npmjs.com`) | OSS norm; zero `.npmrc` config for consumers; matches sindresorhus/0x80/mintlify pattern. |
| 2 | Package shape | **Single package, root-level** | Minimal nesting; `exports` map covers all presets; promotable to workspace later if needed. |
| 3 | Preset matrix | **`base`, `node`, `browser`, `library`** (4 presets) | Covers all four target audiences via composition; Nuxt covered by its own auto-generated tsconfig + `base` overlay. |
| 4 | Module resolution | **Hybrid** — `base`/`browser` use Bundler, `node` uses NodeNext | Pragmatic for current consumers (all bundler-based today) while keeping NodeNext available as a deliberate, correct opt-in. |
| 5 | Strictness baseline | **Scribe + correctness additions** — adds `noImplicitReturns`, `allowUnreachableCode: false`, `allowUnusedLabels: false` | Type-checker correctness only; unused-symbol rules belong in `fellwork/lint`. |

## Repo layout

```
fellwork/tsconfig/
├── .github/
│   └── workflows/
│       ├── ci.yml               # lint + validate on PR
│       └── publish.yml          # release-triggered npm publish
├── .moon/
│   ├── tasks.yml
│   ├── toolchain.yml
│   └── workspace.yml
├── .prototools                  # bun + node + moon pinned versions
├── .gitignore
├── biome.json
├── bun.lock
├── package.json
├── README.md
├── LICENSE                      # MIT
├── CHANGELOG.md                 # Keep-a-Changelog
├── base.json
├── node.json
├── browser.json
├── library.json
├── docs/
│   ├── usage.md
│   ├── composition.md
│   ├── migration.md
│   └── superpowers/
│       └── specs/
│           └── 2026-04-25-fellwork-tsconfig-design.md
├── fixtures/
│   ├── base/
│   ├── node/
│   ├── browser/
│   └── node-library/
└── scripts/
    └── validate.ts
```

All four preset files live at the repo root so `"@fellwork/tsconfig/library"` resolves to `library.json` with no `dist/` indirection.

## `package.json`

```jsonc
{
  "name": "@fellwork/tsconfig",
  "version": "0.0.0",
  "description": "Shared TypeScript configurations for Fellwork projects.",
  "license": "MIT",
  "type": "module",
  "publishConfig": {
    "access": "public"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/fellwork/tsconfig.git"
  },
  "files": [
    "base.json",
    "node.json",
    "browser.json",
    "library.json",
    "LICENSE",
    "README.md"
  ],
  "exports": {
    ".":         "./base.json",
    "./base":    "./base.json",
    "./node":    "./node.json",
    "./browser": "./browser.json",
    "./library": "./library.json",
    "./package.json": "./package.json"
  },
  "engines": {
    "bun":  ">=1.3.0",
    "node": ">=20.18.0"
  },
  "peerDependencies": {
    "typescript": ">=5.5.0"
  },
  "peerDependenciesMeta": {
    "typescript": { "optional": false }
  },
  "devDependencies": {
    "@biomejs/biome": "^2.4.13",
    "typescript": "^5.6.2"
  },
  "scripts": {
    "lint":      "biome lint .",
    "format":    "biome format --write .",
    "check":     "biome check .",
    "validate":  "bun run scripts/validate.ts",
    "typecheck": "moon run :validate"
  }
}
```

**Notes:**
- `exports` map is explicit; only the four presets + `package.json` are exposed.
- `files` allowlist ships only the four JSON files + LICENSE + README.
- `peerDependencies.typescript >=5.5.0` required for `${configDir}` support.
- `publishConfig.access: "public"` for OSS npm publish.
- No `main` / `types` / `module` — there's no JS to import.

## Preset files

### `base.json`
```jsonc
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "@fellwork/tsconfig/base",
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2023"],

    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,
    "allowUnreachableCode": false,
    "allowUnusedLabels": false,

    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,

    "esModuleInterop": true,
    "resolveJsonModule": true,
    "skipLibCheck": true
  }
}
```

### `node.json`
```jsonc
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "@fellwork/tsconfig/node",
  "extends": "./base.json",
  "compilerOptions": {
    "target": "ES2023",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2023"]
  }
}
```

NodeNext enforces explicit `.js` extensions in imports — correct for true Node ESM. Consumers install `@types/node` themselves; we don't pin `types`.

### `browser.json`
```jsonc
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "@fellwork/tsconfig/browser",
  "extends": "./base.json",
  "compilerOptions": {
    "lib": ["ES2023", "DOM", "DOM.Iterable"]
  }
}
```

### `library.json` (pure overlay — no `extends`)
```jsonc
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "@fellwork/tsconfig/library",
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noEmit": false,
    "outDir": "${configDir}/dist",
    "rootDir": "${configDir}/src",
    "tsBuildInfoFile": "${configDir}/.tsbuildinfo"
  }
}
```

**`library` deliberately does not `extend` `base`.** TS 5.0 array `extends` merges left-to-right; if both `node` and `library` extended `base`, composing `["node", "library"]` would re-process base after node and could clobber NodeNext overrides. Keeping `library` as a pure overlay makes composition unambiguous: env preset is fully resolved first, then `library` adds emission settings only. Consequence: extending `library` alone produces no `target`/`module`/`lib` — README documents that it must be paired with an env preset.

`${configDir}` (TS 5.5+) makes `outDir`, `rootDir`, and the buildinfo file resolve relative to the *consuming* tsconfig file, not this shared package.

## Composition patterns

### Pattern 1 — Backend Node/Bun script (`fellwork-ops`)
```jsonc
{
  "extends": "@fellwork/tsconfig/node",
  "include": ["scripts/**/*.ts"]
}
```

### Pattern 2 — Publishable Node library
```jsonc
{
  "extends": [
    "@fellwork/tsconfig/node",
    "@fellwork/tsconfig/library"
  ],
  "include": ["src/**/*.ts"]
}
```

### Pattern 3 — Publishable browser/isomorphic library (`scribe`)
```jsonc
// scribe/tsconfig.base.json
{
  "extends": [
    "@fellwork/tsconfig/browser",
    "@fellwork/tsconfig/library"
  ]
}

// scribe/tsconfig.json (typecheck-only root)
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": { "noEmit": true },
  "include": ["packages/*/src/**/*.ts", "packages/*/tests/**/*.ts", "tests/**/*.ts"]
}
```

### Pattern 4 — Nuxt frontend (`fellwork-web`)
```jsonc
{
  "extends": [
    "./.nuxt/tsconfig.json",
    "@fellwork/tsconfig/base"
  ]
}
```
Nuxt's generated config supplies Vue/Nuxt-specific `lib`/`types`/`paths`; Fellwork's `base` layers strictness on top. Order matters — Fellwork comes *after* Nuxt so its strictness wins.

### Pattern 5 — Project references in a monorepo
```jsonc
// packages/core/tsconfig.json — leaf
{
  "extends": [
    "@fellwork/tsconfig/browser",
    "@fellwork/tsconfig/library"
  ],
  "include": ["src/**/*.ts"]
}

// tsconfig.json — workspace root
{
  "files": [],
  "references": [
    { "path": "./packages/core" },
    { "path": "./packages/plugin-sdk" }
  ]
}
```
`library`'s `composite: true` makes each leaf a referenceable project. `tsc --build` walks references and uses each leaf's `${configDir}/.tsbuildinfo` for incremental builds — fast cross-package rebuilds and IDE go-to-definition across boundaries.

### Pattern 6 — Test types

Vitest types belong in `vitest.config.ts`; no preset needed.

### Composition rules

1. **Pick exactly one environment preset:** `base` *or* `node` *or* `browser`.
2. **Add `library` only if** you need to emit `.d.ts` / declaration maps / participate in project references.
3. **Order matters** in array `extends`: later entries override earlier ones. Always put `library` *last*.
4. **Don't extend `library` alone** — it has no `target`/`module`/`lib`. Compose it with an env preset.

## Tooling

### `.prototools`
```
bun = "1.3.8"
node = "20.18.0"
moon = "1.30.0"
```

### `.moon/workspace.yml`
```yaml
projects:
  - "."
```

### `.moon/toolchain.yml`
```yaml
node:
  version: "20.18.0"
  packageManager: "bun"
```

### `.moon/tasks.yml`
```yaml
tasks:
  lint:
    command: "biome lint ."
  format:
    command: "biome format --write ."
  check:
    command: "biome check ."
  validate:
    command: "bun run scripts/validate.ts"
    deps: ["check"]
```

### `biome.json`
Copy scribe's verbatim with one tweak — `files.includes` drops `!target` and `!dist` (none here), adds `!fixtures/**/dist`.

### `.gitignore`
```
node_modules/
.moon/cache/
fixtures/**/dist/
fixtures/**/*.tsbuildinfo
```

### Self-validation: `fixtures/` + `scripts/validate.ts`

Each fixture is a tiny TS project that exercises one preset (or composition). `scripts/validate.ts` runs `tsc --noEmit --project fixtures/<name>` against each, exits non-zero on any failure.

```
fixtures/
├── base/
│   ├── tsconfig.json    # extends ../../base.json
│   └── index.ts
├── node/
│   ├── tsconfig.json    # extends ../../node.json
│   └── index.ts
├── browser/
│   ├── tsconfig.json    # extends ../../browser.json
│   └── index.ts         # uses document.querySelector to prove DOM lib resolves
└── node-library/
    ├── tsconfig.json    # extends [../../node.json, ../../library.json]
    └── src/index.ts
```

`node-library` additionally runs `tsc --build` to confirm declaration emission lands in `fixtures/node-library/dist/`, proving `${configDir}` resolves correctly. The fixtures *are* the doc examples, so docs and code can't drift.

```ts
// scripts/validate.ts
import { spawnSync } from 'node:child_process'
import { readdirSync } from 'node:fs'

const fixtures = readdirSync('fixtures', { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name)

let failed = 0
for (const f of fixtures) {
  const result = spawnSync(
    'bun', ['x', 'tsc', '--noEmit', '--project', `fixtures/${f}`],
    { stdio: 'inherit' },
  )
  if (result.status !== 0) failed++
}

process.exit(failed === 0 ? 0 : 1)
```

### CI

- **`.github/workflows/ci.yml`** — triggers on push and PR. Runs `proto install`, `bun install`, `moon run :validate`.
- **`.github/workflows/publish.yml`** — triggers on `release.published`. Runs validate then `bun publish --access public` using `NPM_TOKEN`.

### What's deliberately *not* here

- ❌ `vitest.config.ts` — no runtime code to test
- ❌ `rolldown` / `rolldown-plugin-dts` — nothing to bundle
- ❌ `size-limit` / `.size-limit.json` — JSON files are bytes, not bundles
- ❌ `@types/node`, `jsdom`, `fast-check` — not needed
- ❌ Any `src/` directory — presets ship as raw root JSON

## Documentation

Three layers, kept in sync with fixtures.

### `README.md` (~120 lines)
1. **What it is** — one paragraph.
2. **Install** — `bun add -D -E @fellwork/tsconfig typescript@^5.5`.
3. **Pick a preset** — 4-row table (preset / when to use / what it sets).
4. **Two-minute examples** — four most common patterns, copy-pasteable.
5. **Composition rules** — the 4-rule list.
6. **Links to deeper docs**.

### `docs/usage.md` — preset reference
For each preset:
- Purpose (one sentence).
- What it sets (full `compilerOptions` table with rationale per option).
- What it doesn't set (explicit list).
- When to extend directly vs. compose.
- Common gotchas (`verbatimModuleSyntax` requires explicit `import type`; `NodeNext` requires `.js` extensions).

### `docs/composition.md` — patterns reference
- All six patterns from this spec, each with full tsconfig + "why this combo."
- Anti-patterns (extending `library` alone, wrong order, mixing styles).
- Project references walk-through with two leaf packages and root orchestrator.
- Combining with framework-generated tsconfigs (Nuxt, generalized).

### `docs/migration.md` — per-repo recipes
A section per existing Fellwork consumer. Each has:
- **Before** — current tsconfig snippet.
- **After** — new version using `@fellwork/tsconfig`.
- **Why** — what improved.
- **Caveats** — required consumer code changes (e.g., adopting `node` preset means writing explicit `.js` extensions).

Recipes for: `scribe`, `fellwork-ops`, `fellwork-web` (Nuxt), `foreman` (rush). Skipping `fellwork-api` (mostly Rust).

### Inline JSON comments
Each preset file gets a comment header explaining its purpose and pointing to `docs/usage.md`.

## Release flow

- **Semver, manually managed.** No changesets.
- **Start at `0.1.0`** for first publish; stay on `0.x` while consumers migrate; promote to `1.0.0` once API has settled.
- **Release steps:**
  1. Update `CHANGELOG.md` (Keep-a-Changelog).
  2. Bump `package.json` version, commit (`chore: release v0.x.y`).
  3. `git tag v0.x.y && git push --tags`.
  4. Create GitHub Release from tag → `publish.yml` fires → validates → publishes.
- **Pin in consumers with `-E`** (exact) so each repo bumps deliberately.
- **Breaking changes within `0.x`** are minor bumps with `Changed` entries in `CHANGELOG.md`.

## Scribe migration sequencing

Order matters; each step is independently verifiable.

1. Land `@fellwork/tsconfig@0.1.0` to npm.
2. `bun add -D -E @fellwork/tsconfig` in scribe.
3. Replace `scribe/tsconfig.base.json` (currently 22 lines) with:
   ```jsonc
   { "extends": ["@fellwork/tsconfig/browser", "@fellwork/tsconfig/library"] }
   ```
4. Run `moon run :typecheck` — should pass since new presets are a strict superset of scribe's current settings (only the three Q5 additions: `noImplicitReturns`, `allowUnreachableCode: false`, `allowUnusedLabels: false`). Fix any code these flags surface.
5. Run `moon run :build` (rolldown) — `target` and `module` are unchanged, so emit should be functionally equivalent. The `lib` bumps from ES2022 to ES2023, which only matters if scribe's source uses new ES2023 types; if so, those would have been compile errors before and won't change runtime output.
6. Run `bun run size` — `.size-limit.json` numbers shouldn't change.
7. Land scribe migration as a single PR titled `chore: adopt @fellwork/tsconfig`.

After scribe lands, repeat the migration recipe pattern in `docs/migration.md` for `fellwork-ops` (extends `node`) and `fellwork-web` (Nuxt composition).

## Failure modes & rollback

- **`bun publish` fails on CI** — GitHub Release stays; re-run workflow after fix. Publish is atomic.
- **Consumer typecheck breaks after upgrade** — pin back to previous patch (`-E` flag means exact version is recorded). File issue against this repo.
- **`${configDir}` doesn't resolve** (very old TS slips through `peerDependencies`) — `validate.ts` smoke tests catch this in CI; fix is bumping consumer's `typescript` to `>=5.5`.

## Out of scope (deliberate YAGNI)

- ❌ `nuxt` preset — Nuxt's auto-generated tsconfig + `base` composition covers it.
- ❌ `vitest` preset — vitest types belong in `vitest.config.ts`.
- ❌ `react` / `vue` / `svelte` presets — no current consumer.
- ❌ Per-stack publishable packages (`@fellwork/tsconfig-base`, `-node`, etc.) — single package + exports map is enough.
- ❌ Changesets / `release-please` — manual semver fine for one package.
- ❌ Lint/format rules — those live in `fellwork/lint`.
- ❌ Pre-compiling JSON to JS — raw JSON is the artifact.
- ❌ Per-runtime presets beyond Node/browser (Workers, Deno, Edge) — none in use today.

## References

- Sindre Sorhus's tsconfig: <https://github.com/sindresorhus/tsconfig>
- 0x80/typescript-config: <https://github.com/0x80/typescript-config>
- Mintlify Rifandani be-monorepo TS config guide: <https://www.mintlify.com/rifandani/be-monorepo/concepts/typescript-config>
- TypeScript 5.5 `${configDir}`: <https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html#the-configdir-template-variable-for-configuration-files>
- TypeScript 5.0 array `extends`: <https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#supporting-multiple-configuration-files-in-extends>
