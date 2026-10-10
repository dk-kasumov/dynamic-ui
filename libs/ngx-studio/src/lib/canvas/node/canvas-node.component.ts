import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core'
import type { NodeId } from '@dynamic-ui/studio'
import { StudioFacade } from '../../studio-facade.service'
import { DsSortableDirective } from '../sortable/sortable.directive'

interface LinkBadge {
  direction: 'out' | 'in'
  icon: string
  ids: NodeId[]
  hint: string
}

@Component({
  selector: 'ds-canvas-node',
  standalone: true,
  imports: [DsSortableDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './canvas-node.component.scss',
  template: `
    @let n = node();
    @let def = component();
    <article
      class="card"
      [class.card--selected]="isSelected()"
      [class.card--container]="container()"
      [class.card--pickable]="facade.picking() && pickable()"
      [class.card--dimmed]="facade.picking() && !pickable()"
      [class.card--linked]="facade.isHighlighted(nodeId())"
      (click)="onSelect($event)"
    >
      <header class="card__head ds-sortable-handle">
        <span class="card__grip" aria-hidden="true">
          <span class="material-icons">drag_indicator</span>
        </span>
        <span class="card__icon">
          <span class="material-icons" aria-hidden="true">{{ icon() }}</span>
        </span>
        <div class="card__titles">
          <div class="card__title-row">
            <span class="card__title">{{ def.label }}</span>
            @if (n.fieldName; as fieldName) {
              <code class="card__field-name" [attr.title]="'Field name: ' + fieldName">{{ fieldName }}</code>
            }
          </div>
          @if (subtitle(); as sub) {
            <span class="card__subtitle">{{ sub }}</span>
          }
        </div>
        @if (errors().length) {
          <button type="button" class="card__error" [attr.title]="errorHint()" (click)="onEdit($event)">
            <span class="material-icons" aria-hidden="true">error</span>
            {{ errors().length }}
          </button>
        }
        @for (badge of linkBadges(); track badge.direction) {
          <span
            class="card__link"
            [class.card__link--out]="badge.direction === 'out'"
            [class.card__link--in]="badge.direction === 'in'"
            tabindex="0"
            [attr.title]="badge.hint"
            (mouseenter)="facade.highlight(badge.ids)"
            (mouseleave)="facade.clearHighlight()"
            (focus)="facade.highlight(badge.ids)"
            (blur)="facade.clearHighlight()"
          >
            <span class="material-icons" aria-hidden="true">{{ badge.icon }}</span>
            {{ badge.ids.length }}
          </span>
        }
        <button
          type="button"
          class="card__action card__action--edit"
          [class.card__action--active]="isInspected()"
          (click)="onEdit($event)"
        >
          <span class="material-icons" aria-hidden="true">tune</span>
        </button>
        <button type="button" class="card__action card__action--delete" (click)="onRemove($event)">
          <span class="material-icons" aria-hidden="true">close</span>
        </button>
      </header>

      @if (container()) {
        <section class="card__body">
          <div
            class="dropzone"
            dsSortable
            [options]="facade.treeSortOptions"
            [attr.data-ds-container-id]="n.id"
            (dsSortableDrop)="facade.applyDrop($event)"
          >
            @for (child of n.children; track child.id) {
              <div class="dropzone__item ds-sortable-item" [attr.data-ds-node-id]="child.id">
                <ds-canvas-node [nodeId]="child.id" />
              </div>
            } @empty {
              <div class="dropzone__empty">
                <span class="material-icons dropzone__empty-icon" aria-hidden="true">add</span>
                <span>Drop a component here</span>
              </div>
            }
          </div>
        </section>
      }
    </article>
  `
})
export class CanvasNodeComponent {
  readonly facade = inject(StudioFacade)

  readonly nodeId = input.required<NodeId>()
  readonly node = this.facade.nodeSignal(() => this.nodeId())
  readonly component = computed(() => this.facade.component(this.node().name)!)

  readonly container = computed(() => !!this.component().container)
  readonly isSelected = computed(() => this.facade.selectedId() === this.nodeId())
  readonly isInspected = computed(() => this.facade.inspectedId() === this.nodeId())
  readonly pickable = computed(() => this.facade.pickable(this.nodeId()))

  readonly icon = computed(() => this.facade.iconOf(this.node()))

  readonly errors = computed(() => this.facade.errorsOf(this.nodeId()))
  readonly errorHint = computed(() =>
    this.errors()
      .map(error => `${error.label}: ${error.messages.join(', ')}`)
      .join('\n')
  )

  readonly subtitle = computed(() => this.node().title ?? this.component().description)

  readonly linkBadges = computed<LinkBadge[]>(() => {
    const { to, from } = this.facade.linksOf(this.nodeId())
    const names = (ids: NodeId[]) => ids.map(id => this.facade.nodeLabel(id)).join(', ')
    const badges: LinkBadge[] = []
    if (to.length) badges.push({ direction: 'out', icon: 'call_made', ids: to, hint: `Depends on ${names(to)}` })
    if (from.length) badges.push({ direction: 'in', icon: 'call_received', ids: from, hint: `Used by ${names(from)}` })
    return badges
  })

  onSelect(event: MouseEvent): void {
    event.stopPropagation()
    if (this.facade.picking()) {
      this.facade.resolvePick(this.nodeId())
      return
    }
    this.facade.select(this.nodeId())
  }

  onEdit(event: MouseEvent): void {
    event.stopPropagation()
    this.facade.inspect(this.nodeId())
  }

  onRemove(event: MouseEvent): void {
    event.stopPropagation()
    this.facade.removeNode(this.nodeId())
  }
}
