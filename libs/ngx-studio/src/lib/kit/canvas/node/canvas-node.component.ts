import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core'
import type { ComponentDefinition, Node, NodeId, RelationInstance } from '@dynamic-ui/studio'
import { CanvasStore } from '../store/canvas-store.service'
import { DsSortableDirective, type DsSortableDropEvent } from '../sortable/sortable.directive'
import { resolveIcon } from '../icon'

@Component({
  selector: 'ds-canvas-node',
  standalone: true,
  imports: [DsSortableDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './canvas-node.component.scss',
  template: `
    @let n = node();
    @let def = component();
    @if (n && def) {
      <article
        class="card"
        [class.card--selected]="isSelected()"
        [class.card--container]="isContainer()"
        (click)="onSelect($event)"
      >
        <header class="card__head ds-sortable-handle">
          <span class="card__grip" aria-hidden="true">
            <svg viewBox="0 0 12 16" width="10" height="14">
              @for (y of [3, 8, 13]; track y) {
                <circle cx="3" [attr.cy]="y" r="1.2" />
                <circle cx="9" [attr.cy]="y" r="1.2" />
              }
            </svg>
          </span>
          <span class="card__icon">
            <span class="material-icons" aria-hidden="true">{{ icon() }}</span>
          </span>
          <div class="card__titles">
            <span class="card__title">{{ def.label || shortName(def.name) }}</span>
            @if (subtitle(); as sub) {
              <span class="card__subtitle">{{ sub }}</span>
            }
          </div>
          @if (relationsSummary(); as rels) {
            <span class="card__relations" [attr.title]="rels">
              <span class="card__relations-dot"></span>
              {{ rels }}
            </span>
          }
          <button
            type="button"
            class="card__action card__action--edit"
            [class.card__action--active]="isInspected()"
            aria-label="Configure"
            (click)="onEdit($event)"
          >
            <span class="material-icons" aria-hidden="true">tune</span>
          </button>
          <button type="button" class="card__action card__action--delete" aria-label="Remove" (click)="onRemove($event)">
            <svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true">
              <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
            </svg>
          </button>
        </header>

        @if (isContainer()) {
          <section class="card__body">
            <div
              class="dropzone"
              dsSortable
              [options]="store.treeSortOptions"
              [attr.data-ds-container-id]="n.id"
              (dsSortableDrop)="onDrop($event)"
            >
              @for (child of children(); track child.id) {
                <div class="dropzone__item ds-sortable-item" [attr.data-ds-node-id]="child.id">
                  <ds-canvas-node [nodeId]="child.id" />
                </div>
              } @empty {
                <div class="dropzone__empty">
                  <span class="material-icons dropzone__empty-icon" aria-hidden="true">add</span>
                  <span>Drop a component here</span>
                </div>
              }
            </div>
          </section>
        }
      </article>
    }
  `
})
export class CanvasNodeComponent {
  readonly store = inject(CanvasStore)

  readonly nodeId = input.required<NodeId>()
  readonly node = this.store.nodeSignal(() => this.nodeId())

  readonly component = computed<ComponentDefinition | undefined>(() => {
    const n = this.node()
    return n ? this.store.component(n.name) : undefined
  })

  readonly isContainer = computed(() => this.store.isContainer(this.component()))
  readonly isSelected = computed(() => this.store.selectedId() === this.nodeId())
  readonly isInspected = computed(() => this.store.inspectedId() === this.nodeId())
  readonly children = computed(() => this.node()?.children ?? [])

  readonly icon = computed(() => {
    const n = this.node() as Node | undefined
    const def = this.component()
    if (n?.icon) return n.icon
    return def ? resolveIcon(def) : ''
  })

  // Instance-level `title` wins; fall back to the component definition's static
  // description. Props are never read here — the subtitle is an explicit label,
  // not a reflection of any particular prop.
  readonly subtitle = computed(() => {
    const n = this.node() as Node | undefined
    const def = this.component()
    return n?.title ?? def?.description ?? null
  })

  readonly relationsSummary = computed(() => {
    const n = this.node()
    if (!n) return null
    const keys = Object.keys(n.relations as Record<string, RelationInstance>)
    return keys.length ? keys.join(' · ') : null
  })

  readonly resolveIcon = resolveIcon

  onSelect(event: MouseEvent): void {
    event.stopPropagation()
    this.store.select(this.nodeId())
  }

  onEdit(event: MouseEvent): void {
    event.stopPropagation()
    this.store.inspect(this.nodeId())
  }

  onRemove(event: MouseEvent): void {
    event.stopPropagation()
    this.store.removeNode(this.nodeId())
  }

  onDrop(event: DsSortableDropEvent): void {
    this.store.applyDrop(event)
  }

  shortName(fqn: string): string {
    const i = fqn.lastIndexOf('/')
    return i === -1 ? fqn : fqn.slice(i + 1)
  }
}
