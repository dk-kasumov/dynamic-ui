import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core'
import { CodeViewerComponent } from '../code/code-viewer.component'
import { OutputActionsComponent } from './output-actions.component'
import { StudioViews } from './studio-views.service'
import { ViewPanelComponent } from './view-panel.component'

/**
 * What the host's adapters make of the AST, as one JSON document keyed by adapter —
 * the same `outputs` the preview receives. An adapter that throws is reported above
 * it and is left out of the document.
 */
@Component({
  selector: 'ds-adapter-view',
  standalone: true,
  imports: [ViewPanelComponent, CodeViewerComponent, OutputActionsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './adapter-view.component.scss',
  template: `
    <ds-view-panel heading="Output" [meta]="meta()">
      <ds-output-actions panelActions [text]="json()" filename="output.json" />
      <div class="output">
        @for (failure of failures(); track failure.key) {
          <div class="error" role="alert">
            <span class="material-icons" aria-hidden="true">error_outline</span>
            <div>
              <div class="error__title">{{ failure.label }} could not map the AST</div>
              <div class="error__message">{{ failure.error }}</div>
            </div>
          </div>
        }
        <ds-code-viewer class="output__code" [value]="json()" />
      </div>
    </ds-view-panel>
  `
})
export class AdapterViewComponent {
  readonly #views = inject(StudioViews)

  readonly json = computed(() => JSON.stringify(this.#views.outputs(), null, 2))
  readonly failures = computed(() => this.#views.results().filter(result => result.error))
  readonly meta = computed(() => {
    const count = this.#views.results().length
    return `${count} ${count === 1 ? 'adapter' : 'adapters'}`
  })
}
