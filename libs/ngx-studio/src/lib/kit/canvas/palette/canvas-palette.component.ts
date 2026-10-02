import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core'
import type { ComponentDefinition } from '@dynamic-ui/studio'
import type { Options } from 'sortablejs'
import type { Folder, FolderItem } from '../../folders-sidebar/folder.model'
import { FolderItemDirective } from '../../folders-sidebar/folder-item.directive'
import { FoldersSidebarComponent } from '../../folders-sidebar/folders-sidebar.component'
import { CanvasIconComponent } from '../canvas-icon.component'
import { CanvasStore } from '../store/canvas-store.service'
import { DsSortableDirective, type DsSortableDropEvent } from '../sortable/sortable.directive'

@Component({
  selector: 'ds-canvas-palette',
  standalone: true,
  imports: [FoldersSidebarComponent, FolderItemDirective, DsSortableDirective, CanvasIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './canvas-palette.component.scss',
  template: `
    <ds-folders-sidebar [folders]="folders()">
      <ng-template dsFolderItem let-item>
        @let def = defOf(item);
        @if (def) {
          <div
            class="chip-slot"
            dsSortable
            [options]="sortOptions"
            (dsSortableDrop)="onDrop($event)"
          >
            <div class="chip ds-sortable-item" [attr.data-ds-palette-name]="def.name">
              <span class="chip__icon"><ds-canvas-icon [name]="def.name" /></span>
              <div class="chip__text">
                <span class="chip__title">{{ def.label || item.name }}</span>
                @if (def.description) {
                  <span class="chip__sub">{{ def.description }}</span>
                }
              </div>
              @if (isContainer(def)) {
                <span class="chip__badge" title="Контейнер">◫</span>
              }
            </div>
          </div>
        }
      </ng-template>
    </ds-folders-sidebar>
  `
})
export class CanvasPaletteComponent {
  readonly #store = inject(CanvasStore)

  readonly components = input.required<readonly ComponentDefinition[]>()

  readonly #byName = computed(() => {
    const map = new Map<string, ComponentDefinition>()
    for (const c of this.components()) map.set(c.name, c)
    return map
  })

  readonly folders = computed<Folder[]>(() => componentsToFolders(this.components()))

  readonly sortOptions: Partial<Options> = {
    group: { name: 'ds-canvas', pull: 'clone', put: false },
    sort: false,
    draggable: '.ds-sortable-item'
  }

  defOf(item: FolderItem): ComponentDefinition | undefined {
    return this.#byName().get(String(item.id))
  }

  isContainer(component: ComponentDefinition): boolean {
    return !!component.children && component.children.cardinality !== 'none'
  }

  onDrop(event: DsSortableDropEvent): void {
    this.#store.applyDrop(event)
  }
}

function componentsToFolders(components: readonly ComponentDefinition[]): Folder[] {
  type Node = { children: Map<string, Node>; items: FolderItem[] }
  const root: Node = { children: new Map(), items: [] }

  for (const c of components) {
    const parts = c.name.split('/')
    const leaf = parts.pop()!
    let node = root
    for (const part of parts) {
      let child = node.children.get(part)
      if (!child) node.children.set(part, child = { children: new Map(), items: [] })
      node = child
    }
    node.items.push({ id: c.name, name: leaf })
  }

  const build = (node: Node, prefix: string): Folder[] =>
    [...node.children.entries()].map(([seg, child]) => {
      const id = prefix ? `${prefix}/${seg}` : seg
      return {
        id,
        name: seg,
        children: child.children.size ? build(child, id) : undefined,
        items: child.items.length ? child.items : undefined
      }
    })

  const folders = build(root, '')
  if (root.items.length) folders.unshift({ id: '_root', name: '', items: root.items })
  return folders
}
