import { DOCUMENT } from '@angular/common'
import { Injectable, computed, inject, signal } from '@angular/core'
import { Studio, type StudioAdapter } from '@dynamic-ui/studio'
import { StudioFacade } from '../studio-facade.service'
import { readStored, writeStored } from '../shared/storage/storage'

export type StudioView = 'canvas' | 'ast' | 'preview' | 'adapter'

export interface AdapterResult {
  key: string
  label: string
  output: unknown
  error: string | null
}

const STORAGE_KEY = 'ds-studio:view'
const VIEWS: readonly StudioView[] = ['canvas', 'ast', 'preview', 'adapter']

const isView = (value: unknown): value is StudioView => VIEWS.includes(value as StudioView)

@Injectable()
export class StudioViews {
  readonly #facade = inject(StudioFacade)
  readonly #window = inject(DOCUMENT).defaultView
  readonly #preferred = signal<StudioView>(readStored(this.#window, STORAGE_KEY, isView, 'canvas'))

  readonly adapters = signal<Readonly<Record<string, StudioAdapter>>>({})
  readonly hasPreview = signal(false)

  readonly available = computed<readonly StudioView[]>(() =>
    VIEWS.filter(view => {
      if (view === 'preview') return this.hasPreview()
      if (view === 'adapter') return Object.keys(this.adapters()).length > 0
      return true
    })
  )

  readonly current = computed<StudioView>(() => {
    const preferred = this.#preferred()
    return this.available().includes(preferred) ? preferred : 'canvas'
  })

  readonly results = computed<AdapterResult[]>(() => {
    const root = this.#facade.root()
    if (!root) return []
    return Object.entries(this.adapters()).map(([key, adapter]) => {
      const label = Studio.humanize(key)
      try {
        return { key, label, output: adapter.map(root), error: null }
      } catch (error) {
        return { key, label, output: undefined, error: error instanceof Error ? error.message : String(error) }
      }
    })
  })

  readonly outputs = computed<Record<string, unknown>>(() =>
    Object.fromEntries(
      this.results()
        .filter(result => !result.error)
        .map(result => [result.key, result.output])
    )
  )

  set(view: StudioView): void {
    if (!this.available().includes(view)) return
    this.#facade.cancelPick()
    this.#preferred.set(view)
    writeStored(this.#window, STORAGE_KEY, view)
  }
}
