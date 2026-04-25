export const greet = (name: string): string => `Hello, ${name}!`

const items: readonly number[] = [1, 2, 3]
const first: number | undefined = items[0]

export { first }

export type Greeting = ReturnType<typeof greet>
