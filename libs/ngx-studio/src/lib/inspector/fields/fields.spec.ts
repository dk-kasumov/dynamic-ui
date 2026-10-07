import { TestBed } from '@angular/core/testing'
import { Studio, type Primitive } from '@dynamic-ui/studio'
import { EditorView } from '@codemirror/view'
import { FieldHostComponent } from './field-host.component'
import type { InspectorFieldChange } from '../field-change'

function mount(primitive: Primitive, value?: unknown) {
  const fixture = TestBed.createComponent(FieldHostComponent)
  const changes: InspectorFieldChange[] = []
  fixture.componentRef.setInput('primitive', primitive)
  fixture.componentRef.setInput('value', value)
  fixture.componentRef.setInput('label', 'Field')
  fixture.componentRef.setInput('path', ['field'])
  fixture.componentInstance.change.subscribe(c => changes.push(c))
  fixture.detectChanges()
  return { fixture, el: fixture.nativeElement as HTMLElement, changes }
}

function type(input: HTMLInputElement, text: string): void {
  input.value = text
  input.dispatchEvent(new Event('input'))
  input.dispatchEvent(new Event('change'))
}

describe('field hints', () => {
  it('renders the hint under a text field', () => {
    const { el } = mount(Studio.text({ hint: 'Name in format Name - Surname' }))
    expect(el.querySelector('mat-hint')?.textContent).toContain('Name in format Name - Surname')
  })

  it('prefers hint over description', () => {
    const { el } = mount(Studio.text({ hint: 'hint', description: 'description' }))
    expect(el.querySelector('mat-hint')?.textContent).toContain('hint')
    expect(el.querySelector('mat-hint')?.textContent).not.toContain('description')
  })

  it('renders the hint for a checkbox', () => {
    const { el } = mount(Studio.checkbox({ hint: 'Check me' }))
    expect(el.querySelector('.ds-hint')?.textContent).toContain('Check me')
  })
})

describe('ds-date-field', () => {
  it('shows a single date input by default', () => {
    const { el } = mount(Studio.date(), '2026-10-06')
    expect(el.querySelector('mat-date-range-input')).toBeNull()
    expect((el.querySelector('input') as HTMLInputElement).value).toBe('10/6/26')
  })

  it('displays the value in the requested format', () => {
    const { el } = mount(Studio.date({ format: 'DD-MM-YYYY' }), '2026-10-06')
    expect((el.querySelector('input') as HTMLInputElement).value).toBe('06-10-2026')
  })

  it('emits ISO strings when a date is typed in the configured format', () => {
    const { el, changes } = mount(Studio.date({ format: 'DD-MM-YYYY' }))
    type(el.querySelector('input') as HTMLInputElement, '07-10-2026')
    expect(changes.at(-1)).toEqual({ path: ['field'], value: '2026-10-07' })
  })

  it('emits null when the input is cleared', () => {
    const { el, changes } = mount(Studio.date(), '2026-10-06')
    type(el.querySelector('input') as HTMLInputElement, '')
    expect(changes.at(-1)).toEqual({ path: ['field'], value: null })
  })

  it('renders a start and end input in range mode', () => {
    const { el } = mount(Studio.date({ range: true, format: 'DD-MM-YYYY' }), {
      start: '2026-10-06',
      end: '2026-10-09'
    })
    const inputs = el.querySelectorAll<HTMLInputElement>('mat-date-range-input input')
    expect([...inputs].map(i => i.value)).toEqual(['06-10-2026', '09-10-2026'])
  })

  it('emits a range of ISO strings', () => {
    const { el, changes } = mount(Studio.date({ range: true, format: 'DD-MM-YYYY' }), {
      start: '2026-10-06',
      end: null
    })
    const [, end] = el.querySelectorAll<HTMLInputElement>('mat-date-range-input input')
    type(end!, '09-10-2026')
    expect(changes.at(-1)).toEqual({ path: ['field'], value: { start: '2026-10-06', end: '2026-10-09' } })
  })
})

describe('ds-time-field', () => {
  it('shows the stored time', () => {
    const { el } = mount(Studio.time(), '09:30')
    expect((el.querySelector('input') as HTMLInputElement).value).toMatch(/9:30/)
  })

  it('emits 24h HH:mm strings', () => {
    const { el, changes } = mount(Studio.time())
    type(el.querySelector('input') as HTMLInputElement, '2:05 PM')
    expect(changes.at(-1)).toEqual({ path: ['field'], value: '14:05' })
  })
})

describe('ds-code-field', () => {
  function editorOf(el: HTMLElement): EditorView {
    const view = EditorView.findFromDOM(el)
    if (!view) throw new Error('editor not mounted')
    return view
  }

  it('mounts a CodeMirror editor with the stored source', async () => {
    const { fixture, el } = mount(Studio.code(), '{ "a": 1 }')
    await fixture.whenStable()
    expect(editorOf(el).state.doc.toString()).toBe('{ "a": 1 }')
  })

  it('emits the raw source when edited', async () => {
    const { fixture, el, changes } = mount(Studio.code())
    await fixture.whenStable()
    const view = editorOf(el)
    view.dispatch({ changes: { from: 0, insert: '{"a":1}' } })
    expect(changes.at(-1)).toEqual({ path: ['field'], value: '{"a":1}' })
  })

  it('does not echo external value changes back out', async () => {
    const { fixture, el, changes } = mount(Studio.code(), '{}')
    await fixture.whenStable()
    fixture.componentRef.setInput('value', '{ "b": 2 }')
    fixture.detectChanges()
    await fixture.whenStable()
    expect(editorOf(el).state.doc.toString()).toBe('{ "b": 2 }')
    expect(changes).toHaveLength(0)
  })

  it('flags invalid JSON and disables formatting', async () => {
    const { fixture, el } = mount(Studio.code(), '{ nope')
    await fixture.whenStable()
    fixture.detectChanges()
    expect(el.querySelector('.ds-code__error')).not.toBeNull()
    expect((el.querySelector('.ds-code__format') as HTMLButtonElement).disabled).toBe(true)
  })

  it('formats valid JSON', async () => {
    const { fixture, el, changes } = mount(Studio.code(), '{"a":1}')
    await fixture.whenStable()
    fixture.detectChanges()
    ;(el.querySelector('.ds-code__format') as HTMLButtonElement).click()
    expect(changes.at(-1)?.value).toBe('{\n  "a": 1\n}')
  })
})
