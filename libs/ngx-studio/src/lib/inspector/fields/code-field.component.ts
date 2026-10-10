import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild
} from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { MatButtonModule } from '@angular/material/button'
import { MatTooltipModule } from '@angular/material/tooltip'
import type { CodePrimitive } from '@dynamic-ui/studio'
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { json, jsonParseLinter } from '@codemirror/lang-json'
import { bracketMatching, indentOnInput, syntaxHighlighting } from '@codemirror/language'
import { linter } from '@codemirror/lint'
import { EditorState } from '@codemirror/state'
import { EditorView, drawSelection, highlightActiveLine, keymap, lineNumbers, placeholder } from '@codemirror/view'
import { codeEditorTheme, codeHighlightStyle } from '../../code/code-editor-theme'

const INDENT = 2

const fieldSizing = EditorView.theme({
  '&': { minHeight: '88px' },
  '.cm-scroller': { maxHeight: '320px' }
})

@Component({
  selector: 'ds-code-field',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatTooltipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './code-field.component.scss',
  template: `
    <div class="ds-code" [class.ds-code--invalid]="error() || errors().length" [class.ds-code--focused]="focused()">
      <div class="ds-code__header">
        <span class="ds-code__label">{{ label() }}</span>
        <span class="ds-code__badge">JSON</span>
        <button
          mat-icon-button
          type="button"
          class="ds-code__format"
          matTooltip="Format JSON"
          [disabled]="!canFormat()"
          (click)="format()"
        >
          <mat-icon>format_align_left</mat-icon>
        </button>
      </div>
      <div #host class="ds-code__editor"></div>
      <div class="ds-code__footer">
        @if (error(); as message) {
          <mat-icon class="ds-code__footer-icon">error</mat-icon>
          <span class="ds-code__error" role="alert">{{ message }}</span>
        } @else if (errors().length) {
          <mat-icon class="ds-code__footer-icon">error</mat-icon>
          <span class="ds-code__error" role="alert">{{ errors().join(', ') }}</span>
        } @else if (primitive().hint ?? primitive().description; as hint) {
          <span class="ds-code__hint">{{ hint }}</span>
        }
      </div>
    </div>
  `
})
export class CodeFieldComponent {
  readonly label = input.required<string>()
  readonly primitive = input.required<CodePrimitive>()
  readonly value = input<string | undefined>()
  readonly errors = input<readonly string[]>([])

  readonly valueChange = output<string>()

  private readonly host = viewChild.required<ElementRef<HTMLElement>>('host')
  #view: EditorView | undefined
  #syncing = false

  readonly focused = signal(false)
  readonly #source = signal('')

  readonly error = computed(() => validateJson(this.#source()))
  readonly canFormat = computed(() => this.#source().trim() !== '' && !this.error())

  constructor() {
    const destroyRef = inject(DestroyRef)

    afterNextRender(() => {
      const initial = this.#currentValue()
      this.#source.set(initial)
      this.#view = new EditorView({
        parent: this.host().nativeElement,
        state: EditorState.create({
          doc: initial,
          extensions: [
            lineNumbers(),
            EditorView.lineWrapping,
            history(),
            drawSelection(),
            highlightActiveLine(),
            indentOnInput(),
            bracketMatching(),
            closeBrackets(),
            json(),
            linter(jsonParseLinter()),
            syntaxHighlighting(codeHighlightStyle),
            placeholder(this.primitive().default ?? '{ }'),
            EditorState.tabSize.of(INDENT),
            keymap.of([...closeBracketsKeymap, ...defaultKeymap, ...historyKeymap]),
            codeEditorTheme,
            fieldSizing,
            EditorView.updateListener.of(update => {
              if (update.focusChanged) this.focused.set(update.view.hasFocus)
              if (!update.docChanged || this.#syncing) return
              const doc = update.state.doc.toString()
              this.#source.set(doc)
              this.valueChange.emit(doc)
            })
          ]
        })
      })
    })

    effect(() => {
      const next = this.#currentValue()
      const view = this.#view
      if (!view || next === view.state.doc.toString()) return
      this.#syncing = true
      try {
        view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: next } })
      } finally {
        this.#syncing = false
      }
      this.#source.set(next)
    })

    destroyRef.onDestroy(() => this.#view?.destroy())
  }

  format(): void {
    const view = this.#view
    if (!view || !this.canFormat()) return
    const formatted = JSON.stringify(JSON.parse(view.state.doc.toString()), null, INDENT)
    view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: formatted } })
  }

  #currentValue(): string {
    return this.value() ?? ''
  }
}

function validateJson(source: string): string | null {
  if (source.trim() === '') return null
  try {
    JSON.parse(source)
    return null
  } catch (e) {
    return e instanceof Error ? e.message : 'Invalid JSON'
  }
}
