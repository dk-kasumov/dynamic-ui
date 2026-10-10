import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { SegmentedComponent, type SegmentedOption } from '../shared/segmented/segmented.component'
import { StudioTheme, type ThemePreference } from './studio-theme.service'

const OPTIONS: readonly SegmentedOption<ThemePreference>[] = [
  { value: 'system', title: 'System theme', icon: 'brightness_auto' },
  { value: 'light', title: 'Light theme', icon: 'light_mode' },
  { value: 'dark', title: 'Dark theme', icon: 'dark_mode' }
]

@Component({
  selector: 'ds-theme-toggle',
  standalone: true,
  imports: [SegmentedComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ds-segmented
      label="Color theme"
      iconOnly
      [options]="options"
      [value]="theme.preference()"
      (valueChange)="theme.set($event)"
    />
  `
})
export class ThemeToggleComponent {
  readonly theme = inject(StudioTheme)
  readonly options = OPTIONS
}
