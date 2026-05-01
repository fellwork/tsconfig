# @fellwork/tsconfig

Shared TypeScript configurations for Fellwork projects. Four small,
composable presets (`base`, `node`, `browser`, `library`) centralizing
strictness, security, and best-practice defaults across every Fellwork repo.

## Commands

```bash
proto use            # Install pinned tool versions
bun install          # Install dev deps
bun run test         # Fixture tests (verifies preset extension graph)
```

## Stack

- **TypeScript 5.5+** required peer dep (for `${configDir}` template variable support)
- Published as `@fellwork/tsconfig` to npm public registry
- Releases via `release-please` (see `release-please-config.json`)

## Presets

| Preset | Use for |
|---|---|
| `base` | Generic TS, no environment assumptions |
| `node` | Bun/Node backend code, CLIs |
| `browser` | Frontend apps, isomorphic libs |
| `library` | Anything published to npm (overlay only — extends a base) |

## Conventions

- Every preset change needs a fixture diff under `fixtures/`.
- Bare `extends: "@fellwork/tsconfig"` resolves to `base` — prefer the explicit `@fellwork/tsconfig/base` to make intent obvious.
- Strictness is non-negotiable. Don't loosen flags in the presets to fix consumer build errors — fix the consumer.

## gstack

AI dev tooling — headless browser, QA, design review, deploy workflows.

**Install (one-time per machine):**
```bash
git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack && cd ~/.claude/skills/gstack && ./setup
```

Use `/browse` for all web browsing. Never use `mcp__claude-in-chrome__*` tools directly.

Available skills:
`/office-hours`, `/plan-ceo-review`, `/plan-eng-review`, `/plan-design-review`, `/design-consultation`, `/design-shotgun`, `/design-html`, `/review`, `/ship`, `/land-and-deploy`, `/canary`, `/benchmark`, `/browse`, `/connect-chrome`, `/qa`, `/qa-only`, `/design-review`, `/setup-browser-cookies`, `/setup-deploy`, `/setup-gbrain`, `/retro`, `/investigate`, `/document-release`, `/codex`, `/cso`, `/autoplan`, `/plan-devex-review`, `/devex-review`, `/careful`, `/freeze`, `/guard`, `/unfreeze`, `/gstack-upgrade`, `/learn`

## Agent-Specific Notes

This repository includes a compiled documentation database/knowledgebase at `AGENTS.db`.
For context for any task, you MUST use MCP `agents_search` to look up context including architectural, API, and historical changes.
Treat `AGENTS.db` layers as immutable; avoid in-place mutation utilities unless required by the design.
