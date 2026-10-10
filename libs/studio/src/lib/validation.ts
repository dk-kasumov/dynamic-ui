/**
 * Validation is framework-agnostic: given a component definition and a node's
 * stored props, run each prop's optional valibot schema and collect the failures.
 * The UI layer (any framework) only renders what this reports — it never re-runs
 * schemas itself. Validation is advisory: it reads values, it never changes them.
 */

import { safeParse } from 'valibot'
import type { ComponentDefinition } from './component'
import { humanize } from './humanize'
import type { GroupPrimitive, Primitive } from './primitives'

/** A single prop whose stored value failed its validation schema. */
export interface FieldError {
  /** Prop path within the node, e.g. `['box', 'x']`. */
  path: string[]
  /** Humanized label of the failing prop. */
  label: string
  /** Messages reported by valibot. */
  messages: string[]
}

/** Runs each prop's schema against its stored value and collects the failures; groups are validated recursively. */
export function validateProps(def: ComponentDefinition, props: Record<string, unknown>): FieldError[] {
  const errors: FieldError[] = []

  const visit = (shape: Record<string, Primitive>, values: Record<string, unknown> | undefined, base: string[]): void => {
    for (const [key, primitive] of Object.entries(shape)) {
      const path = [...base, key]
      const value = values?.[key]
      if (primitive.validation) {
        const result = safeParse(primitive.validation, value)
        if (!result.success) {
          errors.push({ path, label: humanize(key), messages: result.issues.map(issue => issue.message) })
        }
      }
      if (primitive.kind === 'group') {
        const { shape: nested } = primitive as GroupPrimitive<Record<string, Primitive>>
        visit(nested, value as Record<string, unknown> | undefined, path)
      }
    }
  }

  visit(def.props as Record<string, Primitive>, props, [])
  return errors
}
