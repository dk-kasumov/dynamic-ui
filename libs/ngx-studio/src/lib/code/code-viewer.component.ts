import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  effect,
  inject,
  input,
  viewChild
} from '@angular/core'
import { defaultKeymap } from '@codemirror/commands'
import { json } from '@codemirror/lang-json'
import { bracketMatching, foldGutter, foldKeymap, syntaxHighlighting } from '@codemirror/language'
import { EditorState, type Extension } from '@codemirror/state'
import { EditorView, drawSelection, keymap, lineNumbers } from '@codemirror/view'
import { codeEditorTheme, codeHighlightStyle } from './code-editor-theme'

const viewerTheme = EditorView.theme({
  '&': { height: '100%' },
  '.cm-scroller': { overflow: 'auto' },
  '.cm-content': { padding: '12px 0' },
  '.cm-foldGutter span': { color: 'var(--ds-text-muted)', cursor: 'pointer' },
  '.cm-foldPlaceholder': {
    padding: '0 6px',
    color: 'var(--ds-text-muted)',
    backgroundColor: 'var(--ds-chip-bg)',
    border: 'none',
    borderRadius: '4px'
  }
})

/** Read-only, syntax-highlighted JSON, with line numbers and folding. */
@Component({
  selector: 'ds-code-viewer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './code-viewer.component.scss',
  template: `<div #host class="viewer"></div>`
})
export class CodeViewerComponent {
  readonly value = input.required<string>()

  private readonly host = viewChild.required<ElementRef<HTMLElement>>('host')
  #view: EditorView | undefined

  constructor() {
    afterNextRender(() => {
      this.#view = new EditorView({
        parent: this.host().nativeElement,
        state: EditorState.create({ doc: this.value(), extensions: this.#extensions() })
      })
    })

    // Output is replaced wholesale, so swap the document rather than patching it.
    effect(() => {
      const value = this.value()
      const view = this.#view
      if (!view) return
      view.setState(EditorState.create({ doc: value, extensions: this.#extensions() }))
    })

    inject(DestroyRef).onDestroy(() => this.#view?.destroy())
  }

  #extensions(): Extension[] {
    return [
      lineNumbers(),
      json(),
      foldGutter(),
      drawSelection(),
      bracketMatching(),
      syntaxHighlighting(codeHighlightStyle),
      EditorState.readOnly.of(true),
      keymap.of([...defaultKeymap, ...foldKeymap]),
      codeEditorTheme,
      viewerTheme
    ]
  }
}
