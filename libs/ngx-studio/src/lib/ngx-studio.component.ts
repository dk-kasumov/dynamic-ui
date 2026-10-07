import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  contentChild,
  effect,
  inject,
  input
} from '@angular/core'
import type { ComponentDefinition, Studio, StudioAdapter } from '@dynamic-ui/studio'
import { CanvasPaletteComponent } from './canvas/palette/canvas-palette.component'
import { StudioFacade } from './studio-facade.service'
import { CanvasComponent } from './canvas/canvas.component'
import { StudioHeaderComponent } from './header/studio-header.component'
import { InspectorComponent } from './inspector/inspector.component'
import { StudioTheme } from './theme/studio-theme.service'
import { AdapterViewComponent } from './views/adapter-view.component'
import { AstViewComponent } from './views/ast-view.component'
import { PreviewViewComponent } from './views/preview-view.component'
import { StudioPreviewDirective } from './views/studio-preview.directive'
import { StudioViews } from './views/studio-views.service'

/**
 * Top-level organism. Provides a StudioFacade, binds a Studio instance to it,
 * and lays out the palette sidebar next to the canvas viewport. The other views
 * (AST, Preview, adapter output) replace the canvas and take the full width.
 *
 * All design tokens are defined as CSS custom properties on :host — override
 * any --ds-* variable on ds-ngx-studio to retheme the entire studio.
 */
@Component({
  selector: 'ds-ngx-studio',
  standalone: true,
  providers: [StudioFacade, StudioViews],
  imports: [
    StudioHeaderComponent,
    CanvasPaletteComponent,
    CanvasComponent,
    InspectorComponent,
    AstViewComponent,
    AdapterViewComponent,
    PreviewViewComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './ngx-studio.component.scss',
  host: {
    '[class.ds-studio--inspecting]': 'inspecting()',
    '[class.ds-studio--focus]': "view() !== 'canvas'",
    '[class.ds-studio--picking]': 'picking()',
    '[attr.data-theme]': 'theme.resolved()'
  },
  template: `
    <ds-studio-header />
    <ds-canvas-palette [components]="paletteComponents()" />
    @switch (view()) {
      @case ('ast') {
        <ds-ast-view />
      }
      @case ('adapter') {
        <ds-adapter-view />
      }
      @case ('preview') {
        @if (previewSlot(); as slot) {
          <ds-preview-view [template]="slot.template" />
        }
      }
      @default {
        <ds-canvas />
      }
    }
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
  readonly #views = inject(StudioViews)
  protected readonly theme = inject(StudioTheme)

  readonly studio = input.required<Studio>()
  /** Adapters that map the AST for the host, by key; each shows up in the Output view. */
  readonly adapters = input<Readonly<Record<string, StudioAdapter>>>({})
  /** The host's `<ng-template dsStudioPreview>`, which enables the Preview view. */
  readonly previewSlot = contentChild(StudioPreviewDirective)

  readonly paletteComponents = computed<readonly ComponentDefinition[]>(() => this.studio().getComponents())
  readonly view = this.#views.current
  // The inspector belongs to the canvas; it comes back with it.
  readonly inspecting = computed(() => this.#facade.inspectedId() !== null && this.view() === 'canvas')
  readonly picking = this.#facade.picking

  constructor() {
    effect(() => {
      this.#views.adapters.set(this.adapters())
      this.#views.hasPreview.set(!!this.previewSlot())
    })
  }

  ngOnInit(): void {
    this.#facade.bind(this.studio())
  }
}
