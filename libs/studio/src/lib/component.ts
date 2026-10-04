/**
 * `ComponentDefinition` is what a developer passes to the studio to register
 * a component. Split into `props`, `relations`, and `children`.
 */

import type { Primitive, ValueOf } from './primitives'
import type { RelationDescriptor } from './relations'

export interface ComponentDefinition<
  Name extends string = string,
  Props extends Record<string, Primitive> = Record<string, Primitive>,
  Relations extends Record<string, RelationDescriptor> = Record<string, RelationDescriptor>
> {
  name: Name
  label?: string
  description?: string
  /** Opaque icon token; the UI library decides how to render it and what to fall back to. */
  icon?: string
  /** Whether instances of this component can hold child nodes. */
  container?: boolean
  props: Props
  relations: Relations
}

const EMPTY_RELATIONS = Object.freeze({})

export function defineComponent<
  const Name extends string,
  const Props extends Record<string, Primitive>,
  const Relations extends Record<string, RelationDescriptor> = Record<string, never>
>(
  def: Omit<ComponentDefinition<Name, Props, Relations>, 'relations'> & { relations?: Relations }
): ComponentDefinition<Name, Props, Relations> {
  return { ...def, relations: (def.relations ?? EMPTY_RELATIONS) as Relations }
}

/** Materialized prop values for an instance of this component. */
export type PropsOf<C extends ComponentDefinition> = {
  [K in keyof C['props']]: ValueOf<C['props'][K]>
}

/** The names of relations declared on this component. */
export type RelationNamesOf<C extends ComponentDefinition> = keyof C['relations'] & string
