import { ChangeDetectionStrategy, Component } from '@angular/core'
import { ThemeToggleComponent } from '../theme/theme-toggle.component'
import { ViewSwitcherComponent } from '../views/view-switcher.component'

/**
 * Studio toolbar: brand on the left, the view switcher in the middle and global
 * settings (color theme) on the right. The switcher only appears when the studio
 * has more than one view to offer.
 */
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
      <ds-theme-toggle />
    </div>
  `
})
export class StudioHeaderComponent {}
