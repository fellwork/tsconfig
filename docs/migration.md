# Migration recipes

Per-repo recipes for migrating existing Fellwork projects to `@fellwork/tsconfig`. Order is roughly safest-first.

## scribe (`fellwork/scribe`)

**Before** (`scribe/tsconfig.base.json`, 22 lines):

```jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "verbatimModuleSyntax": true
  }
}
```

**After:**

```jsonc
{
  "extends": [
    "@fellwork/tsconfig/browser",
    "@fellwork/tsconfig/library"
  ]
}
```

**Why:** scribe is a publishable browser/isomorphic library. `browser` covers the strictness + DOM lib + bundler resolution; `library` adds `composite`/`declaration`/`declarationMap`/`sourceMap` and the `${configDir}` paths.

**Caveats:**
- `lib` bumps from `ES2022` → `ES2023`. Adds new types like `Array.prototype.findLast`. Existing source isn't affected unless it monkey-patches those names.
- Three new strictness flags activate: `noImplicitReturns`, `allowUnreachableCode: false`, `allowUnusedLabels: false`. May surface real bugs — fix them, don't suppress.

**Steps:**
1. `cd c:/git/fellwork/scribe`
2. `bun add -D -E @fellwork/tsconfig`
3. Replace `tsconfig.base.json` with the four-line version above.
4. `moon run :typecheck` — fix any new errors.
5. `moon run :build` — verify output is functionally equivalent.
6. `bun run size` — verify bundle sizes are unchanged.
7. Commit as a single PR titled `chore: adopt @fellwork/tsconfig`.

---

## fellwork-ops (`fellwork/fellwork-ops`)

**Before:** (varies — `fellwork-ops` has lots of standalone bun scripts; check `tsconfig.json` if present)

**After:**

```jsonc
{
  "extends": "@fellwork/tsconfig/node",
  "include": ["scripts/**/*.ts"]
}
```

**Why:** fellwork-ops runs scripts under bun (Node-style execution). The `node` preset gives NodeNext correctness for any code path that ever needs to leave bun for plain Node.

**Caveats:**
- NodeNext requires `.js` extensions on relative imports. Audit `scripts/` for bare imports and append `.js`.
- If any script imports from a `node_modules` package, no change is needed (only relative imports require the extension).
- If you don't want NodeNext today, extend `@fellwork/tsconfig/base` instead — keeps Bundler resolution.

**Steps:**
1. `cd c:/git/fellwork/fellwork-ops`
2. `bun add -D -E @fellwork/tsconfig`
3. Create or replace `tsconfig.json` with the version above.
4. `bun x tsc --noEmit` — fix `.js`-extension errors.
5. Smoke-test a couple of scripts: `bun run scripts/setup.ts --help`, etc.
6. Commit.

---

## fellwork-web (`fellwork/fellwork-web`)

**Before:** (Nuxt 4 generates its own `./.nuxt/tsconfig.json`; the app's `tsconfig.json` typically extends it.)

**After** (`apps/web/tsconfig.json`):

```jsonc
{
  "extends": [
    "./.nuxt/tsconfig.json",
    "@fellwork/tsconfig/base"
  ]
}
```

**Why:** Nuxt's generated config has all the Vue/Nuxt-specific wiring (paths, lib, types, JSX). Layering Fellwork's `base` after it adds the org-wide strictness without disturbing Nuxt internals.

**Caveats:**
- Nuxt regenerates `.nuxt/tsconfig.json` on `nuxt prepare`. The relative path stays valid as long as `tsconfig.json` lives at the same level as `.nuxt/`.
- For per-package tsconfigs under `packages/*/tsconfig.json`, choose `@fellwork/tsconfig/browser` (DOM lib) or `@fellwork/tsconfig/base` (no DOM) plus `library` if publishable.

**Steps:**
1. `cd c:/git/fellwork/fellwork-web`
2. `bun add -D -E @fellwork/tsconfig` (workspace root).
3. Update `apps/web/tsconfig.json` to the version above.
4. `bun run --cwd apps/web typecheck`.
5. Sweep `packages/*/tsconfig.json` and update each to compose `[browser, library]` or `[base, library]` as appropriate.
6. Commit.

---

## foreman (`fellwork/foreman`)

`foreman` already has a homegrown `conventions/typescript/tsconfig.json` (Rush convention). Migration here is optional and lower priority — if the existing convention works, leave it. Adopt `@fellwork/tsconfig` only if/when you want strictness parity with the rest of the org.

If migrating: replace `conventions/typescript/tsconfig.json` with the appropriate composition (most likely `[node, library]` for the libraries under `libraries/*`).

---

## fellwork-api (`fellwork/fellwork-api`)

`fellwork-api` is mostly Rust. The TS surface area is small (Supabase functions and a few parsers). Migration is low-priority. If/when migrating: use `@fellwork/tsconfig/node` for Supabase Edge functions and any Bun/Node helper scripts.
