import { NgTemplateOutlet } from '@angular/common'
import { Component, TemplateRef, computed, input, output, signal } from '@angular/core'
import { Folder } from '../folder.model'
import { FolderItemContext } from '../folder-item.directive'

@Component({
  selector: 'ds-folders-node',
  standalone: true,
  imports: [NgTemplateOutlet],
  styleUrl: 'folders-node.component.scss',
  template: `
    <div class="row" [class.row--active]="selectedId() === folder().id" [style.--level]="level()">
      @if (hasContent()) {
        <button
          type="button"
          class="toggle"
          [class.toggle--open]="expanded()"
          [attr.aria-expanded]="expanded()"
          (click)="toggle()"
        >
          <span class="material-icons" aria-hidden="true">chevron_right</span>
        </button>
      } @else {
        <span class="toggle-spacer"></span>
      }

      <button type="button" class="label" (click)="select()">
        <span class="icon material-icons" aria-hidden="true">folder</span>
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
            />
          </li>
        }
        @for (item of folder().items; track item.id) {
          <li class="item" [style.--level]="level() + 1">
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
        <span class="icon material-icons" aria-hidden="true">description</span>
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

  #isOpen = signal(false)

  hasContent = computed(() => !!this.folder().children?.length || !!this.folder().items?.length)
  expanded = computed(() => this.forceExpanded() || this.#isOpen())

  toggle() {
    this.#isOpen.update(open => !open)
  }

  select() {
    this.selected.emit(this.folder())
    if (this.hasContent()) this.toggle()
  }
}
