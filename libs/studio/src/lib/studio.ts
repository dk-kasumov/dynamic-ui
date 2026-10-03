import { defineComponent, type ComponentDefinition } from './component'
import type { Node, NodeId } from './node'
import type { RelationInstance } from './relations'
import { checkbox, decimal, enumeration, group, select, text } from './primitives'
import { relation } from './relations'
import { Registry } from './registry'
import { Store } from './store'
import { Tree, createNode, type NewNode, type NodeMetaPatch } from './tree'
import { humanize } from './humanize'

export interface StudioOptions {
  components: Iterable<ComponentDefinition>
  root: Node
}

export class Studio {
  readonly #store: Store

  constructor(options: StudioOptions) {
    const registry = new Registry()
    registry.registerAll(options.components)
    this.#store = new Store(new Tree(options.root), registry)
  }

  // State --------------------------------------------------------------------

  get root(): Node {
    return this.#store.tree.root
  }

  get selectedId(): NodeId | null {
    return this.#store.selectedId
  }

  // Registry (component palette) --------------------------------------------

  getComponents(): readonly ComponentDefinition[] {
    return this.#store.registry.getAll()
  }

  getComponent(name: string): ComponentDefinition | undefined {
    return this.#store.registry.get(name)
  }

  // Tree inspection ----------------------------------------------------------

  findNode(id: NodeId): Node | undefined {
    return this.#store.tree.find(id)
  }

  parentOf(id: NodeId): Node | undefined {
    return this.#store.tree.parentOf(id)
  }

  // Mutations ----------------------------------------------------------------

  addNode(parentId: NodeId, input: NewNode, index?: number): NodeId {
    return this.#store.addNode(parentId, input, index)
  }

  removeNode(id: NodeId): void {
    this.#store.removeNode(id)
  }

  moveNode(id: NodeId, newParentId: NodeId, index?: number): void {
    this.#store.moveNode(id, newParentId, index)
  }

  setProp(id: NodeId, path: readonly string[], value: unknown): void {
    this.#store.setProp(id, path, value)
  }

  setMeta(id: NodeId, patch: NodeMetaPatch): void {
    this.#store.setMeta(id, patch)
  }

  setRelation(id: NodeId, name: string, value: RelationInstance): void {
    this.#store.setRelation(id, name, value)
  }

  removeRelation(id: NodeId, name: string): void {
    this.#store.removeRelation(id, name)
  }

  select(id: NodeId | null): void {
    this.#store.select(id)
  }

  // Reactivity ---------------------------------------------------------------

  subscribe(listener: () => void): () => void {
    return this.#store.subscribe(listener)
  }

  // DSL (static) -------------------------------------------------------------

  static defineComponent = defineComponent
  static createNode = createNode

  static text = text
  static decimal = decimal
  static checkbox = checkbox
  static select = select
  static enum = enumeration
  static group = group
  static relation = relation
  static humanize = humanize
}

// Public exports -------------------------------------------------------------

export { StudioError } from './error'

export type { NewNode, NodeMetaPatch } from './tree'
export type { Node, NodeId } from './node'
export type { ChildrenCardinality, ChildrenConfig, ComponentDefinition, PropsOf, RelationNamesOf } from './component'
export type {
  CheckboxPrimitive,
  DecimalPrimitive,
  EnumPrimitive,
  GroupPrimitive,
  Primitive,
  SelectPrimitive,
  TextPrimitive,
  ValueOf
} from './primitives'
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
