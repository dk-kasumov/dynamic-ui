import { OverlayContainer } from '@angular/cdk/overlay'
import { TestBed } from '@angular/core/testing'
import { StudioTheme } from './studio-theme.service'
import { ThemeToggleComponent } from './theme-toggle.component'

/** A controllable stand-in for the OS color scheme. */
class FakeSystemScheme {
  matches = false
  readonly #listeners = new Set<(event: MediaQueryListEvent) => void>()

  addEventListener(_: string, listener: (event: MediaQueryListEvent) => void): void {
    this.#listeners.add(listener)
  }
  removeEventListener(_: string, listener: (event: MediaQueryListEvent) => void): void {
    this.#listeners.delete(listener)
  }
  setDark(dark: boolean): void {
    this.matches = dark
    this.#listeners.forEach(listener => listener({ matches: dark } as MediaQueryListEvent))
  }
}

let system: FakeSystemScheme
let reducedMotion = false

function configure(options: { systemDark?: boolean } = {}): StudioTheme {
  system = new FakeSystemScheme()
  system.matches = options.systemDark ?? false
  vi.stubGlobal('matchMedia', (query: string) => (query.includes('dark') ? system : { matches: reducedMotion }))
  return TestBed.inject(StudioTheme)
}

describe('StudioTheme', () => {
  beforeEach(() => {
    localStorage.clear()
    reducedMotion = false
  })
  afterEach(() => vi.unstubAllGlobals())

  it.each([
    [false, 'light'],
    [true, 'dark']
  ])('follows the system theme by default (system dark: %s)', (systemDark, resolved) => {
    const theme = configure({ systemDark })
    expect(theme.preference()).toBe('system')
    expect(theme.resolved()).toBe(resolved)
  })

  it('tracks live system changes while the preference is system', () => {
    const theme = configure()
    system.setDark(true)
    expect(theme.resolved()).toBe('dark')
    system.setDark(false)
    expect(theme.resolved()).toBe('light')
  })

  it('lets an explicit choice override the system, even when the system changes', () => {
    const theme = configure({ systemDark: true })
    theme.set('light')
    expect(theme.resolved()).toBe('light')
    system.setDark(false)
    system.setDark(true)
    expect(theme.resolved()).toBe('light')
  })

  it('returns to the system theme when switched back to system', () => {
    const theme = configure({ systemDark: true })
    theme.set('light')
    theme.set('system')
    expect(theme.resolved()).toBe('dark')
  })

  it('remembers the choice across sessions', () => {
    configure().set('dark')
    TestBed.resetTestingModule()
    const theme = configure({ systemDark: false })
    expect(theme.preference()).toBe('dark')
    expect(theme.resolved()).toBe('dark')
  })

  it('ignores a stored value it does not recognise', () => {
    localStorage.setItem('ds-studio:theme', 'sepia')
    expect(configure().preference()).toBe('system')
  })

  it('keeps working when storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    const theme = configure()
    expect(theme.preference()).toBe('system')
    expect(() => theme.set('dark')).not.toThrow()
    expect(theme.resolved()).toBe('dark')
    vi.restoreAllMocks()
  })

  it('exposes the resolved theme on the overlay container', () => {
    const theme = configure({ systemDark: false })
    TestBed.tick()
    const container = TestBed.inject(OverlayContainer).getContainerElement()
    expect(container.dataset['dsTheme']).toBe('light')

    theme.set('dark')
    TestBed.tick()
    expect(container.dataset['dsTheme']).toBe('dark')
  })
})

describe('StudioTheme transitions', () => {
  let startViewTransition: ReturnType<typeof vi.fn>

  beforeEach(() => {
    localStorage.clear()
    reducedMotion = false
    startViewTransition = vi.fn((update: () => void) => update())
    Object.assign(document, { startViewTransition })
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    Reflect.deleteProperty(document, 'startViewTransition')
  })

  it('cross-fades when the rendered theme changes', () => {
    const theme = configure()
    theme.set('dark')
    expect(startViewTransition).toHaveBeenCalledTimes(1)
    expect(theme.resolved()).toBe('dark')
  })

  it('does not animate when the rendered theme stays the same', () => {
    const theme = configure({ systemDark: true })
    theme.set('dark') // system is already dark
    expect(startViewTransition).not.toHaveBeenCalled()
    expect(theme.preference()).toBe('dark')
  })

  it('animates a live system change only while following the system', () => {
    const theme = configure()
    system.setDark(true)
    expect(startViewTransition).toHaveBeenCalledTimes(1)

    theme.set('light')
    startViewTransition.mockClear()
    system.setDark(false)
    expect(startViewTransition).not.toHaveBeenCalled()
  })

  it('switches instantly when the user prefers reduced motion', () => {
    reducedMotion = true
    const theme = configure()
    theme.set('dark')
    expect(startViewTransition).not.toHaveBeenCalled()
    expect(theme.resolved()).toBe('dark')
  })
})

describe('ThemeToggleComponent', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => vi.unstubAllGlobals())

  function mount() {
    const theme = configure()
    const fixture = TestBed.createComponent(ThemeToggleComponent)
    fixture.detectChanges()
    const buttons = () => [...(fixture.nativeElement as HTMLElement).querySelectorAll('button')]
    return { theme, fixture, buttons }
  }

  it('offers system, light and dark, with system pressed by default', () => {
    const { buttons } = mount()
    expect(buttons().map(b => b.getAttribute('aria-label'))).toEqual(['System theme', 'Light theme', 'Dark theme'])
    expect(buttons().map(b => b.getAttribute('aria-pressed'))).toEqual(['true', 'false', 'false'])
  })

  it('switches the theme and moves the highlight', () => {
    const { theme, fixture, buttons } = mount()
    buttons()[2]!.click()
    fixture.detectChanges()

    expect(theme.preference()).toBe('dark')
    expect(buttons().map(b => b.getAttribute('aria-pressed'))).toEqual(['false', 'false', 'true'])
    expect(
      (fixture.nativeElement as HTMLElement)
        .querySelector<HTMLElement>('.segmented')!
        .style.getPropertyValue('--ds-segmented-index')
    ).toBe('2')
  })
})
