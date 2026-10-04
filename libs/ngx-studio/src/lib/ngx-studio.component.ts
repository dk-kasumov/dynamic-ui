import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, inject, input } from '@angular/core'
import type { ComponentDefinition, Studio } from '@dynamic-ui/studio'
import { CanvasPaletteComponent } from './canvas/palette/canvas-palette.component'
import { CanvasStore } from './canvas/store/canvas-store.service'
import { CanvasComponent } from './canvas/canvas.component'
import { StudioHeaderComponent } from './header/studio-header.component'
import { InspectorComponent } from './inspector/inspector.component'

/**
 * Top-level organism. Provides CanvasStore, binds a Studio instance to it,
 * and lays out the palette sidebar next to the canvas viewport.
 *
 * All design tokens are defined as CSS custom properties on :host — override
 * any --ds-* variable on ds-ngx-studio to retheme the entire studio.
 */
@Component({
  selector: 'ds-ngx-studio',
  standalone: true,
  providers: [CanvasStore],
  imports: [StudioHeaderComponent, CanvasPaletteComponent, CanvasComponent, InspectorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './ngx-studio.component.scss',
  host: {
    '[class.ds-studio--inspecting]': 'inspecting()'
  },
  template: `
    <ds-studio-header />
    <ds-canvas-palette [components]="paletteComponents()" />
    <ds-canvas />
    @if (inspecting()) {
      <ds-inspector />
    }
  `
})
export class NgxStudioComponent implements OnInit, OnDestroy {
  readonly #store = inject(CanvasStore)

  readonly studio = input.required<Studio>()
  readonly paletteComponents = computed<readonly ComponentDefinition[]>(() => this.studio().getComponents())
  readonly inspecting = computed(() => this.#store.inspectedId() !== null)

  #unsubscribe: (() => void) | null = null

  ngOnInit(): void {
    this.#unsubscribe = this.#store.bind(this.studio())
  }

  ngOnDestroy(): void {
    this.#unsubscribe?.()
    this.#unsubscribe = null
  }
}
