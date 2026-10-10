import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import type { ComponentDefinition, Node, NodeMetaPatch } from '@dynamic-ui/studio'
import { StudioFacade } from '../../studio-facade.service'
import { iconOrDefault } from '../../shared/icon/icon'

export type InspectorMetaChange = NodeMetaPatch

@Component({
  selector: 'ds-meta-fields',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="meta">
      <mat-form-field appearance="outline" class="ds-field" subscriptSizing="dynamic">
        <mat-label>Field Name</mat-label>
        <input
          matInput
          type="text"
          [value]="fieldNameValue()"
          placeholder="firstName"
          spellcheck="false"
          autocomplete="off"
          (input)="onFieldNameInput($event)"
        />
        <mat-hint>Key of the value in the output, e.g. <code>firstName</code>, <code>lastName</code></mat-hint>
      </mat-form-field>

      <div class="meta__row">
        <div class="meta__icon-preview" [title]="effectiveIcon()">
          <mat-icon>{{ effectiveIcon() }}</mat-icon>
        </div>

        <mat-form-field appearance="outline" class="ds-field" subscriptSizing="dynamic">
          <mat-label>Icon</mat-label>
          <input
            matInput
            type="text"
            [value]="iconValue()"
            [placeholder]="defaultIcon()"
            spellcheck="false"
            autocomplete="off"
            (input)="onIconInput($event)"
          />
          <mat-hint> Material Icons ligature, e.g. <code>check_box</code> </mat-hint>
        </mat-form-field>
      </div>
    </div>
  `,
  styleUrl: './meta-fields.component.scss'
})
export class MetaFieldsComponent {
  readonly #facade = inject(StudioFacade)

  readonly node = input.required<Node>()
  readonly definition = input.required<ComponentDefinition>()

  readonly change = output<InspectorMetaChange>()

  readonly iconValue = computed(() => this.node().icon ?? '')
  readonly fieldNameValue = computed(() => this.node().fieldName ?? '')
  readonly defaultIcon = computed(() => iconOrDefault(this.definition().icon, this.definition()))
  readonly effectiveIcon = computed(() => this.#facade.iconOf(this.node()))

  onIconInput(event: Event): void {
    this.change.emit({ icon: (event.target as HTMLInputElement).value.trim() })
  }

  onFieldNameInput(event: Event): void {
    this.change.emit({ fieldName: (event.target as HTMLInputElement).value })
  }
}
