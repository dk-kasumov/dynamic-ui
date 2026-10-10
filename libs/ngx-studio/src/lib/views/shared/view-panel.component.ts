import { ChangeDetectionStrategy, Component, input } from '@angular/core'

@Component({
  selector: 'ds-view-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './view-panel.component.scss',
  template: `
    <section class="panel">
      <header class="panel__bar">
        <div class="panel__lead">
          <span class="panel__title">{{ heading() }}</span>
          @if (meta(); as meta) {
            <span class="panel__meta">{{ meta }}</span>
          }
        </div>
        <div class="panel__actions"><ng-content select="[panelActions]" /></div>
      </header>
      <div class="panel__body"><ng-content /></div>
    </section>
  `
})
export class ViewPanelComponent {
  readonly heading = input.required<string>()
  readonly meta = input<string>()
}
