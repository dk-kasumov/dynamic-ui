import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core'
import type { ComponentDefinition, Primitive } from '@dynamic-ui/studio'
import { Studio } from '@dynamic-ui/studio'
import { listify } from 'radash'
import { FieldHostComponent } from './fields/field-host.component'
import type { InspectorFieldChange } from './field-change'

@Component({
  selector: 'ds-props-form',
  standalone: true,
  imports: [FieldHostComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (entries().length) {
      <div class="form">
        @for (entry of entries(); track entry.key) {
          <ds-field-host
            [primitive]="entry.primitive"
            [value]="valueOf(entry.key)"
            [label]="entry.label"
            [path]="[entry.key]"
            (change)="change.emit($event)"
          />
        }
      </div>
    } @else {
      <p class="form__empty">This component has no configurable props.</p>
    }
  `,
  styleUrl: './props-form.component.scss'
})
export class PropsFormComponent {
  readonly definition = input.required<ComponentDefinition>()
  readonly values = input.required<Record<string, unknown>>()

  // TODO: rename — native `change` from inner <input> bubbles to the host and reaches the same handler
  // eslint-disable-next-line @angular-eslint/no-output-native
  readonly change = output<InspectorFieldChange>()

  readonly entries = computed(() =>
    listify(this.definition().props as Record<string, Primitive>, (key, primitive) => ({
      key,
      primitive,
      label: primitive.label ?? Studio.humanize(key)
    }))
  )

  valueOf(key: string): unknown {
    return this.values()[key]
  }
}
