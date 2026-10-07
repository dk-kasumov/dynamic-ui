import { DOCUMENT } from '@angular/common'
import { ApplicationRef, DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core'
import { OverlayContainer } from '@angular/cdk/overlay'
import { readStored, writeStored } from '../shared/storage'

/** What the user picked. `system` follows the OS and is the default. */
export type ThemePreference = 'system' | 'light' | 'dark'

/** What is actually rendered. */
export type ResolvedTheme = 'light' | 'dark'

const STORAGE_KEY = 'ds-studio:theme'
const DARK_QUERY = '(prefers-color-scheme: dark)'
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

const isPreference = (value: unknown): value is ThemePreference =>
  value === 'system' || value === 'light' || value === 'dark'

/**
 * The studio's color theme. Holds the user's preference (persisted, `system` by
 * default) and resolves it against the OS setting, which it keeps tracking, so
 * a `system` preference follows the OS live. Changes cross-fade through the
 * View Transitions API where it is available. One instance per app: every studio
 * on the page shares the same theme.
 */
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

    // Overlay panels (datepicker, select, tooltip) are rendered outside any studio host.
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

  /**
   * Runs a state change, cross-fading the page when it changes the rendered theme.
   * The view transition snapshots the DOM before and after `update`, so the
   * change has to reach the DOM synchronously — hence the explicit tick.
   */
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
