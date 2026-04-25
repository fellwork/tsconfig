import { readFile } from 'node:fs/promises'

export async function loadJson(path: string): Promise<unknown> {
  const buf = await readFile(path, 'utf8')
  return JSON.parse(buf)
}

export function lastEven(numbers: readonly number[]): number | undefined {
  return numbers.findLast((n) => n % 2 === 0)
}
