import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input } from '@angular/core'
import type { ComponentDefinition, Studio } from '@dynamic-ui/studio'
import { CanvasPaletteComponent } from './canvas/palette/canvas-palette.component'
import { StudioFacade } from './studio-facade.service'
import { CanvasComponent } from './canvas/canvas.component'
import { StudioHeaderComponent } from './header/studio-header.component'
import { InspectorComponent } from './inspector/inspector.component'

/**
 * Top-level organism. Provides a StudioFacade, binds a Studio instance to it,
 * and lays out the palette sidebar next to the canvas viewport.
 *
 * All design tokens are defined as CSS custom properties on :host — override
 * any --ds-* variable on ds-ngx-studio to retheme the entire studio.
 */
@Component({
  selector: 'ds-ngx-studio',
  standalone: true,
  providers: [StudioFacade],
  imports: [StudioHeaderComponent, CanvasPaletteComponent, CanvasComponent, InspectorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './ngx-studio.component.scss',
  host: {
    '[class.ds-studio--inspecting]': 'inspecting()',
    '[class.ds-studio--picking]': 'picking()'
  },
  template: `
    <ds-studio-header />
    <ds-canvas-palette [components]="paletteComponents()" />
    <ds-canvas />
    @if (inspecting()) {
      <ds-inspector />
    }
    @if (picking()) {
      <div class="ds-pick-hint" role="status">
        <span class="material-icons" aria-hidden="true">ads_click</span>
        Click a component on the canvas to link it · <kbd>Esc</kbd> to cancel
      </div>
    }
  `
})
export class NgxStudioComponent implements OnInit {
  readonly #facade = inject(StudioFacade)

  readonly studio = input.required<Studio>()
  readonly paletteComponents = computed<readonly ComponentDefinition[]>(() => this.studio().getComponents())
  readonly inspecting = computed(() => this.#facade.inspectedId() !== null)
  readonly picking = this.#facade.picking

  ngOnInit(): void {
    this.#facade.bind(this.studio())
  }
}
