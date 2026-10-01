/**
 * `ComponentDefinition` is what a developer passes to the studio to register
 * a component. Split into `props`, `relations`, and `children`.
 */

import type { Primitive, ValueOf } from './primitives'
import type { RelationDescriptor } from './relations'

export type ChildrenCardinality = 'none' | 'one' | 'many'

export interface ChildrenConfig {
  cardinality: ChildrenCardinality
  /** Whitelist of allowed child component names. Studio-time constraint for drop targets. */
  kinds?: readonly string[]
  min?: number
  max?: number
}

export interface ComponentDefinition<
  Name extends string = string,
  Props extends Record<string, Primitive> = Record<string, Primitive>,
  Relations extends Record<string, RelationDescriptor> = Record<string, RelationDescriptor>,
  Children extends ChildrenConfig | undefined = ChildrenConfig | undefined
> {
  name: Name
  label?: string
  description?: string
  props: Props
  relations: Relations
  children: Children
}

const EMPTY_RELATIONS = Object.freeze({})

export function defineComponent<
  const Name extends string,
  const Props extends Record<string, Primitive>,
  const Relations extends Record<string, RelationDescriptor> = Record<string, never>,
  const Children extends ChildrenConfig | undefined = undefined
>(def: {
  name: Name
  label?: string
  description?: string
  props: Props
  relations?: Relations
  children?: Children
}): ComponentDefinition<Name, Props, Relations, Children> {
  return {
    name: def.name,
    label: def.label,
    description: def.description,
    props: def.props,
    relations: (def.relations ?? EMPTY_RELATIONS) as Relations,
    children: def.children as Children
  }
}

/** Materialized prop values for an instance of this component. */
export type PropsOf<C extends ComponentDefinition> = {
  [K in keyof C['props']]: ValueOf<C['props'][K]>
}

/** The names of relations declared on this component. */
export type RelationNamesOf<C extends ComponentDefinition> = keyof C['relations'] & string
