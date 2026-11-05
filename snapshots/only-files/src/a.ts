// A type literal and an object literal's properties, after some locals.
export function sum(): number {
  const x = 1
  const y = 2
  return x + y
}

export type Options = { mode: string; level: number }

export const defaults = { mode: 'fast', level: 1 }
