import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core'
import type { GroupPrimitive, Primitive } from '@dynamic-ui/studio'
import { Studio } from '@dynamic-ui/studio'
import { listify } from 'radash'
import { CheckboxFieldComponent } from './checkbox-field.component'
import { CodeFieldComponent } from './code-field.component'
import { DateFieldComponent } from './date-field.component'
import { DecimalFieldComponent } from './decimal-field.component'
import { EnumFieldComponent } from './enum-field.component'
import { SelectFieldComponent } from './select-field.component'
import { TextFieldComponent } from './text-field.component'
import { TimeFieldComponent } from './time-field.component'
import type { InspectorFieldChange } from '../field-change'

type GroupShape = GroupPrimitive<Record<string, Primitive>>

@Component({
  selector: 'ds-field-host',
  standalone: true,
  imports: [
    TextFieldComponent,
    DecimalFieldComponent,
    CheckboxFieldComponent,
    EnumFieldComponent,
    SelectFieldComponent,
    CodeFieldComponent,
    TimeFieldComponent,
    DateFieldComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @switch (primitive().kind) {
      @case ('text') {
        <ds-text-field
          [label]="label()"
          [primitive]="$any(primitive())"
          [value]="$any(value())"
          (valueChange)="emit($event)"
        />
      }
      @case ('decimal') {
        <ds-decimal-field
          [label]="label()"
          [primitive]="$any(primitive())"
          [value]="$any(value())"
          (valueChange)="emit($event)"
        />
      }
      @case ('checkbox') {
        <ds-checkbox-field
          [label]="label()"
          [primitive]="$any(primitive())"
          [value]="$any(value())"
          (valueChange)="emit($event)"
        />
      }
      @case ('enum') {
        <ds-enum-field
          [label]="label()"
          [primitive]="$any(primitive())"
          [value]="$any(value())"
          (valueChange)="emit($event)"
        />
      }
      @case ('select') {
        <ds-select-field
          [label]="label()"
          [primitive]="$any(primitive())"
          [value]="$any(value())"
          (valueChange)="emit($event)"
        />
      }
      @case ('code') {
        <ds-code-field
          [label]="label()"
          [primitive]="$any(primitive())"
          [value]="$any(value())"
          (valueChange)="emit($event)"
        />
      }
      @case ('time') {
        <ds-time-field
          [label]="label()"
          [primitive]="$any(primitive())"
          [value]="$any(value())"
          (valueChange)="emit($event)"
        />
      }
      @case ('date') {
        <ds-date-field
          [label]="label()"
          [primitive]="$any(primitive())"
          [value]="$any(value())"
          (valueChange)="emit($event)"
        />
      }
      @case ('group') {
        <fieldset class="group">
          <legend class="group__legend">{{ label() }}</legend>
          <div class="group__body">
            @for (entry of groupEntries(); track entry.key) {
              <ds-field-host
                [primitive]="entry.primitive"
                [value]="groupValueOf(entry.key)"
                [label]="entry.label"
                [path]="[...path(), entry.key]"
                (change)="change.emit($event)"
              />
            }
          </div>
        </fieldset>
      }
      @default {
        <div class="field field--unknown">Unsupported primitive: {{ primitive().kind }}</div>
      }
    }
  `
})
export class FieldHostComponent {
  readonly primitive = input.required<Primitive>()
  readonly value = input<unknown>()
  readonly label = input.required<string>()
  readonly path = input.required<readonly string[]>()

  readonly change = output<InspectorFieldChange>()

  readonly groupEntries = computed(() => {
    return listify((this.primitive() as GroupShape).shape, (key, primitive) => ({
      key,
      primitive,
      label: Studio.humanize(key)
    }))
  })

  emit(value: unknown): void {
    this.change.emit({ path: this.path(), value })
  }

  groupValueOf(key: string): unknown {
    return (this.value() as Record<string, unknown> | undefined)?.[key]
  }
}
