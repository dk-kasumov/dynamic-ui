import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, signal } from '@angular/core'
import { copyText, downloadText } from '../shared/file'

/** Copy and download buttons for a piece of generated text. */
@Component({
  selector: 'ds-output-actions',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './output-actions.component.scss',
  template: `
    <button type="button" class="action" [disabled]="disabled()" (click)="copy()">
      <span class="material-icons" aria-hidden="true">{{ copied() ? 'check' : 'content_copy' }}</span>
      {{ copied() ? 'Copied' : 'Copy' }}
    </button>
    <button type="button" class="action" [disabled]="disabled()" (click)="download()">
      <span class="material-icons" aria-hidden="true">download</span>
      Download
    </button>
  `
})
export class OutputActionsComponent {
  readonly text = input.required<string>()
  readonly filename = input.required<string>()
  readonly mime = input('application/json')
  readonly disabled = input(false)

  readonly copied = signal(false)
  #reset: ReturnType<typeof setTimeout> | undefined

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.#reset))
  }

  async copy(): Promise<void> {
    if (!(await copyText(this.text()))) return
    this.copied.set(true)
    clearTimeout(this.#reset)
    this.#reset = setTimeout(() => this.copied.set(false), 1500)
  }

  download(): void {
    downloadText(this.filename(), this.text(), this.mime())
  }
}
