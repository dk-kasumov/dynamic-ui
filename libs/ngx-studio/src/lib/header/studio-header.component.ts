import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core'
import { CanvasStore } from '../canvas/store/canvas-store.service'

/**
 * Studio toolbar. Hosts global canvas actions — currently a single export
 * button; undo/redo and friends will dock here next. Reads the live tree from
 * CanvasStore and downloads it as a JSON snapshot.
 */
@Component({
  selector: 'ds-studio-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './studio-header.component.scss',
  template: `
    <div class="header__brand">
      <span class="header__dot"></span>
      <span class="header__title">Studio</span>
    </div>
    <div class="header__actions">
      <button
        type="button"
        class="header__btn"
        (click)="export()"
        [disabled]="empty()"
        title="Export canvas as JSON"
      >
        <span class="material-icons" aria-hidden="true">download</span>
        <span>Export</span>
      </button>
    </div>
  `
})
export class StudioHeaderComponent {
  readonly #store = inject(CanvasStore)

  readonly empty = computed(() => !this.#store.root()?.children?.length)

  export(): void {
    const root = this.#store.root()
    if (!root) return
    const json = JSON.stringify(root, null, 2)
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }))
    const a = Object.assign(document.createElement('a'), { href: url, download: 'canvas.json' })
    a.click()
    URL.revokeObjectURL(url)
  }
}
