import { ChangeDetectionStrategy, Component, HostListener, computed, inject } from '@angular/core'
import { MatDividerModule } from '@angular/material/divider'
import { MatIconModule } from '@angular/material/icon'
import { MatIconButton } from '@angular/material/button'
import type { ComponentDefinition, Node } from '@dynamic-ui/studio'
import { CanvasStore } from '../canvas/store/canvas-store.service'
import { resolveIcon } from '../canvas/icon'
import { MetaFieldsComponent, type InspectorMetaChange } from './meta-fields.component'
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
    @if (n && def) {
      <div class="scrim" (click)="close()" aria-hidden="true"></div>
      <aside class="inspector" role="dialog" aria-label="Component settings">
        <header class="inspector__head">
          <div class="inspector__title-wrap">
            <span class="inspector__icon" aria-hidden="true">
              <mat-icon>{{ headerIcon(n, def) }}</mat-icon>
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
            <ds-meta-fields [node]="n" [definition]="def" (change)="onMetaChange(n.id, $event)" />
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
    }
  `
})
export class InspectorComponent {
  readonly store = inject(CanvasStore)

  readonly node = this.store.inspectedNode
  readonly definition = computed<ComponentDefinition | undefined>(() => {
    const n = this.node() as Node | null
    return n ? this.store.component(n.name) : undefined
  })

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.node()) this.close()
  }

  close(): void {
    this.store.closeInspector()
  }

  headerIcon(node: Node, def: ComponentDefinition): string {
    return node.icon ?? resolveIcon(def)
  }

  shortName(fqn: string): string {
    const i = fqn.lastIndexOf('/')
    return i === -1 ? fqn : fqn.slice(i + 1)
  }

  onMetaChange(id: Node['id'], patch: InspectorMetaChange): void {
    this.store.setMeta(id, patch)
  }

  onPropChange(id: Node['id'], change: InspectorFieldChange): void {
    this.store.setProp(id, change.path, change.value)
  }
}
