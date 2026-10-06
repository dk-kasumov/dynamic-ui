import { ChangeDetectionStrategy, Component, input, output } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { MatIconButton } from '@angular/material/button'
import { shortName } from '../canvas/icon'

@Component({
  selector: 'ds-inspector-header',
  standalone: true,
  imports: [MatIconModule, MatIconButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './inspector-header.component.scss',
  template: `
    <div class="title-wrap">
      <span class="icon" aria-hidden="true">
        <mat-icon>{{ icon() }}</mat-icon>
      </span>
      <div class="titles">
        <span class="eyebrow">{{ name() }}</span>
        <span class="title">{{ label() || shortName(name()) }}</span>
      </div>
    </div>
    <button mat-icon-button class="close" aria-label="Close" (click)="close.emit()">
      <mat-icon>close</mat-icon>
    </button>
  `
})
export class InspectorHeaderComponent {
  readonly icon = input.required<string>()
  readonly name = input.required<string>()
  readonly label = input<string>()

  readonly close = output<void>()

  readonly shortName = shortName
}
