import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { CanvasNodeComponent } from './node/canvas-node.component'
import { StudioFacade } from '../studio-facade.service'
import { DsSortableDirective } from './sortable/sortable.directive'

@Component({
  selector: 'ds-canvas',
  standalone: true,
  imports: [CanvasNodeComponent, DsSortableDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './canvas.component.scss',
  template: `
    <div class="canvas" (click)="facade.picking() ? facade.cancelPick() : facade.select(null)">
      <div class="canvas__inner">
        @if (facade.root(); as root) {
          <div
            class="canvas__stack"
            dsSortable
            [options]="facade.treeSortOptions"
            [attr.data-ds-container-id]="root.id"
            (dsSortableDrop)="facade.applyDrop($event)"
          >
            @for (child of root.children; track child.id) {
              <div class="canvas__item ds-sortable-item" [attr.data-ds-node-id]="child.id">
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
  readonly facade = inject(StudioFacade)
}
