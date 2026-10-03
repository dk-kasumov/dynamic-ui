import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core'
import { MatChipsModule, type MatChipInputEvent } from '@angular/material/chips'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import type { SelectPrimitive } from '@dynamic-ui/studio'

@Component({
  selector: 'ds-select-field',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatChipsModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (multiple()) {
      <mat-form-field appearance="outline" class="ds-field" subscriptSizing="dynamic">
        <mat-label>{{ label() }}</mat-label>
        <mat-chip-grid #chipGrid [attr.aria-label]="label()">
          @for (val of values(); track val; let i = $index) {
            <mat-chip-row (removed)="removeAt(i)">
              {{ val }}
              <button matChipRemove [attr.aria-label]="'Remove ' + val">
                <mat-icon>cancel</mat-icon>
              </button>
            </mat-chip-row>
          }
        </mat-chip-grid>
        <input
          [matChipInputFor]="chipGrid"
          [matChipInputAddOnBlur]="true"
          (matChipInputTokenEnd)="addToken($event)"
          placeholder="Add value…"
        />
        <mat-hint>Press Enter or comma to add</mat-hint>
      </mat-form-field>
    } @else {
      <mat-form-field appearance="outline" class="ds-field" subscriptSizing="dynamic">
        <mat-label>{{ label() }}</mat-label>
        <input
          matInput
          type="text"
          [value]="singleValue()"
          [placeholder]="defaultText()"
          (input)="onSingleInput($event)"
        />
      </mat-form-field>
    }
  `
})
export class SelectFieldComponent {
  readonly label = input.required<string>()
  readonly primitive = input.required<SelectPrimitive<string>>()
  readonly value = input<string | string[] | undefined>()

  readonly valueChange = output<string | string[]>()

  readonly multiple = computed(() => this.primitive().multiple === true)

  readonly values = computed<readonly string[]>(() => {
    const v = this.value()
    if (Array.isArray(v)) return v
    if (typeof v === 'string' && v) return [v]
    return []
  })

  readonly singleValue = computed(() => {
    const v = this.value()
    return typeof v === 'string' ? v : ''
  })

  defaultText(): string {
    const def = this.primitive().default
    return Array.isArray(def) ? def.join(', ') : (def ?? '')
  }

  onSingleInput(event: Event): void {
    this.valueChange.emit((event.target as HTMLInputElement).value)
  }

  addToken(event: MatChipInputEvent): void {
    const raw = event.value.trim()
    if (!raw) return
    const next = [...this.values(), raw]
    this.valueChange.emit(next)
    event.chipInput.clear()
  }

  removeAt(index: number): void {
    const next = this.values().filter((_, i) => i !== index)
    this.valueChange.emit(next)
  }
}
