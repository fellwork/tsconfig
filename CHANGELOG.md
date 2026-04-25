# Changelog

All notable changes to `@fellwork/tsconfig` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-04-25

### Added
- Initial four-preset matrix: `base`, `node`, `browser`, `library`.
- TS 5.5+ `${configDir}` template variables in `library` preset for consumer-relative `outDir` / `rootDir` / `tsBuildInfoFile`.
- `base` includes scribe's prior strictness set plus `noImplicitReturns`, `allowUnreachableCode: false`, `allowUnusedLabels: false`.
- `node` overrides `module`/`moduleResolution` to `NodeNext` for true Node ESM correctness.
- `browser` adds `DOM` and `DOM.Iterable` libs.
- `library` is a pure overlay (no `extends`) for publishable packages with `composite`, `declaration`, `declarationMap`, `sourceMap`.
- Self-validation via `fixtures/` + `scripts/validate.ts`.
- Documentation: README, `docs/usage.md`, `docs/composition.md`, `docs/migration.md`.

[Unreleased]: https://github.com/fellwork/tsconfig/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/fellwork/tsconfig/releases/tag/v0.1.0
