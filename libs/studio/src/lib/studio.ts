import { defineComponent, type ComponentDefinition } from './component'
import type { Node, NodeId } from './node'
import type { RelationInstance } from './relations'
import { checkbox, decimal, enumeration, group, select, text } from './primitives'
import { relation } from './relations'
import { StudioError } from './error'
import { Tree, createNode, type NewNode, type NodeMetaPatch } from './tree'
import { humanize } from './humanize'

export interface StudioOptions {
  components: Iterable<ComponentDefinition>
  root: Node
}

/**
 * Facade over the node tree and the component catalog. Owns selection and
 * change listeners; every mutation emits exactly once after it is applied.
 */
export class Studio {
  readonly #tree: Tree
  readonly #components = new Map<string, ComponentDefinition>()
  readonly #listeners = new Set<() => void>()
  #selectedId: NodeId | null = null

  constructor({ components, root }: StudioOptions) {
    this.#tree = new Tree(root)
    for (const def of components) {
      if (this.#components.has(def.name)) throw new StudioError(`Component "${def.name}" is already registered`)
      this.#components.set(def.name, def)
    }
  }

  // State --------------------------------------------------------------------

  get root(): Node {
    return this.#tree.root
  }

  get selectedId(): NodeId | null {
    return this.#selectedId
  }

  // Registry (component palette) --------------------------------------------

  getComponents(): readonly ComponentDefinition[] {
    return [...this.#components.values()]
  }

  getComponent(name: string): ComponentDefinition | undefined {
    return this.#components.get(name)
  }

  // Tree inspection ----------------------------------------------------------

  findNode(id: NodeId): Node | undefined {
    return this.#tree.find(id)
  }

  parentOf(id: NodeId): Node | undefined {
    return this.#tree.parentOf(id)
  }

  /** The node's own icon token, else its component's; `undefined` when neither sets one (the UI picks a default). */
  iconOf(node: Node): string | undefined {
    return node.icon || this.#components.get(node.name)?.icon
  }

  // Mutations ----------------------------------------------------------------

  addNode(parentId: NodeId, input: NewNode, index?: number): NodeId {
    return this.#apply(() => this.#tree.add(parentId, input, index))
  }

  removeNode(id: NodeId): void {
    this.#apply(() => {
      this.#tree.remove(id)
      if (this.#selectedId === id) this.#selectedId = null
    })
  }

  moveNode(id: NodeId, newParentId: NodeId, index?: number): void {
    this.#apply(() => this.#tree.move(id, newParentId, index))
  }

  setProp(id: NodeId, path: readonly string[], value: unknown): void {
    this.#apply(() => this.#tree.setProp(id, path, value))
  }

  setMeta(id: NodeId, patch: NodeMetaPatch): void {
    this.#apply(() => this.#tree.setMeta(id, patch))
  }

  setRelation(id: NodeId, name: string, value: RelationInstance): void {
    this.#apply(() => this.#tree.setRelation(id, name, value))
  }

  removeRelation(id: NodeId, name: string): void {
    this.#apply(() => this.#tree.removeRelation(id, name))
  }

  select(id: NodeId | null): void {
    if (id !== this.#selectedId) this.#apply(() => void (this.#selectedId = id))
  }

  // Reactivity ---------------------------------------------------------------

  subscribe(listener: () => void): () => void {
    this.#listeners.add(listener)
    return () => this.#listeners.delete(listener)
  }

  #apply<T>(mutation: () => T): T {
    const result = mutation()
    this.#listeners.forEach(listener => listener())
    return result
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
export type { ComponentDefinition, PropsOf, RelationNamesOf } from './component'
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
  ArithmeticOperator,
  BuiltinOperator,
  ComparisonOperator,
  JsonValue,
  LogicalOperator,
  Operand,
  PredicateOperator,
  RelationExpression,
  RelationDescriptor,
  RelationDescriptorBuiltin,
  RelationDescriptorCustom,
  RelationInstance,
  RelationPreset,
  RelationReturns,
  TargetFilter
} from './relations'
