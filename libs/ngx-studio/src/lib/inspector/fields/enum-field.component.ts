import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core'
import { MatButtonToggleModule } from '@angular/material/button-toggle'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatSelectModule } from '@angular/material/select'
import type { EnumPrimitive } from '@dynamic-ui/studio'
import { ControlErrorsDirective } from './control-errors.directive'

const SEGMENTED_THRESHOLD = 4

@Component({
  selector: 'ds-enum-field',
  standalone: true,
  imports: [MatButtonToggleModule, MatFormFieldModule, MatSelectModule, ControlErrorsDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (useSegmented()) {
      <div class="ds-enum-label">{{ label() }}</div>
      <mat-button-toggle-group class="ds-toggle-group" [value]="effective()" (change)="valueChange.emit($event.value)">
        @for (opt of primitive().options; track opt) {
          <mat-button-toggle [value]="opt">{{ opt }}</mat-button-toggle>
        }
      </mat-button-toggle-group>
      @if (errors().length) {
        @for (message of errors(); track message) {
          <div class="ds-error">{{ message }}</div>
        }
      } @else if (hint(); as text) {
        <div class="ds-hint">{{ text }}</div>
      }
    } @else {
      <mat-form-field appearance="outline" class="ds-field">
        <mat-label>{{ label() }}</mat-label>
        <mat-select
          [dsControlErrors]="errors()"
          [value]="effective() ?? ''"
          (selectionChange)="valueChange.emit($event.value)"
        >
          @for (opt of primitive().options; track opt) {
            <mat-option [value]="opt">{{ opt }}</mat-option>
          }
        </mat-select>
        @if (hint(); as text) {
          <mat-hint>{{ text }}</mat-hint>
        }
        @for (message of errors(); track message) {
          <mat-error>{{ message }}</mat-error>
        }
      </mat-form-field>
    }
  `
})
export class EnumFieldComponent {
  readonly label = input.required<string>()
  readonly primitive = input.required<EnumPrimitive<readonly string[]>>()
  readonly value = input<string | undefined>()
  readonly errors = input<readonly string[]>([])

  readonly valueChange = output<string>()

  readonly effective = computed(() => this.value() ?? this.primitive().default ?? null)
  readonly hint = computed(() => this.primitive().hint ?? this.primitive().description)
  readonly useSegmented = computed(() => this.primitive().options.length <= SEGMENTED_THRESHOLD)
}
