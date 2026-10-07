import { Directive, TemplateRef, inject } from '@angular/core'
import { Folder, FolderItem } from './folder.model'

export interface FolderItemContext {
  $implicit: FolderItem
  folder: Folder
}

@Directive({
  selector: 'ng-template[dsFolderItem]',
  standalone: true
})
export class FolderItemDirective {
  readonly template = inject<TemplateRef<FolderItemContext>>(TemplateRef)
}
