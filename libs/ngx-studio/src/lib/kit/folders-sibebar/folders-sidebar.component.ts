import { Component, computed, contentChild, input, output, signal } from '@angular/core';
import { Folder } from './folder.model';
import { filterFolders } from './filter-folders';
import { FolderItemDirective } from './folder-item.directive';
import { FoldersSearchComponent } from './folders-search.component';
import { FoldersTreeComponent } from './folders-tree.component';

@Component({
  selector: 'ds-folders-sidebar',
  standalone: true,
  imports: [FoldersSearchComponent, FoldersTreeComponent],
  styleUrl: './folders-sidebar.component.scss',
  template: `
    <aside class="sidebar">
      <ds-folders-search [(value)]="query" />

      <div class="sidebar__tree">
        <ds-folders-tree
          [folders]="filteredFolders()"
          [selectedId]="selectedId()"
          [forceExpanded]="isSearching()"
          [itemTemplate]="itemTpl()?.template ?? null"
          (selected)="onSelect($event)"
        />
      </div>
    </aside>
  `,
})
export class FoldersSidebarComponent {
  folders = input<Folder[]>([]);
  folderSelected = output<Folder>();

  itemTpl = contentChild(FolderItemDirective);

  query = signal('');
  selectedId = signal<Folder['id'] | null>(null);

  isSearching = computed(() => this.query().trim().length > 0);
  filteredFolders = computed(() => filterFolders(this.folders(), this.query()));

  onSelect(folder: Folder) {
    this.selectedId.set(folder.id);
    this.folderSelected.emit(folder);
  }
}
