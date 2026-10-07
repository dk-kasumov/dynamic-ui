import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core'
import { MatDividerModule } from '@angular/material/divider'
import type { ComponentDefinition, Node, RelationDescriptorBuiltin } from '@dynamic-ui/studio'
import { listify } from 'radash'
import { RelationFieldComponent } from './fields/relation-field.component'

/** Lists a component's builtin relation slots, one rule builder each. */
@Component({
  selector: 'ds-relations-form',
  standalone: true,
  imports: [RelationFieldComponent, MatDividerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (entries().length) {
      <div class="form">
        @for (entry of entries(); track entry.name; let first = $first) {
          @if (!first) {
            <mat-divider />
          }
          <ds-relation-field [node]="node()" [name]="entry.name" [descriptor]="entry.descriptor" />
        }
      </div>
    } @else {
      <p class="form__empty">This component declares no relations.</p>
    }
  `,
  styles: `
    .form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .form__empty {
      margin: 0;
      color: var(--ds-text-muted);
      font-size: 0.85rem;
    }
    mat-divider {
      margin: 0;
    }
  `
})
export class RelationsFormComponent {
  readonly definition = input.required<ComponentDefinition>()
  readonly node = input.required<Node>()

  readonly entries = computed(() =>
    listify(this.definition().relations, (name, descriptor) => ({ name, descriptor })).filter(
      (entry): entry is { name: string; descriptor: RelationDescriptorBuiltin } =>
        entry.descriptor.variant === 'builtin'
    )
  )
}
