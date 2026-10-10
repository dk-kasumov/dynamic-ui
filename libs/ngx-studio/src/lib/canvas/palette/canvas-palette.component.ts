import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core'
import type { ComponentDefinition } from '@dynamic-ui/studio'
import type { Options } from 'sortablejs'
import type { Folder, FolderItem } from '../../folders-sidebar/folder.model'
import { FolderItemDirective } from '../../folders-sidebar/folder-item.directive'
import { FoldersSidebarComponent } from '../../folders-sidebar/folders-sidebar.component'
import { iconOrDefault } from '../../shared/icon/icon'
import { StudioFacade } from '../../studio-facade.service'
import { DsSortableDirective } from '../sortable/sortable.directive'

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
        <div class="chip-slot" dsSortable [options]="sortOptions" (dsSortableDrop)="facade.applyDrop($event)">
          <div class="chip ds-sortable-item" [attr.data-ds-palette-name]="def.title">
            <span class="chip__icon">
              <span class="material-icons" aria-hidden="true">{{ iconOrDefault(def.icon, def) }}</span>
            </span>
            <div class="chip__text">
              <span class="chip__title">{{ def.label }}</span>
              @if (def.description) {
                <span class="chip__sub">{{ def.description }}</span>
              }
            </div>
            @if (def.container) {
              <span class="chip__badge" title="Контейнер">
                <span class="material-icons" aria-hidden="true">account_tree</span>
              </span>
            }
          </div>
        </div>
      </ng-template>
    </ds-folders-sidebar>
  `
})
export class CanvasPaletteComponent {
  readonly facade = inject(StudioFacade)

  readonly components = input.required<readonly ComponentDefinition[]>()

  readonly folders = computed<Folder[]>(() => componentsToFolders(this.components()))

  readonly iconOrDefault = iconOrDefault

  readonly sortOptions: Partial<Options> = {
    group: { name: 'ds-canvas', pull: 'clone', put: false },
    sort: false,
    draggable: '.ds-sortable-item'
  }

  defOf(item: FolderItem): ComponentDefinition {
    return this.facade.component(String(item.id))!
  }
}

function componentsToFolders(components: readonly ComponentDefinition[]): Folder[] {
  type FolderNode = { children: Record<string, FolderNode>; items: FolderItem[] }

  const root: FolderNode = { children: {}, items: [] }

  for (const c of components) {
    const parts = c.title.split('/')
    const leaf = parts.pop()!
    let node = root
    for (const part of parts) {
      node.children[part] ??= { children: {}, items: [] }
      node = node.children[part]!
    }
    node.items.push({ id: c.title, name: leaf })
  }

  const build = (node: FolderNode, prefix: string): Folder[] =>
    Object.entries(node.children).map(([seg, child]) => {
      const id = prefix ? `${prefix}/${seg}` : seg
      return {
        id,
        name: seg,
        children: build(child, id),
        items: child.items
      }
    })

  const folders = build(root, '')
  if (root.items.length) folders.unshift({ id: '_root', name: '', items: root.items })
  return folders
}
