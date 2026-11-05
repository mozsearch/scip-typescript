import { defaults, Options } from './a'

const overrides = { mode: 'slow' }

export function level(options: Options): number {
  const first = 1
  const second = 2
  const third = options.level
  return first + second + third + defaults.level
}

export const mode = `${defaults.mode} ${overrides.mode}`
