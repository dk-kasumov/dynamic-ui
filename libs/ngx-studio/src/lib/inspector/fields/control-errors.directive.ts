import { Directive, effect, inject, input } from '@angular/core'
import { MatFormFieldControl } from '@angular/material/form-field'

@Directive({ selector: '[dsControlErrors]', standalone: true })
export class ControlErrorsDirective {
  readonly dsControlErrors = input<readonly string[]>([])

  readonly #control = inject(MatFormFieldControl) as unknown as {
    ngControl: unknown
    errorState: boolean
    stateChanges: { next: () => void }
  }

  constructor() {
    effect(() => {
      const hasError = this.dsControlErrors().length > 0
      if (this.#control.ngControl) return
      this.#control.errorState = hasError
      this.#control.stateChanges.next()
    })
  }
}
