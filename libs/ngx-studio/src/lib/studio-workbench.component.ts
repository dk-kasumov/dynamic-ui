import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, inject, input } from '@angular/core'
import type { ComponentDefinition, Studio } from '@dynamic-ui/studio'
import { CanvasPaletteComponent } from './kit/canvas/palette/canvas-palette.component'
import { CanvasStore } from './kit/canvas/store/canvas-store.service'
import { CanvasComponent } from './kit/canvas/canvas.component'

/**
 * Top-level organism. Provides CanvasStore, binds a Studio instance to it,
 * and lays out the palette sidebar next to the canvas viewport.
 *
 * All design tokens are defined as CSS custom properties on :host — override
 * any --ds-* variable on ds-studio-workbench to retheme the entire studio.
 */
@Component({
  selector: 'ds-studio-workbench',
  standalone: true,
  providers: [CanvasStore],
  imports: [CanvasPaletteComponent, CanvasComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './studio-workbench.component.scss',
  template: `
    <ds-canvas-palette [components]="paletteComponents()" />
    <ds-canvas />
  `
})
export class StudioWorkbenchComponent implements OnInit, OnDestroy {
  readonly #store = inject(CanvasStore)

  readonly studio = input.required<Studio>()
  readonly paletteComponents = computed<readonly ComponentDefinition[]>(() => this.studio().getComponents())

  #unsubscribe: (() => void) | null = null

  ngOnInit(): void {
    this.#unsubscribe = this.#store.bind(this.studio())
  }

  ngOnDestroy(): void {
    this.#unsubscribe?.()
    this.#unsubscribe = null
  }
}
