import { Component } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { Studio } from '@dynamic-ui/studio'
import { NgxStudioComponent } from '../ngx-studio.component'
import { StudioFacade } from '../studio-facade.service'
import { StudioPreviewDirective } from './preview/studio-preview.directive'
import { StudioViews } from './studio-views.service'

const Field = Studio.defineComponent({ title: 'Controls/Field', props: {} })

function setup() {
  const studio = new Studio({ components: [Field] })
  TestBed.configureTestingModule({ providers: [StudioFacade, StudioViews] })
  TestBed.inject(StudioFacade).bind(studio)
  return { studio, views: TestBed.inject(StudioViews) }
}

const count = Studio.defineAdapter({ map: root => root.children?.length ?? 0 })

describe('StudioViews', () => {
  beforeEach(() => localStorage.clear())

  it('always offers the canvas and the AST', () => {
    expect(setup().views.available()).toEqual(['canvas', 'ast'])
  })

  it('offers Preview only with a template and Output only with adapters', () => {
    const { views } = setup()
    views.hasPreview.set(true)
    expect(views.available()).toEqual(['canvas', 'ast', 'preview'])
    views.adapters.set({ count })
    expect(views.available()).toEqual(['canvas', 'ast', 'preview', 'adapter'])
  })

  it('switches views and remembers the choice', () => {
    const { views } = setup()
    views.set('ast')
    expect(views.current()).toBe('ast')

    TestBed.resetTestingModule()
    expect(setup().views.current()).toBe('ast')
  })

  it('ignores a view that is not available', () => {
    const { views } = setup()
    views.set('preview')
    expect(views.current()).toBe('canvas')
  })

  it('falls back to the canvas when the remembered view disappears', () => {
    const { views } = setup()
    views.hasPreview.set(true)
    views.set('preview')
    expect(views.current()).toBe('preview')

    views.hasPreview.set(false)
    expect(views.current()).toBe('canvas')
  })

  it('ignores a stored value it does not recognise', () => {
    localStorage.setItem('ds-studio:view', 'nonsense')
    expect(setup().views.current()).toBe('canvas')
  })

  it('runs every adapter over the live AST, naming each by its key', () => {
    const { studio, views } = setup()
    views.adapters.set({ nodeCount: count })
    expect(views.results()).toEqual([{ key: 'nodeCount', label: 'Node Count', output: 0, error: null }])

    studio.addNode(studio.root.id, { name: 'Controls/Field' })
    expect(views.results()[0]?.output).toBe(1)
  })

  it('reports a failing adapter without hiding the others', () => {
    const { views } = setup()
    views.adapters.set({
      broken: Studio.defineAdapter({
        map: () => {
          throw new Error('boom')
        }
      }),
      count
    })
    expect(views.results().map(result => [result.key, result.error])).toEqual([
      ['broken', 'boom'],
      ['count', null]
    ])
    expect(views.outputs()).toEqual({ count: 0 })
  })

  it('cancels a pending relation pick when the view changes', () => {
    const { views } = setup()
    const facade = TestBed.inject(StudioFacade)
    facade.startPick([], () => undefined)
    views.set('ast')
    expect(facade.picking()).toBe(false)
  })
})

@Component({
  standalone: true,
  imports: [NgxStudioComponent, StudioPreviewDirective],
  template: `
    <ds-ngx-studio [studio]="studio" [adapters]="adapters">
      <ng-template dsStudioPreview let-ast let-outputs="outputs">
        <p class="preview-probe">{{ ast.children?.length }} nodes, adapter says {{ outputs['count'] }}</p>
      </ng-template>
    </ds-ngx-studio>
  `
})
class HostComponent {
  readonly studio = new Studio({ components: [Field] })
  readonly adapters = { count }
}

describe('ds-ngx-studio views', () => {
  beforeEach(() => localStorage.clear())

  function mount() {
    const fixture = TestBed.createComponent(HostComponent)
    fixture.detectChanges()
    const el = fixture.nativeElement as HTMLElement
    const tab = (title: string) =>
      [...el.querySelectorAll<HTMLButtonElement>('ds-view-switcher button')].find(b => b.title === title)!
    return { fixture, el, tab }
  }

  it('renders the projected template with the AST and adapter outputs in the Preview view', () => {
    const { fixture, el, tab } = mount()
    fixture.componentInstance.studio.addNode(fixture.componentInstance.studio.root.id, { name: 'Controls/Field' })
    tab('Preview').click()
    fixture.detectChanges()

    expect(el.querySelector('.preview-probe')?.textContent).toContain('1 nodes, adapter says 1')
    expect(el.querySelector('ds-canvas')).toBeNull()
  })

  it('swaps the canvas for the AST view and back', () => {
    const { fixture, el, tab } = mount()
    tab('AST').click()
    fixture.detectChanges()
    expect(el.querySelector('ds-ast-view')).not.toBeNull()
    expect(el.querySelector('ds-canvas')).toBeNull()

    tab('Canvas').click()
    fixture.detectChanges()
    expect(el.querySelector('ds-canvas')).not.toBeNull()
  })
})
