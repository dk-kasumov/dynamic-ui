/**
 * `ComponentDefinition` is what a developer passes to the studio to register
 * a component. Split into `props`, `relations`, and `children`.
 */

import type { GroupPrimitive, Primitive, ValueOf } from './primitives'
import type { RelationDescriptor } from './relations'

export interface ComponentDefinition<
  Title extends string = string,
  Props extends Record<string, Primitive> = Record<string, Primitive>,
  Relations extends Record<string, RelationDescriptor> = Record<string, RelationDescriptor>
> {
  /** Registered identity and palette path, e.g. `Controls/TextInput`. */
  title: Title
  /** Display label, derived from the last segment of `title` — not set by the developer. */
  label: string
  description?: string
  /** Opaque icon token; the UI library decides how to render it and what to fall back to. */
  icon?: string
  /** Whether instances of this component can hold child nodes. */
  container?: boolean
  props: Props
  relations: Relations
}

const EMPTY_RELATIONS = Object.freeze({})

/** A component's display label: the last `/`-separated segment of its title. */
export const labelFor = (title: string): string => title.slice(title.lastIndexOf('/') + 1)

/** Builds a full value tree for a prop shape: provided wins, else the primitive's `default`, else `null`. Groups recurse. */
function materialize(shape: Record<string, Primitive>, provided: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, primitive] of Object.entries(shape)) {
    if (primitive.kind === 'group') {
      const { shape: nested } = primitive as GroupPrimitive<Record<string, Primitive>>
      out[key] = materialize(nested, (provided[key] ?? {}) as Record<string, unknown>)
    } else {
      out[key] = key in provided ? provided[key] : (primitive as { default?: unknown }).default ?? null
    }
  }
  return out
}

/**
 * The full prop object for a node instance: every prop the component declares is present,
 * seeded from `provided` where given and from the primitive's `default` (else `null`) otherwise.
 * This keeps the AST shape complete and predictable for adapters, even for untouched fields.
 */
export const materializeProps = (def: ComponentDefinition, provided: Record<string, unknown> = {}): Record<string, unknown> =>
  materialize(def.props, provided)

export function defineComponent<
  const Title extends string,
  const Props extends Record<string, Primitive>,
  const Relations extends Record<string, RelationDescriptor> = Record<string, never>
>(
  def: Omit<ComponentDefinition<Title, Props, Relations>, 'label' | 'relations'> & { relations?: Relations }
): ComponentDefinition<Title, Props, Relations> {
  return { ...def, label: labelFor(def.title), relations: (def.relations ?? EMPTY_RELATIONS) as Relations }
}

/** Materialized prop values for an instance of this component. */
export type PropsOf<C extends ComponentDefinition> = {
  [K in keyof C['props']]: ValueOf<C['props'][K]>
}

/** The names of relations declared on this component. */
export type RelationNamesOf<C extends ComponentDefinition> = keyof C['relations'] & string
