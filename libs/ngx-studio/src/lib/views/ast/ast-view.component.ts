import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core'
import { walk } from '@dynamic-ui/studio'
import { CodeViewerComponent } from '../../code/code-viewer.component'
import { StudioFacade } from '../../studio-facade.service'
import { OutputActionsComponent } from '../shared/output-actions.component'
import { ViewPanelComponent } from '../shared/view-panel.component'

@Component({
  selector: 'ds-ast-view',
  standalone: true,
  imports: [ViewPanelComponent, CodeViewerComponent, OutputActionsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './ast-view.component.scss',
  template: `
    <ds-view-panel heading="AST" [meta]="meta()">
      <ds-output-actions panelActions [text]="json()" filename="ast.json" />
      <ds-code-viewer [value]="json()" />
    </ds-view-panel>
  `
})
export class AstViewComponent {
  readonly #facade = inject(StudioFacade)

  readonly json = computed(() => {
    const root = this.#facade.root()
    return root ? JSON.stringify(root, null, 2) : ''
  })
  readonly meta = computed(() => {
    const root = this.#facade.root()
    const count = root ? Array.from(walk(root)).length : 0
    return `${count} ${count === 1 ? 'node' : 'nodes'}`
  })
}
