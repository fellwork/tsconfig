export const VERSION = '0.0.0' as const

export const greet = (name: string): string => `Hello, ${name}!`

export type Greeting = ReturnType<typeof greet>
