import { ChangeDetectionStrategy, Component, input, output } from '@angular/core'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import type { DecimalPrimitive } from '@dynamic-ui/studio'

@Component({
  selector: 'ds-decimal-field',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-form-field appearance="outline" class="ds-field">
      <mat-label>{{ label() }}</mat-label>
      <input
        matInput
        type="number"
        [value]="value() ?? ''"
        [attr.min]="primitive().min ?? null"
        [attr.max]="primitive().max ?? null"
        [placeholder]="primitive().default?.toString() ?? ''"
        (input)="onInput($event)"
      />
      @if (primitive().hint ?? primitive().description; as hint) {
        <mat-hint>{{ hint }}</mat-hint>
      }
    </mat-form-field>
  `
})
export class DecimalFieldComponent {
  readonly label = input.required<string>()
  readonly primitive = input.required<DecimalPrimitive>()
  readonly value = input<number | undefined>()

  readonly valueChange = output<number | null>()

  onInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value
    if (raw === '') {
      this.valueChange.emit(null)
      return
    }
    const n = Number(raw)
    if (!Number.isNaN(n)) this.valueChange.emit(n)
  }
}
