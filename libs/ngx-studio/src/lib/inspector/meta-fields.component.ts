import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import type { ComponentDefinition, Node, NodeMetaPatch } from '@dynamic-ui/studio'
import { StudioFacade } from '../studio-facade.service'
import { iconOrDefault } from '../canvas/icon'

export type InspectorMetaChange = NodeMetaPatch

@Component({
  selector: 'ds-meta-fields',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="meta">
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

      <mat-form-field appearance="outline" class="ds-field" subscriptSizing="dynamic">
        <mat-label>Title</mat-label>
        <input
          matInput
          type="text"
          [value]="titleValue()"
          [placeholder]="definition().description ?? 'Shown as the card subtitle'"
          (input)="onTitleInput($event)"
        />
        <mat-hint
          >Optional — shown on the canvas card. Leave empty to use the component's default description.</mat-hint
        >
      </mat-form-field>
    </div>
  `,
  styleUrl: './meta-fields.component.scss'
})
export class MetaFieldsComponent {
  readonly #facade = inject(StudioFacade)

  readonly node = input.required<Node>()
  readonly definition = input.required<ComponentDefinition>()

  // TODO: rename — native `change` from inner <input> bubbles to the host and reaches the same handler
  // eslint-disable-next-line @angular-eslint/no-output-native
  readonly change = output<InspectorMetaChange>()

  readonly iconValue = computed(() => this.node().icon ?? '')
  readonly titleValue = computed(() => this.node().title ?? '')
  readonly defaultIcon = computed(() => iconOrDefault(this.definition().icon, this.definition()))
  readonly effectiveIcon = computed(() => this.#facade.iconOf(this.node()))

  onIconInput(event: Event): void {
    this.change.emit({ icon: (event.target as HTMLInputElement).value.trim() })
  }

  onTitleInput(event: Event): void {
    this.change.emit({ title: (event.target as HTMLInputElement).value })
  }
}
