import { ChangeDetectionStrategy, Component, HostListener, Signal, computed, inject } from '@angular/core'
import { MatDividerModule } from '@angular/material/divider'
import { MatIconModule } from '@angular/material/icon'
import { MatIconButton } from '@angular/material/button'
import type { Node, NodeId } from '@dynamic-ui/studio'
import { CanvasStore } from '../canvas/store/canvas-store.service'
import { shortName } from '../canvas/icon'
import { MetaFieldsComponent } from './meta-fields.component'
import { PropsFormComponent } from './props-form.component'
import type { InspectorFieldChange } from './field-change'

@Component({
  selector: 'ds-inspector',
  standalone: true,
  imports: [MatIconModule, MatIconButton, MatDividerModule, MetaFieldsComponent, PropsFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './inspector.component.scss',
  template: `
    @let n = node();
    @let def = definition();
    <div class="scrim" (click)="close()" aria-hidden="true"></div>
    <aside class="inspector" role="dialog" aria-label="Component settings">
      <header class="inspector__head">
        <div class="inspector__title-wrap">
          <span class="inspector__icon" aria-hidden="true">
            <mat-icon>{{ store.iconOf(n) }}</mat-icon>
          </span>
          <div class="inspector__titles">
            <span class="inspector__eyebrow">{{ def.name }}</span>
            <span class="inspector__title">{{ def.label || shortName(def.name) }}</span>
          </div>
        </div>
        <button mat-icon-button class="inspector__close" aria-label="Close" (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </header>

      <div class="inspector__body">
        <section class="inspector__section">
          <h3 class="inspector__section-title">Appearance</h3>
          <ds-meta-fields [node]="n" [definition]="def" (change)="store.setMeta(n.id, $event)" />
        </section>

        <mat-divider />

        <section class="inspector__section">
          <h3 class="inspector__section-title">Props</h3>
          <ds-props-form [definition]="def" [values]="n.props" (change)="onPropChange(n.id, $event)" />
        </section>
      </div>
    </aside>
  `
})
export class InspectorComponent {
  readonly store = inject(CanvasStore)

  // The studio renders the inspector only while a node is inspected.
  readonly node = this.store.inspectedNode as Signal<Node>
  readonly definition = computed(() => this.store.component(this.node().name)!)

  readonly shortName = shortName

  @HostListener('document:keydown.escape')
  close(): void {
    this.store.closeInspector()
  }

  onPropChange(id: NodeId, change: InspectorFieldChange): void {
    this.store.setProp(id, change.path, change.value)
  }
}
