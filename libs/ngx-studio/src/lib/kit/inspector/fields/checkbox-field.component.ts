import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core'
import { MatCheckboxModule } from '@angular/material/checkbox'
import type { CheckboxPrimitive } from '@dynamic-ui/studio'

@Component({
  selector: 'ds-checkbox-field',
  standalone: true,
  imports: [MatCheckboxModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-checkbox
      class="ds-checkbox"
      [checked]="effective()"
      (change)="valueChange.emit($event.checked)"
    >{{ label() }}</mat-checkbox>
  `
})
export class CheckboxFieldComponent {
  readonly label = input.required<string>()
  readonly primitive = input.required<CheckboxPrimitive>()
  readonly value = input<boolean | undefined>()

  readonly valueChange = output<boolean>()

  readonly effective = computed(() => this.value() ?? this.primitive().default ?? false)
}
