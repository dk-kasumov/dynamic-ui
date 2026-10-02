import { Component, TemplateRef, input, output } from '@angular/core';
import { Folder } from './folder.model';
import { FolderItemContext } from './folder-item.directive';
import { FoldersNodeComponent } from './folders-node.component';

@Component({
  selector: 'ds-folders-tree',
  standalone: true,
  imports: [FoldersNodeComponent],
  styleUrl: './folders-tree.component.scss',
  template: `
    @if (folders().length) {
      <ul class="tree">
        @for (folder of folders(); track folder.id) {
          <li>
            <ds-folders-node
              [folder]="folder"
              [selectedId]="selectedId()"
              [forceExpanded]="forceExpanded()"
              [itemTemplate]="itemTemplate()"
              (selected)="selected.emit($event)"
            />
          </li>
        }
      </ul>
    } @else {
      <p class="empty">
        {{ forceExpanded() ? 'Ничего не найдено' : 'Папок пока нет' }}
      </p>
    }
  `,
})
export class FoldersTreeComponent {
  folders = input<Folder[]>([]);
  selectedId = input<Folder['id'] | null>(null);
  forceExpanded = input(false);
  itemTemplate = input<TemplateRef<FolderItemContext> | null>(null);
  selected = output<Folder>();
}
