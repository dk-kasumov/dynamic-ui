/**
 * Registry of component definitions. The studio's component catalog —
 * a typed map with validation on insert. Validation of a node against a
 * definition, custom-relation handlers, and UI grouping live elsewhere.
 */

import type { AnyComponentDefinition } from './component'

export class RegistryError extends Error {
  override readonly name = 'RegistryError'
}

export class Registry implements Iterable<AnyComponentDefinition> {
  readonly #components = new Map<string, AnyComponentDefinition>()

  get size() {
    return this.#components.size
  }

  register(def: AnyComponentDefinition) {
    if (typeof def.name !== 'string' || def.name.length === 0) {
      throw new RegistryError(`Component name must be a non-empty string, got ${JSON.stringify(def.name)}`)
    }
    if (this.#components.has(def.name)) {
      throw new RegistryError(`Component "${def.name}" is already registered`)
    }
    this.#components.set(def.name, def)
  }

  registerAll(defs: Iterable<AnyComponentDefinition>) {
    for (const def of defs) this.register(def)
  }

  unregister(name: string) {
    return this.#components.delete(name)
  }

  has(name: string) {
    return this.#components.has(name)
  }

  get(name: string) {
    return this.#components.get(name)
  }

  /** Like {@link get} but throws when missing. Use when absence indicates a bug. */
  require(name: string): AnyComponentDefinition {
    const def = this.#components.get(name)
    if (!def) throw new RegistryError(`Component "${name}" is not registered`)
    return def
  }

  getAll() {
    return Array.from(this.#components.values())
  }

  getNames() {
    return Array.from(this.#components.keys())
  }

  clear() {
    this.#components.clear()
  }

  [Symbol.iterator]() {
    return this.#components.values()
  }
}
