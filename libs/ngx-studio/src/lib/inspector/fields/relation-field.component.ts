import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select'
import {
  RELATION_OPERATORS,
  Studio,
  type JsonValue,
  type Node,
  type OperatorValue,
  type RelationDescriptor,
  type RelationInstance,
  type RelationRule,
  type RuleOperator,
  type SelectPrimitive
} from '@dynamic-ui/studio'
import { SelectFieldComponent } from './select-field.component'
import { StudioFacade } from '../../studio-facade.service'

@Component({
  selector: 'ds-relation-field',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatSelectModule, SelectFieldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './relation-field.component.scss',
  template: `
    <div class="relation">
      <div class="relation__head">
        <span class="relation__name">{{ title() }}</span>
      </div>

      @if (ruleSet().rules.length) {
        <div class="relation__conditions">
          @for (rule of ruleSet().rules; track $index) {
            @if (!$first) {
              <button type="button" class="relation__joiner" (click)="toggleCombine()" title="Toggle AND / OR">
                {{ ruleSet().combine }}
              </button>
            }
            <div class="relation__rule">
              <div class="relation__rule-head">
                @let target = facade.describeNode(rule.target);
                <button
                  type="button"
                  class="relation__target"
                  title="Pick another target on canvas"
                  (click)="repick($index)"
                  (mouseenter)="facade.highlight([rule.target])"
                  (mouseleave)="facade.clearHighlight()"
                  (focus)="facade.highlight([rule.target])"
                  (blur)="facade.clearHighlight()"
                >
                  <span class="material-icons" aria-hidden="true">ads_click</span>
                  <span class="relation__target-label">
                    {{ target.name }}
                    @if (target.type) {
                      <span class="relation__target-type">{{ target.type }}</span>
                    }
                  </span>
                </button>
                <button type="button" class="relation__remove" (click)="removeAt($index); $event.stopPropagation()">
                  <span class="material-icons" aria-hidden="true">close</span>
                </button>
              </div>
              <div class="relation__rule-body">
                <mat-form-field appearance="outline" class="ds-field relation__op" subscriptSizing="dynamic">
                  <mat-select [value]="rule.operator" (selectionChange)="setOperator($index, $event.value)">
                    @for (op of operators(); track op) {
                      <mat-option [value]="op">{{ labelOf(op) }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
                @switch (valueShape(rule.operator)) {
                  @case ('single') {
                    <mat-form-field appearance="outline" class="ds-field relation__value" subscriptSizing="dynamic">
                      <input
                        matInput
                        [value]="asText(rule.value)"
                        placeholder="Enter a value"
                        (input)="setValue($index, $any($event.target).value)"
                      />
                    </mat-form-field>
                  }
                  @case ('list') {
                    <ds-select-field
                      class="relation__value"
                      label="Values"
                      [primitive]="listPrimitive"
                      [value]="$any(rule.value)"
                      (valueChange)="setValue($index, $any($event))"
                    />
                  }
                }
              </div>
            </div>
          }
        </div>
      }

      <button type="button" class="relation__add" [disabled]="!targets().length" (click)="addCondition()">
        <span class="material-icons" aria-hidden="true">add</span>
        {{ ruleSet().rules.length ? 'Add condition' : 'Add a condition' }}
      </button>
    </div>
  `
})
export class RelationFieldComponent {
  readonly facade = inject(StudioFacade)

  readonly node = input.required<Node>()
  readonly name = input.required<string>()
  readonly descriptor = input.required<RelationDescriptor>()

  readonly title = computed(() => this.descriptor().label ?? Studio.humanize(this.name()))

  readonly listPrimitive = { kind: 'select', multiple: true } as SelectPrimitive<string>

  readonly ruleSet = computed<RelationInstance>(
    () => this.node().relations[this.name()] ?? { combine: 'and', rules: [] }
  )

  readonly operators = computed<RuleOperator[]>(() => {
    const all = Object.keys(RELATION_OPERATORS) as RuleOperator[]
    const allowed = this.descriptor().operators
    return allowed ? all.filter(op => allowed.includes(op)) : all
  })

  readonly targets = computed(() => {
    this.facade.root()
    return this.facade.relationTargets(this.node().id, this.descriptor().targetFilter)
  })

  labelOf(op: RuleOperator): string {
    return RELATION_OPERATORS[op].label
  }

  valueShape(op: RuleOperator): OperatorValue {
    return RELATION_OPERATORS[op].value
  }

  asText(value: JsonValue | undefined): string {
    return value == null ? '' : String(value)
  }

  addCondition(): void {
    this.facade.startPick(
      this.targets().map(n => n.id),
      target => {
        const set = this.ruleSet()
        this.#commit({ ...set, rules: [...set.rules, { target, operator: this.operators()[0]! }] })
      }
    )
  }

  repick(index: number): void {
    this.facade.startPick(
      this.targets().map(n => n.id),
      target => {
        this.#patch(index, rule => ({ ...rule, target }))
      }
    )
  }

  setOperator(index: number, operator: RuleOperator): void {
    this.#patch(index, rule => {
      const value = this.valueShape(operator) === this.valueShape(rule.operator) ? rule.value : undefined
      return { ...rule, operator, value }
    })
  }

  setValue(index: number, value: JsonValue): void {
    this.#patch(index, rule => ({ ...rule, value }))
  }

  removeAt(index: number): void {
    const set = this.ruleSet()
    this.#commit({ ...set, rules: set.rules.filter((_, i) => i !== index) })
  }

  toggleCombine(): void {
    const set = this.ruleSet()
    this.#commit({ ...set, combine: set.combine === 'and' ? 'or' : 'and' })
  }

  #patch(index: number, fn: (rule: RelationRule) => RelationRule): void {
    const set = this.ruleSet()
    this.#commit({ ...set, rules: set.rules.map((rule, i) => (i === index ? fn(rule) : rule)) })
  }

  #commit(set: RelationInstance): void {
    const id = this.node().id
    if (set.rules.length) this.facade.setRelation(id, this.name(), set)
    else this.facade.removeRelation(id, this.name())
  }
}
