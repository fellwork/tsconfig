# Preset reference

## `@fellwork/tsconfig/base`

**Purpose:** Foundation preset — strictness + correctness defaults that every Fellwork project should share.

**Sets:**

| Option | Value | Why |
|---|---|---|
| `target` | `"ES2022"` | Widely supported by modern engines (Node 18+, evergreen browsers). Generates clean modern output. |
| `module` | `"ESNext"` | Lets the consuming bundler decide module format. |
| `moduleResolution` | `"Bundler"` | Matches how scribe (rolldown), fellwork-web (Nuxt/Vite), and fellwork-ops (bun) actually resolve modules. |
| `lib` | `["ES2023"]` | Newest stable lib. No DOM, no Node — environment presets layer those on. |
| `strict` | `true` | All `strict*` flags. |
| `noUncheckedIndexedAccess` | `true` | `arr[0]` is `T \| undefined`. Catches off-by-ones. |
| `exactOptionalPropertyTypes` | `true` | `{ x?: number }` does not allow `{ x: undefined }`. |
| `noImplicitOverride` | `true` | Inherited methods must use `override`. |
| `noFallthroughCasesInSwitch` | `true` | Switch cases must `break`/`return`/`throw`. |
| `noImplicitReturns` | `true` | Every code path returns explicitly. |
| `allowUnreachableCode` | `false` | Dead code is a type error. |
| `allowUnusedLabels` | `false` | Stray labels are an error. |
| `forceConsistentCasingInFileNames` | `true` | Prevents Linux/macOS portability bugs. |
| `isolatedModules` | `true` | Each file must be transpilable in isolation (required by bundlers and ts-blank-space). |
| `verbatimModuleSyntax` | `true` | Forces explicit `import type` and bans CommonJS-isms. |
| `esModuleInterop` | `true` | Allows `import foo from 'cjs'` for legacy deps. |
| `resolveJsonModule` | `true` | Lets you `import x from './x.json'`. |
| `skipLibCheck` | `true` | Skips type-checking of `node_modules` declarations — much faster builds, marginal correctness loss. |

**Doesn't set:** `noEmit`, `outDir`, `rootDir`, `composite`, `declaration` (those belong to `library` overlay or the consumer).

**When to extend directly:** ad-hoc TS projects with no environment assumptions, OR as a strictness-only layer on top of a framework-generated tsconfig (Nuxt pattern).

**Common gotchas:**

- `verbatimModuleSyntax: true` requires `import type { X } from '...'` for type-only imports — not just `import { X }`.
- `isolatedModules: true` bans `const enum` and `namespace` value re-exports.
- `noUncheckedIndexedAccess: true` makes array access `T | undefined`. Use the new `Array.prototype.at()` or destructure with defaults.

---

## `@fellwork/tsconfig/node`

**Purpose:** Bun/Node backend correctness. Switches resolution to NodeNext for true Node ESM semantics.

**Extends:** `./base.json`

**Overrides:**

| Option | Value | Why |
|---|---|---|
| `target` | `"ES2023"` | Node 20+ supports ES2023 natively — no transpile cost. |
| `module` | `"NodeNext"` | Honors `package.json` `"type"` and conditional exports. |
| `moduleResolution` | `"NodeNext"` | Required for NodeNext module mode. Enforces explicit `.js` extensions in relative imports. |
| `lib` | `["ES2023"]` | Same as base, kept explicit for clarity. |

**Doesn't set:** `types`. Consumers install `@types/node` themselves and TS auto-includes it.

**Common gotchas:**

- **NodeNext requires `.js` extensions on relative imports**: `import { x } from './util.js'` (not `'./util'`). The `.js` is correct even if your source is `util.ts` — it's the *runtime* path.
- If you need to use bare imports without extensions, you're using a bundler — switch to `base` or `browser` instead.
- `package.json` must have `"type": "module"` for true ESM, or `.mts` extensions, otherwise NodeNext treats files as CommonJS.

---

## `@fellwork/tsconfig/browser`

**Purpose:** Frontend / isomorphic code that depends on browser globals.

**Extends:** `./base.json`

**Overrides:**

| Option | Value | Why |
|---|---|---|
| `lib` | `["ES2023", "DOM", "DOM.Iterable"]` | Adds `document`, `window`, `Element`, etc. `DOM.Iterable` enables `for…of` over `NodeList` and `HTMLCollection`. |

**Doesn't set:** anything else — Bundler resolution and ESNext module from base carry over.

**When to extend directly:** Browser-only apps without a framework that auto-generates a tsconfig (most Vite/Astro setups).

**Common gotchas:**

- Don't use this preset for SSR/Node code — `document` would be available at type-level but undefined at runtime.
- For isomorphic libs: pair with `library` and write code defensively (`typeof document !== 'undefined'` guards).

---

## `@fellwork/tsconfig/library`

**Purpose:** Pure overlay that adds emission settings for publishable packages. Designed to compose **after** an environment preset.

**Extends:** *nothing* — this is intentional. See spec for why.

**Sets:**

| Option | Value | Why |
|---|---|---|
| `composite` | `true` | Marks the project as referenceable from another `tsconfig.json` `references` array. Required for monorepo project references. |
| `declaration` | `true` | Emits `.d.ts` files for consumers. |
| `declarationMap` | `true` | Emits `.d.ts.map` so editors can jump from `.d.ts` to source. |
| `sourceMap` | `true` | Emits `.js.map` for runtime debugging. |
| `noEmit` | `false` | Explicitly enables emit (in case a parent tsconfig set `noEmit: true`). |
| `outDir` | `"${configDir}/dist"` | Build output goes to the *consuming* package's `dist/`, thanks to TS 5.5+ `${configDir}`. |
| `rootDir` | `"${configDir}/src"` | Source lives in the *consuming* package's `src/`. |
| `tsBuildInfoFile` | `"${configDir}/.tsbuildinfo"` | Incremental build metadata in the *consuming* package's directory. |

**Doesn't set:** `target`, `module`, `lib`, `moduleResolution`, or any strictness — those come from the env preset you compose with.

**Composition is required.** Standalone, this preset has no way to typecheck anything.

```jsonc
// ❌ DON'T — no env preset
{ "extends": "@fellwork/tsconfig/library" }

// ✅ DO — compose with an env preset (env first, library last)
{ "extends": ["@fellwork/tsconfig/node", "@fellwork/tsconfig/library"] }
```

**Common gotchas:**

- If `${configDir}` doesn't seem to resolve (e.g., output ends up under `node_modules/`), check `bun x tsc --version` — must be ≥5.5.
- Project references (`composite: true`) require the leaf project's `tsconfig.json` to specify `include` (not just rely on defaults).
- `composite: true` forces `declaration: true` and disables `noImplicitAny: false` — those are already correct here.
