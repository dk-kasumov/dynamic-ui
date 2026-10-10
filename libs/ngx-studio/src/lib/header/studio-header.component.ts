import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { StudioFacade } from '../studio-facade.service'
import { ThemeToggleComponent } from '../theme/theme-toggle.component'
import { ViewSwitcherComponent } from '../views/view-switcher.component'

@Component({
  selector: 'ds-studio-header',
  standalone: true,
  imports: [ThemeToggleComponent, ViewSwitcherComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './studio-header.component.scss',
  template: `
    <div class="header__brand">
      <span class="header__dot"></span>
      <span class="header__title">Studio</span>
    </div>
    <div class="header__center">
      <ds-view-switcher />
    </div>
    <div class="header__actions">
      @if (facade.errorCount(); as count) {
        <button type="button" class="header__issues" (click)="highlightErrors()" (mouseleave)="facade.clearHighlight()">
          <span class="material-icons" aria-hidden="true">error</span>
          {{ count }} {{ count === 1 ? 'issue' : 'issues' }}
        </button>
      }
      <ds-theme-toggle />
    </div>
  `
})
export class StudioHeaderComponent {
  readonly facade = inject(StudioFacade)

  highlightErrors(): void {
    this.facade.highlight(this.facade.nodesWithErrors())
  }
}
