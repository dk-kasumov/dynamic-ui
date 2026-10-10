import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core'
import { SegmentedComponent, type SegmentedOption } from '../shared/segmented/segmented.component'
import { StudioViews, type StudioView } from './studio-views.service'

const OPTIONS: Record<StudioView, SegmentedOption<StudioView>> = {
  canvas: { value: 'canvas', title: 'Canvas', icon: 'dashboard_customize' },
  ast: { value: 'ast', title: 'AST', icon: 'data_object' },
  preview: { value: 'preview', title: 'Preview', icon: 'visibility' },
  adapter: { value: 'adapter', title: 'Output', icon: 'transform' }
}

@Component({
  selector: 'ds-view-switcher',
  standalone: true,
  imports: [SegmentedComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ds-segmented label="View" [options]="options()" [value]="views.current()" (valueChange)="views.set($event)" />
  `
})
export class ViewSwitcherComponent {
  readonly views = inject(StudioViews)

  readonly options = computed(() => this.views.available().map(view => OPTIONS[view]))
}
