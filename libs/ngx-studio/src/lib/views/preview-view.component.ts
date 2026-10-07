import { NgTemplateOutlet } from '@angular/common'
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core'
import { StudioFacade } from '../studio-facade.service'
import type { StudioPreviewContext } from './studio-preview.directive'
import { StudioViews } from './studio-views.service'
import type { TemplateRef } from '@angular/core'

/** Renders the host's own template with the live AST and adapter outputs, on a clean stage. */
@Component({
  selector: 'ds-preview-view',
  standalone: true,
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './preview-view.component.scss',
  template: `
    <div class="preview">
      <div class="preview__stage">
        @if (context(); as ctx) {
          <ng-container *ngTemplateOutlet="template(); context: ctx" />
        }
      </div>
    </div>
  `
})
export class PreviewViewComponent {
  readonly #facade = inject(StudioFacade)
  readonly #views = inject(StudioViews)

  readonly template = input.required<TemplateRef<StudioPreviewContext>>()

  readonly context = computed<StudioPreviewContext | null>(() => {
    const root = this.#facade.root()
    return root ? { $implicit: root, outputs: this.#views.outputs() } : null
  })
}
