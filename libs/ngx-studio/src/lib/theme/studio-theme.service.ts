import { DOCUMENT } from '@angular/common'
import { ApplicationRef, DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core'
import { OverlayContainer } from '@angular/cdk/overlay'
import { readStored, writeStored } from '../shared/storage/storage'

export type ThemePreference = 'system' | 'light' | 'dark'

export type ResolvedTheme = 'light' | 'dark'

const STORAGE_KEY = 'ds-studio:theme'
const DARK_QUERY = '(prefers-color-scheme: dark)'
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

const isPreference = (value: unknown): value is ThemePreference =>
  value === 'system' || value === 'light' || value === 'dark'

@Injectable({ providedIn: 'root' })
export class StudioTheme {
  readonly #document = inject(DOCUMENT)
  readonly #window = this.#document.defaultView
  readonly #appRef = inject(ApplicationRef)
  readonly #systemQuery = this.#window?.matchMedia?.(DARK_QUERY) ?? null
  readonly #systemDark = signal(this.#systemQuery?.matches ?? false)
  readonly #preference = signal<ThemePreference>(readStored(this.#window, STORAGE_KEY, isPreference, 'system'))

  readonly preference = this.#preference.asReadonly()
  readonly resolved = computed<ResolvedTheme>(() => this.#resolve(this.#preference()))

  constructor() {
    const query = this.#systemQuery
    if (query) {
      const onChange = (event: MediaQueryListEvent): void =>
        this.#apply(() => this.#systemDark.set(event.matches), this.#preference() === 'system')
      query.addEventListener('change', onChange)
      inject(DestroyRef).onDestroy(() => query.removeEventListener('change', onChange))
    }

    const overlayContainer = inject(OverlayContainer)
    effect(() => {
      overlayContainer.getContainerElement().dataset['dsTheme'] = this.resolved()
    })
  }

  set(preference: ThemePreference): void {
    if (preference === this.#preference()) return
    this.#apply(() => this.#preference.set(preference), this.#resolve(preference) !== this.resolved())
    writeStored(this.#window, STORAGE_KEY, preference)
  }

  #resolve(preference: ThemePreference): ResolvedTheme {
    if (preference === 'system') return this.#systemDark() ? 'dark' : 'light'
    return preference
  }

  #apply(update: () => void, changesTheme: boolean): void {
    const startViewTransition = this.#document.startViewTransition?.bind(this.#document)
    const reducedMotion = this.#window?.matchMedia?.(REDUCED_MOTION_QUERY).matches ?? false
    if (!changesTheme || !startViewTransition || reducedMotion) return update()
    startViewTransition(() => {
      update()
      this.#appRef.tick()
    })
  }
}
