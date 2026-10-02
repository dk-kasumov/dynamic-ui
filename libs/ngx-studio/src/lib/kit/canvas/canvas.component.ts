import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core'
import type { NodeId } from '@dynamic-ui/studio'
import type { Options } from 'sortablejs'
import { CanvasNodeComponent } from './canvas-node.component'
import { CanvasStore } from './store/canvas-store.service'
import { DsSortableDirective, type DsSortableDropEvent } from './sortable/sortable.directive'

@Component({
  selector: 'ds-canvas',
  standalone: true,
  imports: [CanvasNodeComponent, DsSortableDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './canvas.component.scss',
  template: `
    @let r = root();
    <div class="canvas" (click)="deselect()">
      <div class="canvas__inner">
        @if (r) {
          <div
            class="canvas__stack"
            dsSortable
            [options]="sortOptions"
            [attr.data-ds-container-id]="r.id"
            (dsSortableDrop)="onDrop($event)"
          >
            @for (child of children(); track child.id) {
              <div
                class="canvas__item ds-sortable-item"
                [attr.data-ds-node-id]="child.id"
              >
                <ds-canvas-node [nodeId]="child.id" />
              </div>
            } @empty {
              <div class="canvas__empty">
                <div class="canvas__empty-glyph">
                  <svg viewBox="0 0 32 32" width="36" height="36" aria-hidden="true">
                    <rect x="4" y="4" width="24" height="24" rx="6" fill="none"
                          stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 3" />
                    <path d="M16 11v10M11 16h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                  </svg>
                </div>
                <div class="canvas__empty-title">Пустой холст</div>
                <div class="canvas__empty-hint">Перетащите компонент из палитры, чтобы начать</div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class CanvasComponent {
  readonly store = inject(CanvasStore)

  readonly root = this.store.root
  readonly children = computed(() => this.root()?.children ?? [])

  readonly sortOptions: Partial<Options> = {
    group: 'ds-canvas',
    draggable: '.ds-sortable-item',
    handle: '.ds-sortable-handle',
    onMove: evt => {
      const to = (evt.to as HTMLElement).dataset['dsContainerId']
      const draggedId = evt.dragged.dataset['dsNodeId']
      if (!to || !draggedId) return true
      // Prevent dropping a node inside itself or any of its descendants.
      return !this.store.isDescendant(draggedId as NodeId, to as NodeId)
    }
  }

  deselect(): void {
    this.store.select(null)
  }

  onDrop(event: DsSortableDropEvent): void {
    this.store.applyDrop(event)
  }
}
