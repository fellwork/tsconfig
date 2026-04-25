# @fellwork/tsconfig

Shared TypeScript configurations for Fellwork projects.

Four small, composable presets that centralize strictness, security, and best-practice defaults across every Fellwork repo. Built on TS 5.5+ with `${configDir}` template-variable support so library emit lands in the consuming package, not in `node_modules`.

## Install

```bash
bun add -D -E @fellwork/tsconfig typescript@^5.5
```

`typescript >=5.5.0` is a required peer dependency (for `${configDir}` template variable support).

## Pick a preset

| Preset | When to use | What it sets |
|---|---|---|
| [`base`](./base.json) | Generic TS, no environment assumptions | Strict + correctness flags, ES2022 target, ESNext/Bundler resolution, ES2023 lib (no DOM, no Node) |
| [`node`](./node.json) | Bun/Node backend code, CLIs | extends `base`, switches to `NodeNext`/`NodeNext`, target ES2023 |
| [`browser`](./browser.json) | Frontend apps, isomorphic libs | extends `base`, adds `DOM` + `DOM.Iterable` libs |
| [`library`](./library.json) | Anything you publish to npm (overlay only) | `composite`, `declaration`, `declarationMap`, `sourceMap`, `${configDir}/dist` outDir |

`extends: "@fellwork/tsconfig"` (bare, without a subpath) silently resolves to `base` — prefer `@fellwork/tsconfig/base` to make the intent explicit.

## Quick examples

### Backend Node/Bun script

```jsonc
// tsconfig.json
{
  "extends": "@fellwork/tsconfig/node",
  "include": ["scripts/**/*.ts"]
}
```

### Publishable Node library

```jsonc
{
  "extends": [
    "@fellwork/tsconfig/node",
    "@fellwork/tsconfig/library"
  ],
  "include": ["src/**/*.ts"]
}
```

### Publishable browser/isomorphic library

```jsonc
{
  "extends": [
    "@fellwork/tsconfig/browser",
    "@fellwork/tsconfig/library"
  ],
  "include": ["src/**/*.ts"]
}
```

### Nuxt frontend

```jsonc
{
  "extends": [
    "./.nuxt/tsconfig.json",
    "@fellwork/tsconfig/base"
  ]
}
```

Order matters — Fellwork's strictness comes *after* Nuxt so it wins.

## Composition rules

1. **Pick exactly one environment preset** — `base`, `node`, *or* `browser`.
2. **Add `library` only if** you need to emit `.d.ts` / declaration maps / participate in project references.
3. **Order matters** in array `extends`: later entries override earlier ones. Always put `library` *last*.
4. **Don't extend `library` alone** — it has no `target`/`module`/`lib`. Compose it with an env preset.

## Documentation

- [docs/usage.md](./docs/usage.md) — full preset reference (every option, why we set it)
- [docs/composition.md](./docs/composition.md) — composition patterns and anti-patterns
- [docs/migration.md](./docs/migration.md) — recipes for migrating existing Fellwork repos
- [docs/superpowers/specs/2026-04-25-fellwork-tsconfig-design.md](./docs/superpowers/specs/2026-04-25-fellwork-tsconfig-design.md) — design doc

## License

MIT © Shane McGuirt
