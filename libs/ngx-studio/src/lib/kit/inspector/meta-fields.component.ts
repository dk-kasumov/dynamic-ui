import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import type { ComponentDefinition, Node } from '@dynamic-ui/studio'
import { resolveIcon } from '../canvas/icon'

export interface InspectorMetaChange {
  icon?: string | null
  title?: string | null
}

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
          <mat-hint>
            Material Icons ligature, e.g. <code>check_box</code>
          </mat-hint>
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
        <mat-hint>Optional — shown on the canvas card. Leave empty to use the component's default description.</mat-hint>
      </mat-form-field>
    </div>
  `,
  styleUrl: './meta-fields.component.scss'
})
export class MetaFieldsComponent {
  readonly node = input.required<Node>()
  readonly definition = input.required<ComponentDefinition>()

  readonly change = output<InspectorMetaChange>()

  readonly iconValue = computed(() => this.node().icon ?? '')
  readonly titleValue = computed(() => this.node().title ?? '')
  readonly defaultIcon = computed(() => resolveIcon(this.definition()))
  readonly effectiveIcon = computed(() => this.node().icon?.trim() || this.defaultIcon())

  onIconInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value.trim()
    this.change.emit({ icon: raw || null })
  }

  onTitleInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value
    this.change.emit({ title: raw || null })
  }
}
