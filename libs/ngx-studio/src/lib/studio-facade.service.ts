import { Injectable, computed, signal } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { acceptsChild, buildLinkIndex } from '@dynamic-ui/studio'
import type {
  ComponentDefinition,
  FieldError,
  NewNode,
  Node,
  NodeId,
  NodeLinks,
  NodeMetaPatch,
  RelationInstance,
  Studio,
  StudioAdapter,
  StudioSnapshot,
  TargetFilter
} from '@dynamic-ui/studio'
import { BehaviorSubject, EMPTY, type Observable, switchMap } from 'rxjs'
import type { Options } from 'sortablejs'
import { iconOrDefault } from './shared/icon/icon'
import type { DsSortableDropEvent } from './canvas/sortable/sortable.directive'

const NO_NODES: ReadonlySet<NodeId> = new Set()
const NO_LINKS: NodeLinks = { to: [], from: [] }
const NO_ERRORS: readonly FieldError[] = []

@Injectable()
export class StudioFacade {
  readonly #source = new BehaviorSubject<Studio | null>(null)
  readonly #state = toSignal(
    this.#source.pipe(switchMap((studio): Observable<StudioSnapshot | null> => (studio ? studio.state$ : EMPTY))),
    { initialValue: null }
  )
  readonly #inspectorOpen = signal(false)
  readonly #pick = signal<{ eligible: ReadonlySet<NodeId>; resolve: (id: NodeId) => void } | null>(null)
  readonly #highlighted = signal<ReadonlySet<NodeId>>(NO_NODES)

  readonly root = computed(() => this.#state()?.root ?? null)
  readonly selectedId = computed(() => this.#state()?.selectedId ?? null)

  readonly links = computed(() => {
    const root = this.root()
    return root ? buildLinkIndex(root) : new Map<NodeId, NodeLinks>()
  })

  readonly fieldErrors = computed<ReadonlyMap<NodeId, FieldError[]>>(() =>
    this.root() ? this.#studio().validate() : new Map()
  )

  readonly errorCount = computed(() =>
    [...this.fieldErrors().values()].reduce((total, errors) => total + errors.length, 0)
  )

  readonly nodesWithErrors = computed(() => [...this.fieldErrors().keys()])

  readonly picking = computed(() => this.#pick() !== null)

  readonly inspectedId = computed(() => (this.#inspectorOpen() ? this.selectedId() : null))
  readonly inspectedNode = computed<Node | null>(() => {
    this.#state()
    const id = this.inspectedId()
    return id ? (this.#studio().findNode(id) ?? null) : null
  })

  readonly treeSortOptions: Partial<Options> = {
    group: 'ds-canvas',
    draggable: '.ds-sortable-item',
    handle: '.ds-sortable-handle',
    onMove: evt => {
      const to = (evt.to as HTMLElement).dataset['dsContainerId'] as NodeId | undefined
      if (!to) return true
      const nodeId = evt.dragged.dataset['dsNodeId'] as NodeId | undefined
      if (nodeId && this.#studio().isDescendant(nodeId, to)) return false
      const title = this.#draggedTitle(evt.dragged as HTMLElement)
      return title === null || this.#accepts(to, title)
    }
  }

  bind(studio: Studio): void {
    this.#source.next(studio)
    this.#inspectorOpen.set(false)
  }

  nodeSignal(id: () => NodeId) {
    return computed(() => {
      this.#state()
      return this.#studio().findNode(id()) as Node
    })
  }

  component(name: string): ComponentDefinition | undefined {
    return this.#studio().getComponent(name)
  }

  iconOf(node: Node): string {
    return iconOrDefault(this.#studio().iconOf(node), this.component(node.name)!)
  }

  addNode(parentId: NodeId, input: NewNode, index?: number): NodeId {
    return this.#studio().addNode(parentId, input, index)
  }

  moveNode(id: NodeId, newParentId: NodeId, index?: number): void {
    this.#studio().moveNode(id, newParentId, index)
  }

  removeNode(id: NodeId): void {
    this.#studio().removeNode(id)
  }

  setProp(id: NodeId, path: readonly string[], value: unknown): void {
    this.#studio().setProp(id, path, value)
  }

  setMeta(id: NodeId, patch: NodeMetaPatch): void {
    this.#studio().setMeta(id, patch)
  }

  select(id: NodeId | null): void {
    this.#studio().select(id)
  }

  inspect(id: NodeId): void {
    this.#studio().select(id)
    this.#inspectorOpen.set(true)
  }

  closeInspector(): void {
    this.#inspectorOpen.set(false)
  }

  setRelation(id: NodeId, name: string, value: RelationInstance): void {
    this.#studio().setRelation(id, name, value)
  }

  removeRelation(id: NodeId, name: string): void {
    this.#studio().removeRelation(id, name)
  }

  relationTargets(nodeId: NodeId, filter?: TargetFilter): Node[] {
    return this.#studio().relationTargets(nodeId, filter)
  }

  runAdapter<Output>(adapter: StudioAdapter<Output>): Output {
    return this.#studio().runAdapter(adapter)
  }

  nodeLabel(id: NodeId): string {
    const node = this.#studio().findNode(id)
    if (!node) return id
    return node.fieldName ?? node.title ?? this.component(node.name)?.label ?? node.name
  }

  linksOf(id: NodeId): NodeLinks {
    return this.links().get(id) ?? NO_LINKS
  }

  errorsOf(id: NodeId): readonly FieldError[] {
    return this.fieldErrors().get(id) ?? NO_ERRORS
  }

  describeNode(id: NodeId): { name: string; type: string | null } {
    const node = this.#studio().findNode(id)
    if (!node) return { name: id, type: null }
    const type = this.component(node.name)?.label ?? node.name
    const name = node.fieldName ?? node.title
    return name ? { name, type } : { name: type, type: null }
  }

  highlight(ids: Iterable<NodeId>): void {
    this.#highlighted.set(new Set(ids))
  }

  clearHighlight(): void {
    if (this.#highlighted().size) this.#highlighted.set(NO_NODES)
  }

  isHighlighted(id: NodeId): boolean {
    return this.#highlighted().has(id)
  }

  pickable(id: NodeId): boolean {
    return this.#pick()?.eligible.has(id) ?? false
  }

  startPick(eligible: Iterable<NodeId>, resolve: (id: NodeId) => void): void {
    this.clearHighlight()
    this.#pick.set({ eligible: new Set(eligible), resolve })
  }

  resolvePick(id: NodeId): void {
    const pick = this.#pick()
    if (!pick?.eligible.has(id)) return
    this.#pick.set(null)
    pick.resolve(id)
  }

  cancelPick(): void {
    this.#pick.set(null)
  }

  applyDrop(evt: DsSortableDropEvent): boolean {
    const targetId = (evt.to as HTMLElement).dataset['dsContainerId'] as NodeId | undefined
    if (!targetId) return false

    const paletteName = evt.item.dataset['dsPaletteName']
    if (paletteName) {
      if (!this.#accepts(targetId, paletteName)) return false
      this.addNode(targetId, { name: paletteName }, evt.newIndex)
      return true
    }

    const nodeId = evt.item.dataset['dsNodeId'] as NodeId | undefined
    if (!nodeId) return false
    if (this.#studio().isDescendant(nodeId, targetId)) return false
    const title = this.#studio().findNode(nodeId)?.name
    if (title && !this.#accepts(targetId, title)) return false

    this.moveNode(nodeId, targetId, evt.newIndex)
    return true
  }

  /** The component title of a dragged element — a palette chip or an existing node. */
  #draggedTitle(el: HTMLElement): string | null {
    const paletteName = el.dataset['dsPaletteName']
    if (paletteName) return paletteName
    const nodeId = el.dataset['dsNodeId'] as NodeId | undefined
    return nodeId ? (this.#studio().findNode(nodeId)?.name ?? null) : null
  }

  /** Whether the container node accepts a child of the given component title. */
  #accepts(containerId: NodeId, childTitle: string): boolean {
    const node = this.#studio().findNode(containerId)
    const def = node && this.component(node.name)
    return def ? acceptsChild(def, childTitle) : true
  }

  #studio(): Studio {
    const studio = this.#source.value
    if (!studio) throw new Error('StudioFacade: studio is not bound')
    return studio
  }
}
