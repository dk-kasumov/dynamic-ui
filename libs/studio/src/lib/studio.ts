/**
 * The studio facade.
 *
 * One class with two faces:
 *   - instance: wires Registry + Tree + Store at construction time.
 *   - static: schema DSL — `Studio.text()`, `Studio.relation()`, etc.
 *
 *   const textInput = defineComponent({
 *     name: 'Controls/TextInput',
 *     props: { label: Studio.text(), disabled: Studio.checkbox() },
 *     relations: { visible: Studio.relation({ returns: 'boolean' }) }
 *   })
 *
 *   const studio = new Studio({
 *     components: [textInput],
 *     root: createNode({ name: 'Form' })
 *   })
 *   studio.store.addNode(studio.store.tree.root.id, { name: 'Controls/TextInput' })
 */

import type { AnyComponentDefinition } from './component'
import type { Node } from './node'
import { Registry } from './registry'
import { Store } from './store'
import { checkbox, decimal, enumeration, group, select, text } from './primitives'
import { relation } from './relations'
import { Tree } from './tree'

export interface StudioOptions {
  components: Iterable<AnyComponentDefinition>
  root: Node
}

export class Studio {
  readonly registry: Registry
  readonly store: Store

  constructor(options: StudioOptions) {
    this.registry = new Registry()
    this.registry.registerAll(options.components)
    this.store = new Store(new Tree(options.root), this.registry)
  }

  // Schema DSL --------------------------------------------------------------

  static text = text
  static decimal = decimal
  static checkbox = checkbox
  static select = select
  static enum = enumeration
  static group = group
  static relation = relation
}

// Runtime ------------------------------------------------------------------

export { defineComponent } from './component'
export { Registry, RegistryError } from './registry'
export { Tree, TreeError, createNode } from './tree'
export { Store } from './store'

// Component types ----------------------------------------------------------

export type {
  AnyComponentDefinition,
  ChildrenCardinality,
  ChildrenConfig,
  ComponentDefinition,
  PropsOf,
  RelationNamesOf
} from './component'

// Primitive types ----------------------------------------------------------

export type {
  AnyPrimitive,
  CheckboxPrimitive,
  DecimalPrimitive,
  EnumPrimitive,
  GroupPrimitive,
  Primitive,
  SelectPrimitive,
  TextPrimitive,
  ValueOf
} from './primitives'

// Relation types -----------------------------------------------------------

export type {
  ArithmeticOp,
  BuiltinOp,
  ComparisonOp,
  JsonValue,
  LogicalOp,
  Operand,
  PredicateOp,
  RelationAst,
  RelationDescriptor,
  RelationDescriptorBuiltin,
  RelationDescriptorCustom,
  RelationInstance,
  RelationPreset,
  RelationReturns,
  TargetFilter
} from './relations'

// Tree types ---------------------------------------------------------------

export type { Node, NodeId } from './node'
export type { NewNode } from './tree'
