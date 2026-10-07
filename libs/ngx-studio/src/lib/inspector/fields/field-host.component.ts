import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core'
import type { GroupPrimitive, Primitive } from '@dynamic-ui/studio'
import { Studio } from '@dynamic-ui/studio'
import { listify } from 'radash'
import { CheckboxFieldComponent } from './checkbox-field.component'
import { DecimalFieldComponent } from './decimal-field.component'
import { EnumFieldComponent } from './enum-field.component'
import { SelectFieldComponent } from './select-field.component'
import { TextFieldComponent } from './text-field.component'
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
    SelectFieldComponent
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

  // TODO: rename — native `change` from inner <input> bubbles to the host and reaches the same handler
  // eslint-disable-next-line @angular-eslint/no-output-native
  readonly change = output<InspectorFieldChange>()

  readonly groupEntries = computed(() => {
    return listify((this.primitive() as GroupShape).shape, (key, primitive) => ({
      key,
      primitive,
      label: primitive.label ?? Studio.humanize(key)
    }))
  })

  emit(value: unknown): void {
    this.change.emit({ path: this.path(), value })
  }

  groupValueOf(key: string): unknown {
    return (this.value() as Record<string, unknown> | undefined)?.[key]
  }
}
