# Composition patterns

The four presets are designed to compose. TS 5.0+ supports `extends: ["a", "b"]` as an array, with later entries overriding earlier ones. This page lists the canonical patterns.

## The four rules

1. **Pick exactly one environment preset** — `base`, `node`, *or* `browser`.
2. **Add `library` only if** you need declaration emission or project references.
3. **Order matters in array extends** — later wins. Always put `library` *last*.
4. **Don't extend `library` alone** — it has no env settings.

## Pattern 1 — Backend Node/Bun script

```jsonc
{
  "extends": "@fellwork/tsconfig/node",
  "include": ["scripts/**/*.ts"]
}
```

When to use: anything you `bun run` or `node --experimental-strip-types` directly. Examples: `fellwork-ops` setup scripts, one-off CLIs, Lambda handlers.

## Pattern 2 — Publishable Node library

```jsonc
{
  "extends": [
    "@fellwork/tsconfig/node",
    "@fellwork/tsconfig/library"
  ],
  "include": ["src/**/*.ts"]
}
```

Build with `tsc --build`; consumers get clean `.d.ts` + source maps.

## Pattern 3 — Publishable browser/isomorphic library

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
  "include": [
    "packages/*/src/**/*.ts",
    "packages/*/tests/**/*.ts",
    "tests/**/*.ts"
  ]
}
```

The split lets the root tsconfig disable emit (used by IDE typecheck and `vitest`) while individual package tsconfigs that extend `tsconfig.base.json` keep emit on.

## Pattern 4 — Nuxt frontend

```jsonc
{
  "extends": [
    "./.nuxt/tsconfig.json",
    "@fellwork/tsconfig/base"
  ]
}
```

Nuxt auto-generates `./.nuxt/tsconfig.json` with Vue/Nuxt-specific lib, types, and paths. Layering `@fellwork/tsconfig/base` *after* it overrides the strictness without touching Nuxt's framework wiring.

The same pattern works for any framework that generates a tsconfig (SvelteKit's `./.svelte-kit/tsconfig.json`, Astro's `./.astro/tsconfig.json`, etc.).

## Pattern 5 — Project references in a monorepo

```jsonc
// packages/core/tsconfig.json — leaf
{
  "extends": [
    "@fellwork/tsconfig/browser",
    "@fellwork/tsconfig/library"
  ],
  "include": ["src/**/*.ts"]
}

// packages/plugin-sdk/tsconfig.json — another leaf, depends on core
{
  "extends": [
    "@fellwork/tsconfig/browser",
    "@fellwork/tsconfig/library"
  ],
  "include": ["src/**/*.ts"],
  "references": [
    { "path": "../core" }
  ]
}

// tsconfig.json — workspace root (build orchestrator)
{
  "files": [],
  "references": [
    { "path": "./packages/core" },
    { "path": "./packages/plugin-sdk" }
  ]
}
```

Run `tsc --build` at the root: TypeScript walks references, builds dependencies first, and uses each leaf's `${configDir}/.tsbuildinfo` for incremental rebuilds. Editors get cross-package go-to-definition.

## Pattern 6 — Test types

Vitest types belong in `vitest.config.ts`, not in tsconfig:

```ts
/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
  },
})
```

No preset overlay needed.

## Anti-patterns

### ❌ Extending `library` alone

```jsonc
{ "extends": "@fellwork/tsconfig/library" }
```

`library` has no `target`/`module`/`lib`. Result: TS uses *its* defaults (`target: ES3`, `module: CommonJS`, no lib) — almost certainly not what you want.

### ❌ Wrong order in array extends

```jsonc
{
  "extends": [
    "@fellwork/tsconfig/library",
    "@fellwork/tsconfig/node"
  ]
}
```

`node` overlays after `library`, so `library`'s `${configDir}/dist` outDir survives — but anything `library` would have layered on top of `node` is lost. Always put environment first, `library` last.

### ❌ Mixing single-string and array extends styles

```jsonc
{
  "extends": "@fellwork/tsconfig/node",
  // Then trying to layer library somehow… you can't, without rewriting as array.
}
```

If you need composition, use array form from the start: `"extends": ["...", "..."]`.

### ❌ Forgetting `.js` extensions under `node` preset

```ts
// ❌ NodeNext rejects this
import { helper } from './util'

// ✅ correct
import { helper } from './util.js'
```

The `.js` extension is the *runtime* path, even when source is `util.ts`. NodeNext is strict about this.

### ❌ Using `browser` for SSR

```jsonc
// SSR Node service
{ "extends": "@fellwork/tsconfig/browser" }
```

`browser` types `document`/`window` as available, but at runtime they're `undefined` in Node. Use `base` (or compose with isomorphic guards) for SSR.
