import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core'
import type { ComponentDefinition } from '@dynamic-ui/studio'
import { objectify } from 'radash'
import type { Options } from 'sortablejs'
import type { Folder, FolderItem } from '../../folders-sidebar/folder.model'
import { FolderItemDirective } from '../../folders-sidebar/folder-item.directive'
import { FoldersSidebarComponent } from '../../folders-sidebar/folders-sidebar.component'
import { resolveIcon } from '../icon'
import { CanvasStore } from '../store/canvas-store.service'
import { DsSortableDirective, type DsSortableDropEvent } from '../sortable/sortable.directive'

@Component({
  selector: 'ds-canvas-palette',
  standalone: true,
  imports: [FoldersSidebarComponent, FolderItemDirective, DsSortableDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './canvas-palette.component.scss',
  template: `
    <ds-folders-sidebar [folders]="folders()">
      <ng-template dsFolderItem let-item>
        @let def = defOf(item);
        @if (def) {
          <div class="chip-slot" dsSortable [options]="sortOptions" (dsSortableDrop)="onDrop($event)">
            <div class="chip ds-sortable-item" [attr.data-ds-palette-name]="def.name">
              <span class="chip__icon">
                <span class="material-icons" aria-hidden="true">{{ resolveIcon(def) }}</span>
              </span>
              <div class="chip__text">
                <span class="chip__title">{{ def.label || item.name }}</span>
                @if (def.description) {
                  <span class="chip__sub">{{ def.description }}</span>
                }
              </div>
              @if (store.isContainer(def)) {
                <span class="chip__badge" title="Контейнер">
                  <span class="material-icons" aria-hidden="true">account_tree</span>
                </span>
              }
            </div>
          </div>
        }
      </ng-template>
    </ds-folders-sidebar>
  `
})
export class CanvasPaletteComponent {
  readonly store = inject(CanvasStore)

  readonly components = input.required<readonly ComponentDefinition[]>()

  // objectify replaces `new Map(arr.map())` — plain object lookup is faster and terser
  readonly #byName = computed(() => objectify(this.components(), c => c.name))
  readonly folders = computed<Folder[]>(() => componentsToFolders(this.components()))

  readonly resolveIcon = resolveIcon

  readonly sortOptions: Partial<Options> = {
    group: { name: 'ds-canvas', pull: 'clone', put: false },
    sort: false,
    draggable: '.ds-sortable-item'
  }

  defOf(item: FolderItem): ComponentDefinition | undefined {
    return this.#byName()[String(item.id)]
  }

  onDrop(event: DsSortableDropEvent): void {
    this.store.applyDrop(event)
  }
}

// Builds a nested Folder tree from flat component names like 'Controls/TextInput'.
// Supports arbitrary nesting depth.
function componentsToFolders(components: readonly ComponentDefinition[]): Folder[] {
  type FolderNode = { children: Record<string, FolderNode>; items: FolderItem[] }

  const root: FolderNode = { children: {}, items: [] }

  for (const c of components) {
    const parts = c.name.split('/')
    const leaf = parts.pop()!
    let node = root
    for (const part of parts) {
      node.children[part] ??= { children: {}, items: [] }
      node = node.children[part]!
    }
    node.items.push({ id: c.name, name: leaf })
  }

  const build = (node: FolderNode, prefix: string): Folder[] =>
    Object.entries(node.children).map(([seg, child]) => {
      const id = prefix ? `${prefix}/${seg}` : seg
      return {
        id,
        name: seg,
        children: Object.keys(child.children).length ? build(child, id) : undefined,
        items: child.items.length ? child.items : undefined
      }
    })

  const folders = build(root, '')
  if (root.items.length) folders.unshift({ id: '_root', name: '', items: root.items })
  return folders
}
