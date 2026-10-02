import { NgTemplateOutlet } from '@angular/common'
import { Component, TemplateRef, computed, input, output, signal } from '@angular/core'
import { Folder, FolderItem } from './folder.model'
import { FolderItemContext } from './folder-item.directive'

const DRAG_MIME = 'application/x-ds-folder-item'

@Component({
  selector: 'ds-folders-node',
  standalone: true,
  imports: [NgTemplateOutlet],
  styleUrl: './folders-node.component.scss',
  template: `
    <div
      class="row"
      [class.row--active]="selectedId() === folder().id"
      [style.--level]="level()"
      (dragover)="onDragOver($event)"
      (dragleave)="onDragLeave($event)"
    >
      @if (hasContent()) {
        <button
          type="button"
          class="toggle"
          [class.toggle--open]="expanded()"
          [attr.aria-expanded]="expanded()"
          [attr.aria-label]="(expanded() ? 'Свернуть ' : 'Развернуть ') + folder().name"
          (click)="toggle()"
        ></button>
      } @else {
        <span class="toggle-spacer"></span>
      }

      <button type="button" class="label" (click)="select()">
        <svg class="icon" viewBox="0 0 16 16" aria-hidden="true">
          <path
            d="M1.5 3.5A1 1 0 0 1 2.5 2.5h3.1l1.4 1.5h6.5a1 1 0 0 1 1 1v7.5a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1z"
            fill="currentColor"
          />
        </svg>
        <span class="name">{{ folder().name }}</span>
      </button>
    </div>

    @if (hasContent() && expanded()) {
      <ul class="children">
        @for (child of folder().children; track child.id) {
          <li>
            <ds-folders-node
              [folder]="child"
              [level]="level() + 1"
              [selectedId]="selectedId()"
              [forceExpanded]="forceExpanded()"
              [itemTemplate]="itemTemplate()"
              (selected)="selected.emit($event)"
              (itemMoved)="itemMoved.emit($event)"
            />
          </li>
        }

        @for (item of folder().items; track item.id) {
          <li
            class="item"
            draggable="true"
            [style.--level]="level() + 1"
            (dragstart)="onItemDragStart($event, item)"
            (dragover)="onItemDragOver($event, item)"
            (dragleave)="onItemDragLeave($event, item)"
            (drop)="onItemDrop($event, item)"
          >
            <span class="toggle-spacer"></span>
            <ng-container
              [ngTemplateOutlet]="itemTemplate() ?? defaultItem"
              [ngTemplateOutletContext]="{ $implicit: item, folder: folder() }"
            />
          </li>
        }
      </ul>
    }

    <ng-template #defaultItem let-item>
      <span class="item__default">
        <svg class="icon" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M3.5 1.5h5l4 4v8a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1z" fill="currentColor" />
        </svg>
        <span class="name">{{ item.name }}</span>
      </span>
    </ng-template>
  `
})
export class FoldersNodeComponent {
  folder = input.required<Folder>()
  level = input(0)
  selectedId = input<Folder['id'] | null>(null)
  forceExpanded = input(false)
  itemTemplate = input<TemplateRef<FolderItemContext> | null>(null)

  selected = output<Folder>()

  private isOpen = signal(false)

  hasContent = computed(() => !!this.folder().children?.length || !!this.folder().items?.length)
  expanded = computed(() => this.forceExpanded() || this.isOpen())

  toggle() {
    this.isOpen.update(open => !open)
  }

  select() {
    this.selected.emit(this.folder())
    if (this.hasContent()) this.toggle()
  }

  isDragOver = signal(false)

  onItemDragStart(event: DragEvent, item: FolderItem) {
    if (!event.dataTransfer) return
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData(DRAG_MIME, JSON.stringify({ itemId: item.id, fromFolderId: this.folder().id }))
  }

  onDragOver(event: DragEvent) {
    if (!event.dataTransfer?.types.includes(DRAG_MIME)) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    this.isDragOver.set(true)
  }

  onDragLeave(event: DragEvent) {
    const row = event.currentTarget as HTMLElement
    if (!row.contains(event.relatedTarget as Node)) this.isDragOver.set(false)
  }
}
