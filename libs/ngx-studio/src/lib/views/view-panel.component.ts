import { ChangeDetectionStrategy, Component, input } from '@angular/core'

/** Frame shared by the read-only views: a slim bar (heading on the left, actions on the right) above the content. */
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
  /** Quiet detail next to the heading, e.g. a count. */
  readonly meta = input<string>()
}
