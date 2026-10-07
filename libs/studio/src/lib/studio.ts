import { BehaviorSubject, type Observable } from 'rxjs'
import { defineComponent, type ComponentDefinition } from './component'
import type { Node, NodeId } from './node'
import type { RelationInstance, TargetFilter } from './relations'
import { checkbox, decimal, enumeration, group, select, text } from './primitives'
import { relation } from './relations'
import { StudioError } from './error'
import { Tree, createNode, type NewNode, type NodeMetaPatch } from './tree'
import { humanize } from './humanize'

export interface StudioOptions {
  components: Iterable<ComponentDefinition>
  /** The root node; omit to let the studio create an empty root container. */
  root?: NewNode
}

export interface StudioSnapshot {
  root: Node
  selectedId: NodeId | null
}

export class Studio {
  readonly #tree: Tree
  readonly #components = new Map<string, ComponentDefinition>()
  readonly #state$: BehaviorSubject<StudioSnapshot>
  #selectedId: NodeId | null = null

  constructor({ components, root }: StudioOptions) {
    this.#tree = new Tree(createNode(root))

    for (const def of components) {
      if (this.#components.has(def.name)) throw new StudioError(`Component "${def.name}" is already registered`)
      this.#components.set(def.name, def)
    }

    this.#state$ = new BehaviorSubject<StudioSnapshot>(this.#snapshot())
  }

  // State --------------------------------------------------------------------

  get root(): Node {
    return this.#tree.root
  }

  get selectedId(): NodeId | null {
    return this.#selectedId
  }

  snapshot(): StudioSnapshot {
    return this.#state$.value
  }

  getComponents(): readonly ComponentDefinition[] {
    return [...this.#components.values()]
  }

  getComponent(name: string): ComponentDefinition | undefined {
    return this.#components.get(name)
  }

  findNode(id: NodeId): Node | undefined {
    return this.#tree.find(id)
  }

  parentOf(id: NodeId): Node | undefined {
    return this.#tree.parentOf(id)
  }

  /** True when `nodeId` is `ancestorId` itself or lives anywhere inside its subtree. */
  isDescendant(ancestorId: NodeId, nodeId: NodeId): boolean {
    return this.#tree.isDescendant(ancestorId, nodeId)
  }

  /** The node's own icon token, else its component's; `undefined` when neither sets one (the UI picks a default). */
  iconOf(node: Node): string | undefined {
    return node.icon || this.#components.get(node.name)?.icon
  }

  /**
   * Nodes a relation on `nodeId` may point at: never itself or its own
   * descendants (that would be a cycle), narrowed by an optional target filter.
   */
  relationTargets(nodeId: NodeId, filter?: TargetFilter): Node[] {
    const pool: Node[] = []
    if ((filter?.scope ?? 'any') === 'siblings') {
      pool.push(...(this.parentOf(nodeId)?.children ?? []))
    } else {
      const walk = (node: Node): void => {
        for (const child of node.children ?? []) {
          pool.push(child)
          walk(child)
        }
      }
      walk(this.#tree.root)
    }
    return pool.filter(
      node => !this.isDescendant(nodeId, node.id) && (!filter?.kinds || filter.kinds.includes(node.name))
    )
  }

  addNode(parentId: NodeId, input: NewNode, index?: number): NodeId {
    const id = this.#tree.add(parentId, input, index)
    this.#state$.next(this.#snapshot())
    return id
  }

  removeNode(id: NodeId): void {
    this.#tree.remove(id)
    if (this.#selectedId && !this.#tree.find(this.#selectedId)) this.#selectedId = null
    this.#state$.next(this.#snapshot())
  }

  moveNode(id: NodeId, newParentId: NodeId, index?: number): void {
    this.#tree.move(id, newParentId, index)
    this.#state$.next(this.#snapshot())
  }

  setProp(id: NodeId, path: readonly string[], value: unknown): void {
    this.#tree.setProp(id, path, value)
    this.#state$.next(this.#snapshot())
  }

  setMeta(id: NodeId, patch: NodeMetaPatch): void {
    this.#tree.setMeta(id, patch)
    this.#state$.next(this.#snapshot())
  }

  setRelation(id: NodeId, name: string, value: RelationInstance): void {
    this.#tree.setRelation(id, name, value)
    this.#state$.next(this.#snapshot())
  }

  removeRelation(id: NodeId, name: string): void {
    this.#tree.removeRelation(id, name)
    this.#state$.next(this.#snapshot())
  }

  select(id: NodeId | null): void {
    this.#selectedId = id
    this.#state$.next(this.#snapshot())
  }

  // Reactivity ---------------------------------------------------------------

  /** Emits a fresh snapshot after every mutation; current value replays on subscribe. */
  get state$(): Observable<StudioSnapshot> {
    return this.#state$.asObservable()
  }

  #snapshot(): StudioSnapshot {
    return { root: this.#tree.root, selectedId: this.#selectedId }
  }

  // DSL (static) -------------------------------------------------------------

  static defineComponent = defineComponent

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

export { RELATION_OPERATORS, toExpression, fromExpression, describeExpression } from './relations-rules'
export type { OperatorValue, RelationRule, RelationRuleSet, RuleOperator } from './relations-rules'

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
