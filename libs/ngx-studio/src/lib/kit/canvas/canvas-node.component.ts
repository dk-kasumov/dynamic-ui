import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core'
import type { ComponentDefinition, NodeId, RelationInstance } from '@dynamic-ui/studio'
import type { Options } from 'sortablejs'
import { CanvasIconComponent } from './canvas-icon.component'
import { CanvasStore } from './store/canvas-store.service'
import { DsSortableDirective, type DsSortableDropEvent } from './sortable/sortable.directive'

@Component({
  selector: 'ds-canvas-node',
  standalone: true,
  imports: [DsSortableDirective, CanvasIconComponent],
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
              <circle cx="3" cy="3" r="1.2" />
              <circle cx="3" cy="8" r="1.2" />
              <circle cx="3" cy="13" r="1.2" />
              <circle cx="9" cy="3" r="1.2" />
              <circle cx="9" cy="8" r="1.2" />
              <circle cx="9" cy="13" r="1.2" />
            </svg>
          </span>
          <span class="card__icon">
            <ds-canvas-icon [name]="def.name" />
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
            class="card__delete"
            aria-label="Удалить"
            (click)="onRemove($event)"
          >
            <svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true">
              <path
                d="M6 6l8 8M14 6l-8 8"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </header>

        @if (isContainer()) {
          <section class="card__body">
            <div
              class="dropzone"
              dsSortable
              [options]="sortOptions"
              [attr.data-ds-container-id]="n.id"
              (dsSortableDrop)="onDrop($event)"
            >
              @for (child of children(); track child.id) {
                <div
                  class="dropzone__item ds-sortable-item"
                  [attr.data-ds-node-id]="child.id"
                >
                  <ds-canvas-node [nodeId]="child.id" />
                </div>
              } @empty {
                <div class="dropzone__empty">
                  <span class="dropzone__empty-icon">+</span>
                  <span>Перетащите элемент сюда</span>
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
  readonly children = computed(() => this.node()?.children ?? [])

  readonly subtitle = computed(() => {
    const n = this.node()
    const def = this.component()
    if (!n || !def) return null
    const label = typeof n.props['label'] === 'string' ? (n.props['label'] as string) : null
    if (label && label !== def.label) return label
    return null
  })

  readonly relationsSummary = computed(() => {
    const n = this.node()
    if (!n) return null
    const entries = Object.entries(n.relations) as [string, RelationInstance][]
    if (!entries.length) return null
    return entries.map(([key]) => key).join(' · ')
  })

  readonly sortOptions: Partial<Options> = {
    group: 'ds-canvas',
    draggable: '.ds-sortable-item',
    handle: '.ds-sortable-handle',
    onMove: evt => {
      const to = (evt.to as HTMLElement).dataset['dsContainerId']
      const draggedId = evt.dragged.dataset['dsNodeId']
      if (!to || !draggedId) return true
      return !this.store.isDescendant(draggedId as NodeId, to as NodeId)
    }
  }

  onSelect(event: MouseEvent): void {
    event.stopPropagation()
    this.store.select(this.nodeId())
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
