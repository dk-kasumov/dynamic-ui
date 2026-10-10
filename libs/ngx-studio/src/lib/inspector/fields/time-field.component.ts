import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input, output } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatTimepickerModule } from '@angular/material/timepicker'
import type { TimePrimitive } from '@dynamic-ui/studio'
import { fromIsoTime, provideDateFnsFieldAdapter, toIsoTime } from '../../shared/date-format/date-format'

@Component({
  selector: 'ds-time-field',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatTimepickerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideDateFnsFieldAdapter()],
  template: `
    <mat-form-field appearance="outline" class="ds-field">
      <mat-label>{{ label() }}</mat-label>
      <input matInput [formControl]="control" [matTimepicker]="picker" />
      <mat-timepicker-toggle matSuffix [for]="picker" />
      <mat-timepicker #picker />
      @if (primitive().hint ?? primitive().description; as hint) {
        <mat-hint>{{ hint }}</mat-hint>
      }
      @for (message of errors(); track message) {
        <mat-error>{{ message }}</mat-error>
      }
    </mat-form-field>
  `
})
export class TimeFieldComponent {
  readonly label = input.required<string>()
  readonly primitive = input.required<TimePrimitive>()
  readonly value = input<string | undefined>()
  readonly errors = input<readonly string[]>([])

  readonly valueChange = output<string | null>()

  readonly control = new FormControl<Date | null>(null)

  constructor() {
    effect(() => {
      this.control.setValue(fromIsoTime(this.value() ?? this.primitive().default), { emitEvent: false })
    })

    this.control.valueChanges.pipe(takeUntilDestroyed(inject(DestroyRef))).subscribe(time => {
      this.valueChange.emit(toIsoTime(time))
    })
  }
}
