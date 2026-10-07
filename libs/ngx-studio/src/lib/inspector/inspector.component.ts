import { ChangeDetectionStrategy, Component, HostListener, Signal, computed, inject } from '@angular/core'
import { MatDividerModule } from '@angular/material/divider'
import type { Node, NodeId } from '@dynamic-ui/studio'
import { CanvasStore } from '../canvas/store/canvas-store.service'
import { InspectorHeaderComponent } from './inspector-header.component'
import { MetaFieldsComponent } from './meta-fields.component'
import { PropsFormComponent } from './props-form.component'
import type { InspectorFieldChange } from './field-change'

@Component({
  selector: 'ds-inspector',
  standalone: true,
  imports: [
    MatDividerModule,
    InspectorHeaderComponent,
    MetaFieldsComponent,
    PropsFormComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './inspector.component.scss',
  template: `
    @let n = node();
    @let def = definition();
    <div class="scrim" (click)="close()" aria-hidden="true"></div>
    <aside class="inspector" role="dialog" aria-label="Component settings">
      <ds-inspector-header
        [icon]="icon()"
        [name]="def.name"
        [label]="def.label"
        (close)="close()"
      />

      <div class="inspector__body">
        <section class="inspector__section">
          <h3 class="inspector__section-title">Appearance</h3>
          <ds-meta-fields
            [node]="n"
            [definition]="def"
            [effectiveIcon]="icon()"
            (change)="store.setMeta(n.id, $event)"
          />
        </section>

        <mat-divider />

        <section class="inspector__section">
          <h3 class="inspector__section-title">Props</h3>
          <ds-props-form
            [definition]="def"
            [values]="n.props"
            (change)="onPropChange(n.id, $event)"
          />
        </section>
      </div>
    </aside>
  `
})
export class InspectorComponent {
  protected readonly store = inject(CanvasStore)

  readonly node = this.store.inspectedNode as Signal<Node>
  readonly definition = computed(() => this.store.component(this.node().name)!)
  readonly icon = computed(() => this.store.iconOf(this.node()))

  @HostListener('document:keydown.escape')
  close(): void {
    this.store.closeInspector()
  }

  onPropChange(id: NodeId, change: InspectorFieldChange): void {
    this.store.setProp(id, change.path, change.value)
  }
}
