import { Directive, TemplateRef, inject } from '@angular/core'
import type { Node } from '@dynamic-ui/studio'

export interface StudioPreviewContext {
  $implicit: Node
  outputs: Record<string, unknown>
}

@Directive({ selector: 'ng-template[dsStudioPreview]', standalone: true })
export class StudioPreviewDirective {
  readonly template = inject<TemplateRef<StudioPreviewContext>>(TemplateRef)

  static ngTemplateContextGuard(_directive: StudioPreviewDirective, context: unknown): context is StudioPreviewContext {
    return true
  }
}
