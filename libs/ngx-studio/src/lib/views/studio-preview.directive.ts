import { Directive, TemplateRef, inject } from '@angular/core'
import type { Node } from '@dynamic-ui/studio'

/** What the preview template receives. */
export interface StudioPreviewContext {
  /** The current AST root. */
  $implicit: Node
  /** Output of every adapter that ran cleanly, by the key it was registered under. */
  outputs: Record<string, unknown>
}

/**
 * Marks the template the studio renders in its Preview view, so the host can show
 * its own form (or UI) built from the AST and/or from an adapter's output:
 *
 * ```html
 * <ds-ngx-studio [studio]="studio" [adapters]="{ react: reactAdapter }">
 *   <ng-template dsStudioPreview let-ast let-outputs="outputs">
 *     <my-form [schema]="outputs['react']" />
 *   </ng-template>
 * </ds-ngx-studio>
 * ```
 */
@Directive({ selector: 'ng-template[dsStudioPreview]', standalone: true })
export class StudioPreviewDirective {
  readonly template = inject<TemplateRef<StudioPreviewContext>>(TemplateRef)

  static ngTemplateContextGuard(_directive: StudioPreviewDirective, context: unknown): context is StudioPreviewContext {
    return true
  }
}
