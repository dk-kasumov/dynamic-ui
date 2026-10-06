import { ChangeDetectionStrategy, Component, HostListener, inject } from '@angular/core'
import { MatDividerModule } from '@angular/material/divider'
import { InspectorStore } from './inspector-store'
import { InspectorHeaderComponent } from './inspector-header.component'
import { MetaFieldsComponent } from './meta-fields.component'
import { PropsFormComponent } from './props-form.component'

@Component({
  selector: 'ds-inspector',
  standalone: true,
  imports: [
    MatDividerModule,
    InspectorHeaderComponent,
    MetaFieldsComponent,
    PropsFormComponent
  ],
  providers: [InspectorStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './inspector.component.scss',
  template: `
    @let n = store.node();
    @let def = store.definition();
    <div class="scrim" (click)="store.close()" aria-hidden="true"></div>
    <aside class="inspector" role="dialog" aria-label="Component settings">
      <ds-inspector-header
        [icon]="store.icon()"
        [name]="def.name"
        [label]="def.label"
        (close)="store.close()"
      />

      <div class="inspector__body">
        <section class="inspector__section">
          <h3 class="inspector__section-title">Appearance</h3>
          <ds-meta-fields
            [node]="n"
            [definition]="def"
            [effectiveIcon]="store.icon()"
            (change)="store.setMeta(n.id, $event)"
          />
        </section>

        <mat-divider />

        <section class="inspector__section">
          <h3 class="inspector__section-title">Props</h3>
          <ds-props-form
            [definition]="def"
            [values]="n.props"
            (change)="store.setProp(n.id, $event)"
          />
        </section>
      </div>
    </aside>
  `
})
export class InspectorComponent {
  protected readonly store = inject(InspectorStore)

  @HostListener('document:keydown.escape')
  close(): void {
    this.store.close()
  }
}
