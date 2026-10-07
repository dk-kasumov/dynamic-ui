import { DOCUMENT } from '@angular/common'
import { Injectable, computed, inject, signal } from '@angular/core'
import { Studio, type StudioAdapter } from '@dynamic-ui/studio'
import { StudioFacade } from '../studio-facade.service'

/** The ways the studio can show the document: edit it, or look at it through different lenses. */
export type StudioView = 'canvas' | 'ast' | 'preview' | 'adapter'

/** One adapter's run over the current AST. */
export interface AdapterResult {
  key: string
  label: string
  output: unknown
  /** Set when the adapter threw; `output` is then `undefined`. */
  error: string | null
}

const STORAGE_KEY = 'ds-studio:view'
const VIEWS: readonly StudioView[] = ['canvas', 'ast', 'preview', 'adapter']

const isView = (value: unknown): value is StudioView => VIEWS.includes(value as StudioView)

/**
 * Which view the studio is showing, and the extensions that decide which views
 * exist: Preview needs a projected template, Output needs at least one adapter.
 * Canvas and AST are always available. Provided per studio by `ds-ngx-studio`.
 */
@Injectable()
export class StudioViews {
  readonly #facade = inject(StudioFacade)
  readonly #window = inject(DOCUMENT).defaultView
  readonly #preferred = signal<StudioView>(this.#read())

  /** Adapters registered by the host, by key. The key doubles as the display name. */
  readonly adapters = signal<Readonly<Record<string, StudioAdapter>>>({})
  readonly hasPreview = signal(false)

  readonly available = computed<readonly StudioView[]>(() =>
    VIEWS.filter(view => {
      if (view === 'preview') return this.hasPreview()
      if (view === 'adapter') return Object.keys(this.adapters()).length > 0
      return true
    })
  )

  /** The remembered view, falling back to the canvas when it is not available (any more). */
  readonly current = computed<StudioView>(() => {
    const preferred = this.#preferred()
    return this.available().includes(preferred) ? preferred : 'canvas'
  })

  /** Every adapter run over the current AST; computed only while a view reads it. */
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

  /** Outputs of the adapters that ran cleanly, by key — what the preview receives. */
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
    this.#write(view)
  }

  // Storage can be missing or throw (private mode, blocked site data) — the view still works without it.
  #read(): StudioView {
    try {
      const stored = this.#window?.localStorage.getItem(STORAGE_KEY)
      return isView(stored) ? stored : 'canvas'
    } catch {
      return 'canvas'
    }
  }

  #write(view: StudioView): void {
    try {
      this.#window?.localStorage.setItem(STORAGE_KEY, view)
    } catch {
      // Not persisted; the choice still applies for this session.
    }
  }
}
