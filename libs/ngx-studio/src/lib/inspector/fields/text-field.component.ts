import { ChangeDetectionStrategy, Component, input, output } from '@angular/core'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import type { TextPrimitive } from '@dynamic-ui/studio'
import { ControlErrorsDirective } from './control-errors.directive'

@Component({
  selector: 'ds-text-field',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, ControlErrorsDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-form-field appearance="outline" class="ds-field">
      <mat-label>{{ label() }}</mat-label>
      <input
        matInput
        type="text"
        [dsControlErrors]="errors()"
        [value]="value() ?? ''"
        [placeholder]="primitive().default ?? ''"
        (input)="onInput($event)"
      />
      @if (primitive().hint ?? primitive().description; as hint) {
        <mat-hint>{{ hint }}</mat-hint>
      }
      @for (message of errors(); track message) {
        <mat-error>{{ message }}</mat-error>
      }
    </mat-form-field>
  `
})
export class TextFieldComponent {
  readonly label = input.required<string>()
  readonly primitive = input.required<TextPrimitive>()
  readonly value = input<string | undefined>()
  readonly errors = input<readonly string[]>([])

  readonly valueChange = output<string>()

  onInput(event: Event): void {
    this.valueChange.emit((event.target as HTMLInputElement).value)
  }
}
