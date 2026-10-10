import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core'
import { MatCheckboxModule } from '@angular/material/checkbox'
import type { CheckboxPrimitive } from '@dynamic-ui/studio'

@Component({
  selector: 'ds-checkbox-field',
  standalone: true,
  imports: [MatCheckboxModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-checkbox class="ds-checkbox" [checked]="effective()" (change)="valueChange.emit($event.checked)">{{
      label()
    }}</mat-checkbox>
    @if (errors().length) {
      @for (message of errors(); track message) {
        <div class="ds-error">{{ message }}</div>
      }
    } @else if (primitive().hint ?? primitive().description; as hint) {
      <div class="ds-hint">{{ hint }}</div>
    }
  `
})
export class CheckboxFieldComponent {
  readonly label = input.required<string>()
  readonly primitive = input.required<CheckboxPrimitive>()
  readonly value = input<boolean | undefined>()
  readonly errors = input<readonly string[]>([])

  readonly valueChange = output<boolean>()

  readonly effective = computed(() => this.value() ?? this.primitive().default ?? false)
}
