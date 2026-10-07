import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  LOCALE_ID,
  computed,
  effect,
  inject,
  input,
  output
} from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms'
import { MAT_DATE_FORMATS } from '@angular/material/core'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import type { DatePrimitive, DateRange } from '@dynamic-ui/studio'
import { dateFormatsFrom, fromIsoDate, provideDateFnsFieldAdapter, toDatePattern, toIsoDate } from './date-format'

type DateValue = string | DateRange | null

@Component({
  selector: 'ds-date-field',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatDatepickerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideDateFnsFieldAdapter(),
    {
      provide: MAT_DATE_FORMATS,
      useFactory: () => {
        const host = inject(DateFieldComponent)
        return dateFormatsFrom(() => host.pattern())
      }
    }
  ],
  // Each mode gets its own form field: the range input must be a static child of its field to register as its control.
  template: `
    @if (range()) {
      <mat-form-field appearance="outline" class="ds-field">
        <mat-label>{{ label() }}</mat-label>
        <mat-date-range-input [formGroup]="rangeControl" [rangePicker]="rangePicker">
          <input matStartDate formControlName="start" [placeholder]="startPlaceholder()" />
          <input matEndDate formControlName="end" [placeholder]="endPlaceholder()" />
        </mat-date-range-input>
        <mat-datepicker-toggle matSuffix [for]="rangePicker" />
        <mat-date-range-picker #rangePicker />
        @if (primitive().hint ?? primitive().description; as hint) {
          <mat-hint>{{ hint }}</mat-hint>
        }
      </mat-form-field>
    } @else {
      <mat-form-field appearance="outline" class="ds-field">
        <mat-label>{{ label() }}</mat-label>
        <input matInput [formControl]="control" [matDatepicker]="picker" [placeholder]="pattern().toLowerCase()" />
        <mat-datepicker-toggle matSuffix [for]="picker" />
        <mat-datepicker #picker />
        @if (primitive().hint ?? primitive().description; as hint) {
          <mat-hint>{{ hint }}</mat-hint>
        }
      </mat-form-field>
    }
  `
})
export class DateFieldComponent {
  readonly label = input.required<string>()
  readonly primitive = input.required<DatePrimitive>()
  readonly value = input<DateValue | undefined>()

  readonly valueChange = output<DateValue>()

  private readonly locale = inject(LOCALE_ID)

  readonly range = computed(() => this.primitive().range ?? false)
  readonly pattern = computed(() => toDatePattern(this.primitive().format, this.locale))
  readonly startPlaceholder = computed(() => `Start ${this.pattern().toLowerCase()}`)
  readonly endPlaceholder = computed(() => `End ${this.pattern().toLowerCase()}`)

  readonly control = new FormControl<Date | null>(null)
  readonly rangeControl = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null)
  })

  constructor() {
    const destroyRef = inject(DestroyRef)

    effect(() => {
      const value = this.value() ?? this.primitive().default ?? null
      if (this.range()) {
        const { start, end } = isRange(value) ? value : { start: null, end: null }
        this.rangeControl.setValue({ start: fromIsoDate(start), end: fromIsoDate(end) }, { emitEvent: false })
      } else {
        this.control.setValue(typeof value === 'string' ? fromIsoDate(value) : null, { emitEvent: false })
      }
    })

    this.control.valueChanges.pipe(takeUntilDestroyed(destroyRef)).subscribe(date => {
      this.valueChange.emit(toIsoDate(date))
    })

    this.rangeControl.valueChanges.pipe(takeUntilDestroyed(destroyRef)).subscribe(({ start, end }) => {
      this.valueChange.emit({ start: toIsoDate(start), end: toIsoDate(end) })
    })
  }
}

function isRange(value: DateValue): value is DateRange {
  return typeof value === 'object' && value !== null
}
