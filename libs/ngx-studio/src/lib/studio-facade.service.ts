import { Injectable, computed, signal } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { buildLinkIndex } from '@dynamic-ui/studio'
import type {
  ComponentDefinition,
  NewNode,
  Node,
  NodeId,
  NodeLinks,
  NodeMetaPatch,
  RelationInstance,
  Studio,
  StudioSnapshot,
  TargetFilter
} from '@dynamic-ui/studio'
import { BehaviorSubject, EMPTY, type Observable, switchMap } from 'rxjs'
import type { Options } from 'sortablejs'
import { iconOrDefault } from './canvas/icon'
import type { DsSortableDropEvent } from './canvas/sortable/sortable.directive'

const NO_NODES: ReadonlySet<NodeId> = new Set()
const NO_LINKS: NodeLinks = { to: [], from: [] }

/**
 * Thin Angular adapter over the framework-agnostic `Studio`. It holds no editor
 * state of its own except whether the inspector panel is open — *which* node is
 * active always comes from the core's selection. The core's RxJS `state$` is
 * mirrored into a signal; every query and mutation passes straight through, so
 * there is a single source of truth (the `Studio` instance).
 */
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

  /** Relation links of every node, in both directions; rebuilt once per tree change. */
  readonly links = computed(() => {
    const root = this.root()
    return root ? buildLinkIndex(root) : new Map<NodeId, NodeLinks>()
  })

  /** True while the user is picking a relation target on the canvas. */
  readonly picking = computed(() => this.#pick() !== null)

  /** The inspected node is the selected one while the panel is open — never a second selection. */
  readonly inspectedId = computed(() => (this.#inspectorOpen() ? this.selectedId() : null))
  readonly inspectedNode = computed<Node | null>(() => {
    this.#state() // recompute on every tree mutation, not only when the selection changes
    const id = this.inspectedId()
    return id ? (this.#studio().findNode(id) ?? null) : null
  })

  /** Shared SortableJS config for both the canvas root and any container node. */
  readonly treeSortOptions: Partial<Options> = {
    group: 'ds-canvas',
    draggable: '.ds-sortable-item',
    handle: '.ds-sortable-handle',
    onMove: evt => {
      const to = (evt.to as HTMLElement).dataset['dsContainerId']
      const draggedId = evt.dragged.dataset['dsNodeId']
      if (!to || !draggedId) return true
      return !this.#studio().isDescendant(draggedId as NodeId, to as NodeId)
    }
  }

  bind(studio: Studio): void {
    this.#source.next(studio)
    this.#inspectorOpen.set(false)
  }

  // Queries ------------------------------------------------------------------

  /** Live view of a node that is known to exist while its consumer is rendered. */
  nodeSignal(id: () => NodeId) {
    return computed(() => {
      this.#state() // re-read when the tree changes; identity is stable for untouched nodes
      return this.#studio().findNode(id()) as Node
    })
  }

  component(name: string): ComponentDefinition | undefined {
    return this.#studio().getComponent(name)
  }

  /** Icon to render for a node: core-resolved token, else the UI default. */
  iconOf(node: Node): string {
    return iconOrDefault(this.#studio().iconOf(node), this.component(node.name)!)
  }

  // Mutations ----------------------------------------------------------------

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

  // Selection & inspector ----------------------------------------------------

  select(id: NodeId | null): void {
    this.#studio().select(id)
  }

  /** Select a node and open the inspector on it. */
  inspect(id: NodeId): void {
    this.#studio().select(id)
    this.#inspectorOpen.set(true)
  }

  closeInspector(): void {
    this.#inspectorOpen.set(false)
  }

  // Relations ----------------------------------------------------------------

  setRelation(id: NodeId, name: string, value: RelationInstance): void {
    this.#studio().setRelation(id, name, value)
  }

  removeRelation(id: NodeId, name: string): void {
    this.#studio().removeRelation(id, name)
  }

  relationTargets(nodeId: NodeId, filter?: TargetFilter): Node[] {
    return this.#studio().relationTargets(nodeId, filter)
  }

  /** Display name for a node: its field name, else its own title, else its component's label. */
  nodeLabel(id: NodeId): string {
    const node = this.#studio().findNode(id)
    if (!node) return id
    return node.fieldName ?? node.title ?? this.component(node.name)?.label ?? node.name
  }

  /** Who `id` is linked with; empty for an unlinked node. */
  linksOf(id: NodeId): NodeLinks {
    return this.links().get(id) ?? NO_LINKS
  }

  /**
   * How to present a node in a reference (e.g. a relation target): its field name,
   * else its own title, else its component's label — the first one is the name and
   * the component label is kept as the `type` whenever a more specific name won.
   */
  describeNode(id: NodeId): { name: string; type: string | null } {
    const node = this.#studio().findNode(id)
    if (!node) return { name: id, type: null }
    const type = this.component(node.name)?.label ?? node.name
    const name = node.fieldName ?? node.title
    return name ? { name, type } : { name: type, type: null }
  }

  // Highlight ----------------------------------------------------------------

  /** Emphasises nodes on the canvas, e.g. while hovering a link that points at them. */
  highlight(ids: Iterable<NodeId>): void {
    this.#highlighted.set(new Set(ids))
  }

  clearHighlight(): void {
    if (this.#highlighted().size) this.#highlighted.set(NO_NODES)
  }

  isHighlighted(id: NodeId): boolean {
    return this.#highlighted().has(id)
  }

  // Pick-on-canvas -----------------------------------------------------------

  /** True for a node the active pick may land on (used to highlight/dim cards). */
  pickable(id: NodeId): boolean {
    return this.#pick()?.eligible.has(id) ?? false
  }

  /** Enter pick mode; `resolve` fires with the chosen node, then pick mode ends. */
  startPick(eligible: Iterable<NodeId>, resolve: (id: NodeId) => void): void {
    this.clearHighlight()
    this.#pick.set({ eligible: new Set(eligible), resolve })
  }

  /** Called when a canvas node is clicked during pick mode; ignores ineligible nodes. */
  resolvePick(id: NodeId): void {
    const pick = this.#pick()
    if (!pick?.eligible.has(id)) return
    this.#pick.set(null)
    pick.resolve(id)
  }

  cancelPick(): void {
    this.#pick.set(null)
  }

  // Drag & drop --------------------------------------------------------------

  /**
   * Translate a raw sortable drop into a tree mutation. The container id is
   * read from `data-ds-container-id` on `evt.to`; items carry either
   * `data-ds-node-id` (an existing node being moved) or `data-ds-palette-name`
   * (a palette source being added).
   */
  applyDrop(evt: DsSortableDropEvent): boolean {
    const targetId = (evt.to as HTMLElement).dataset['dsContainerId'] as NodeId | undefined
    if (!targetId) return false

    const paletteName = evt.item.dataset['dsPaletteName']
    if (paletteName) {
      this.addNode(targetId, { name: paletteName }, evt.newIndex)
      return true
    }

    const nodeId = evt.item.dataset['dsNodeId'] as NodeId | undefined
    if (!nodeId) return false
    if (this.#studio().isDescendant(nodeId, targetId)) return false

    this.moveNode(nodeId, targetId, evt.newIndex)
    return true
  }

  #studio(): Studio {
    const studio = this.#source.value
    if (!studio) throw new Error('StudioFacade: studio is not bound')
    return studio
  }
}
