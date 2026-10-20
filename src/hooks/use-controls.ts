import type * as Leva from 'leva'

let leva: typeof Leva | undefined

/** Loads leva, in debug only: it stays out of the main bundle */
export async function loadLeva() {
  leva = await import('leva')
}

type Schema = Record<string, unknown>

// Cached per folder: stable values across renders, as leva's
const defaults = new Map<string, Record<string, unknown>>()

const getDefaults = (name: string, schema: Schema) => {
  if (!defaults.has(name)) {
    const values = Object.entries(schema).map(([key, input]) => [
      key,
      input && typeof input === 'object' && 'value' in input ? input.value : input,
    ])
    defaults.set(name, Object.fromEntries(values))
  }
  return defaults.get(name)!
}

/**
 * leva's `useControls` once loaded (see loadLeva), otherwise the default values of the schema.
 * Decided at startup and never changed, so hooks are always called in the same order.
 * Only the `useControls(name, schema, settings?)` form is supported
 */
export const useControls = ((name: string, schema: Schema, settings?: unknown) =>
  leva
    ? (leva.useControls as (...args: unknown[]) => unknown)(name, schema, settings)
    : getDefaults(name, schema)) as typeof Leva.useControls
