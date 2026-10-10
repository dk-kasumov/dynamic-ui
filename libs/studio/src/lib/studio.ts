import { BehaviorSubject, type Observable } from 'rxjs'
import { defineAdapter } from './adapter'
import { defineComponent, materializeProps, type ComponentDefinition } from './component'
import { walk, type Node, type NodeId } from './node'
import { validateProps, type FieldError } from './validation'
import type { RelationInstance, TargetFilter } from './relations'
import { checkbox, code, date, decimal, enumeration, group, select, text, time } from './primitives'
import { relation } from './relations'
import { relationTargets } from './relation-graph'
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
    for (const def of components) {
      if (this.#components.has(def.title)) throw new StudioError(`Component "${def.title}" is already registered`)
      this.#components.set(def.title, def)
    }

    this.#tree = new Tree(createNode(root && this.#materialize(root)))
    this.#state$ = new BehaviorSubject<StudioSnapshot>(this.#snapshot())
  }

  /** Fills in every declared prop (recursively) so a new node lands in the tree with a complete prop shape. */
  #materialize(input: NewNode): NewNode {
    const def = this.#components.get(input.name)
    return {
      ...input,
      props: def ? materializeProps(def, input.props) : input.props,
      children: input.children?.map(child => this.#materialize(child))
    }
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

  getComponent(title: string): ComponentDefinition | undefined {
    return this.#components.get(title)
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

  /** Nodes a relation on `nodeId` may point at, narrowed by an optional filter. */
  relationTargets(nodeId: NodeId, filter?: TargetFilter): Node[] {
    return relationTargets(this.#tree, nodeId, filter)
  }

  /** Validation failures for every node, keyed by id; nodes with no failures are omitted. */
  validate(): Map<NodeId, FieldError[]> {
    const errors = new Map<NodeId, FieldError[]>()
    for (const node of walk(this.#tree.root)) {
      const def = this.#components.get(node.name)
      if (!def) continue
      const nodeErrors = validateProps(def, node.props)
      if (nodeErrors.length) errors.set(node.id, nodeErrors)
    }
    return errors
  }

  addNode(parentId: NodeId, input: NewNode, index?: number): NodeId {
    return this.#commit(tree => tree.add(parentId, this.#materialize(input), index))
  }

  removeNode(id: NodeId): void {
    this.#commit(tree => {
      tree.remove(id)
      if (this.#selectedId && !tree.find(this.#selectedId)) this.#selectedId = null
    })
  }

  moveNode(id: NodeId, newParentId: NodeId, index?: number): void {
    this.#commit(tree => tree.move(id, newParentId, index))
  }

  setProp(id: NodeId, path: readonly string[], value: unknown): void {
    this.#commit(tree => tree.setProp(id, path, value))
  }

  setMeta(id: NodeId, patch: NodeMetaPatch): void {
    this.#commit(tree => tree.setMeta(id, patch))
  }

  setRelation(id: NodeId, name: string, value: RelationInstance): void {
    this.#commit(tree => tree.setRelation(id, name, value))
  }

  removeRelation(id: NodeId, name: string): void {
    this.#commit(tree => tree.removeRelation(id, name))
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

  /** Runs a tree mutation, then publishes the new state. A mutation that throws publishes nothing. */
  #commit<Result>(mutate: (tree: Tree) => Result): Result {
    const result = mutate(this.#tree)
    this.#state$.next(this.#snapshot())
    return result
  }

  #snapshot(): StudioSnapshot {
    return { root: this.#tree.root, selectedId: this.#selectedId }
  }

  // DSL (static) -------------------------------------------------------------

  static defineComponent = defineComponent
  static defineAdapter = defineAdapter

  static text = text
  static decimal = decimal
  static checkbox = checkbox
  static code = code
  static time = time
  static date = date
  static select = select
  static enum = enumeration
  static group = group
  static relation = relation
  static humanize = humanize
}

// Public exports -------------------------------------------------------------

export { StudioError } from './error'

export { buildLinkIndex } from './relation-graph'
export type { NodeLinks } from './relation-graph'
export { RELATION_OPERATORS } from './relations'

export type { StudioAdapter } from './adapter'
export type { NewNode, NodeMetaPatch } from './tree'
export { walk } from './node'
export type { Node, NodeId } from './node'
export { validateProps } from './validation'
export type { FieldError } from './validation'
export type { ComponentDefinition, PropsOf, RelationNamesOf } from './component'
export type {
  CheckboxPrimitive,
  CodePrimitive,
  DatePrimitive,
  DateRange,
  DecimalPrimitive,
  EnumPrimitive,
  GroupPrimitive,
  Primitive,
  SelectPrimitive,
  TextPrimitive,
  TimePrimitive,
  ValueOf
} from './primitives'
export type {
  JsonValue,
  OperatorValue,
  RelationDescriptor,
  RelationInstance,
  RelationReturns,
  RelationRule,
  RuleOperator,
  TargetFilter
} from './relations'
