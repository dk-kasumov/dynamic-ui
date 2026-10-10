import { ChangeDetectionStrategy, Component, HostListener, Signal, computed, inject } from '@angular/core'
import { MatDividerModule } from '@angular/material/divider'
import { MatIconModule } from '@angular/material/icon'
import { MatIconButton } from '@angular/material/button'
import type { Node, NodeId } from '@dynamic-ui/studio'
import { StudioFacade } from '../studio-facade.service'
import { MetaFieldsComponent } from './sections/meta-fields.component'
import { PropsFormComponent } from './sections/props-form.component'
import { RelationsFormComponent } from './sections/relations-form.component'
import type { InspectorFieldChange } from './field-change'

@Component({
  selector: 'ds-inspector',
  standalone: true,
  imports: [
    MatIconModule,
    MatIconButton,
    MatDividerModule,
    MetaFieldsComponent,
    PropsFormComponent,
    RelationsFormComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './inspector.component.scss',
  template: `
    @let n = node();
    @let def = definition();
    <div class="scrim" (click)="close()" aria-hidden="true"></div>
    <aside class="inspector" role="dialog">
      <header class="inspector__head">
        <div class="inspector__title-wrap">
          <span class="inspector__icon" aria-hidden="true">
            <mat-icon>{{ facade.iconOf(n) }}</mat-icon>
          </span>
          <div class="inspector__titles">
            <span class="inspector__eyebrow">{{ def.title }}</span>
            <span class="inspector__title">{{ def.label }}</span>
          </div>
        </div>
        <button mat-icon-button class="inspector__close" (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </header>

      <div class="inspector__body">
        <section class="inspector__section">
          <h3 class="inspector__section-title">Appearance</h3>
          <ds-meta-fields [node]="n" [definition]="def" (change)="facade.setMeta(n.id, $event)" />
        </section>

        <mat-divider />

        <section class="inspector__section">
          <h3 class="inspector__section-title">Props</h3>
          <ds-props-form
            [definition]="def"
            [values]="n.props"
            [errors]="errors()"
            (change)="onPropChange(n.id, $event)"
          />
        </section>

        @if (hasRelations()) {
          <mat-divider />

          <section class="inspector__section">
            <h3 class="inspector__section-title">Behavior</h3>
            <ds-relations-form [definition]="def" [node]="n" />
          </section>
        }
      </div>
    </aside>
  `
})
export class InspectorComponent {
  readonly facade = inject(StudioFacade)

  readonly node = this.facade.inspectedNode as Signal<Node>
  readonly definition = computed(() => this.facade.component(this.node().name)!)
  readonly hasRelations = computed(() => Object.keys(this.definition().relations).length > 0)
  readonly errors = computed(() => this.facade.errorsOf(this.node().id))

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.facade.picking()) this.facade.cancelPick()
    else this.close()
  }

  close(): void {
    this.facade.closeInspector()
  }

  onPropChange(id: NodeId, change: InspectorFieldChange): void {
    this.facade.setProp(id, change.path, change.value)
  }
}
