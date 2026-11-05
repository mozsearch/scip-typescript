import { defaults, Options } from './a'

export function describe(options: Options): string {
  const label = options.mode
  return `${label} ${defaults.level}`
}
