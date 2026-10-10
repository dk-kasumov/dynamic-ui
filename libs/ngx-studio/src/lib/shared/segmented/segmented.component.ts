import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input, output } from '@angular/core'

export interface SegmentedOption<Value extends string = string> {
  value: Value
  title: string
  icon?: string
}

@Component({
  selector: 'ds-segmented',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './segmented.component.scss',
  host: { '[class.segmented--icon-only]': 'iconOnly()' },
  template: `
    <div
      class="segmented"
      role="group"
      [style.--ds-segmented-count]="options().length"
      [style.--ds-segmented-index]="activeIndex()"
    >
      <span class="segmented__thumb" aria-hidden="true"></span>
      @for (option of options(); track option.value) {
        <button
          type="button"
          class="segmented__btn"
          [class.segmented__btn--active]="option.value === value()"
          [attr.aria-pressed]="option.value === value()"
          [title]="option.title"
          (click)="valueChange.emit(option.value)"
        >
          @if (option.icon) {
            <span class="material-icons" aria-hidden="true">{{ option.icon }}</span>
          }
          @if (!iconOnly()) {
            <span class="segmented__label">{{ option.title }}</span>
          }
        </button>
      }
    </div>
  `
})
export class SegmentedComponent<Value extends string = string> {
  readonly options = input.required<readonly SegmentedOption<Value>[]>()
  readonly value = input.required<Value>()
  readonly label = input<string>()
  readonly iconOnly = input(false, { transform: booleanAttribute })

  readonly valueChange = output<Value>()

  readonly activeIndex = computed(() => this.options().findIndex(option => option.value === this.value()))
}
