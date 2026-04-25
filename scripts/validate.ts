import { spawnSync } from 'node:child_process'
import { readdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'

const FIXTURES_DIR = join(import.meta.dir, '..', 'fixtures')

function listFixtures(): string[] {
  return readdirSync(FIXTURES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
}

function cleanArtifacts(fixture: string): void {
  const dist = join(FIXTURES_DIR, fixture, 'dist')
  rmSync(dist, { recursive: true, force: true })
  const buildInfo = join(FIXTURES_DIR, fixture, '.tsbuildinfo')
  rmSync(buildInfo, { force: true })
}

function run(fixture: string): boolean {
  cleanArtifacts(fixture)
  const project = join(FIXTURES_DIR, fixture)
  const isLibrary = fixture.endsWith('-library')
  const args = isLibrary
    ? ['x', 'tsc', '--build', project]
    : ['x', 'tsc', '--noEmit', '--project', project]
  const result = spawnSync('bun', args, { stdio: 'inherit' })
  if (result.error) {
    console.error(`  spawn error for ${fixture}:`, result.error.message)
    return false
  }
  return result.status === 0
}

const fixtures = listFixtures()
if (fixtures.length === 0) {
  console.error('No fixtures found.')
  process.exit(1)
}

let failed = 0
for (const fixture of fixtures) {
  console.log(`\n→ validating ${fixture}`)
  if (!run(fixture)) failed++
}

if (failed > 0) {
  console.error(`\n${failed}/${fixtures.length} fixture(s) failed.`)
  process.exit(1)
}
console.log(`\nAll ${fixtures.length} fixture(s) passed.`)
