import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core'
import type { NodeId } from '@dynamic-ui/studio'
import { CanvasStore } from '../store/canvas-store.service'
import { DsSortableDirective, type DsSortableDropEvent } from '../sortable/sortable.directive'
import { shortName } from '../icon'

@Component({
  selector: 'ds-canvas-node',
  standalone: true,
  imports: [DsSortableDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './canvas-node.component.scss',
  template: `
    @let n = node();
    @let def = component();
    <article
      class="card"
      [class.card--selected]="isSelected() || isInspected()"
      [class.card--container]="container()"
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

      @if (container()) {
        <section class="card__body">
          <div
            class="dropzone"
            dsSortable
            [options]="store.treeSortOptions"
            [attr.data-ds-container-id]="n.id"
            (dsSortableDrop)="store.applyDrop($event)"
          >
            @for (child of n.children; track child.id) {
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
  `
})
export class CanvasNodeComponent {
  readonly store = inject(CanvasStore)

  readonly nodeId = input.required<NodeId>()
  readonly node = this.store.nodeSignal(() => this.nodeId())
  readonly component = computed(() => this.store.component(this.node().name)!)

  readonly container = computed(() => !!this.component().container)
  readonly isSelected = computed(() => this.store.selectedId() === this.nodeId())
  readonly isInspected = computed(() => this.store.inspectedId() === this.nodeId())

  readonly icon = computed(() => this.store.iconOf(this.node()))

  // Instance-level `title` wins; fall back to the component definition's static
  // description. Props are never read here — the subtitle is an explicit label.
  readonly subtitle = computed(() => this.node().title ?? this.component().description)

  readonly relationsSummary = computed(() => Object.keys(this.node().relations).join(' · '))

  readonly shortName = shortName

  onSelect(event: MouseEvent): void {
    event.stopPropagation()
    this.store.select(this.nodeId())
  }

  onEdit(event: MouseEvent): void {
    event.stopPropagation()
    this.store.select(this.nodeId())
    this.store.inspect(this.nodeId())
  }

  onRemove(event: MouseEvent): void {
    event.stopPropagation()
    this.store.removeNode(this.nodeId())
  }
}
