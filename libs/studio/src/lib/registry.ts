/**
 * Component catalog. Internal to the studio — accessed through the Studio
 * facade, not exported from the package.
 */

import type { ComponentDefinition } from './component'
import { StudioError } from './error'

export class Registry implements Iterable<ComponentDefinition> {
  readonly #components = new Map<string, ComponentDefinition>()

  get size() {
    return this.#components.size
  }

  register(def: ComponentDefinition) {
    if (typeof def.name !== 'string' || def.name.length === 0) {
      throw new StudioError(`Component name must be a non-empty string, got ${JSON.stringify(def.name)}`)
    }
    if (this.#components.has(def.name)) {
      throw new StudioError(`Component "${def.name}" is already registered`)
    }
    this.#components.set(def.name, def)
  }

  registerAll(defs: Iterable<ComponentDefinition>) {
    for (const def of defs) this.register(def)
  }

  has(name: string) {
    return this.#components.has(name)
  }

  get(name: string) {
    return this.#components.get(name)
  }

  getAll(): readonly ComponentDefinition[] {
    return Array.from(this.#components.values())
  }

  [Symbol.iterator]() {
    return this.#components.values()
  }
}
