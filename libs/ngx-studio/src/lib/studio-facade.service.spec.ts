import { TestBed } from '@angular/core/testing'
import * as v from 'valibot'
import { Studio, type NodeId } from '@dynamic-ui/studio'
import { StudioFacade } from './studio-facade.service'

const TextInput = Studio.defineComponent({
  title: 'Controls/Text Input',
  props: {},
  relations: { required: Studio.relation({ returns: 'boolean' }) }
})

const RequiredField = Studio.defineComponent({
  title: 'Controls/Required',
  props: { label: Studio.text({ validation: v.pipe(v.string('Label is required'), v.nonEmpty('Label is required')) }) }
})

function setup() {
  const studio = new Studio({ components: [TextInput] })
  const facade = TestBed.configureTestingModule({ providers: [StudioFacade] }).inject(StudioFacade)
  facade.bind(studio)
  const add = (extra: { fieldName?: string; title?: string } = {}) =>
    studio.addNode(studio.root.id, { name: 'Controls/Text Input', ...extra })
  return { studio, facade, add }
}

describe('StudioFacade — links and highlight', () => {
  it('describes a node by its field name, keeping the component as the type', () => {
    const { facade, add } = setup()
    expect(facade.describeNode(add({ fieldName: 'email' }))).toEqual({ name: 'email', type: 'Text Input' })
  })

  it('falls back to the node title, then to the component label', () => {
    const { facade, add } = setup()
    expect(facade.describeNode(add({ title: 'Email' }))).toEqual({ name: 'Email', type: 'Text Input' })
    expect(facade.describeNode(add())).toEqual({ name: 'Text Input', type: null })
  })

  it('exposes links in both directions and keeps them current', () => {
    const { studio, facade, add } = setup()
    const email = add()
    const form = add()
    expect(facade.linksOf(form)).toEqual({ to: [], from: [] })

    studio.setRelation(form, 'required', { combine: 'and', rules: [{ target: email, operator: 'isNotEmpty' }] })
    expect(facade.linksOf(form).to).toEqual([email])
    expect(facade.linksOf(email).from).toEqual([form])
  })

  it('highlights nodes until cleared', () => {
    const { facade, add } = setup()
    const a = add()
    const b = add()
    facade.highlight([a])
    expect(facade.isHighlighted(a)).toBe(true)
    expect(facade.isHighlighted(b)).toBe(false)
    facade.clearHighlight()
    expect(facade.isHighlighted(a)).toBe(false)
  })

  it('drops the highlight when target picking starts', () => {
    const { facade, add } = setup()
    const a = add()
    facade.highlight([a])
    facade.startPick([a as NodeId], () => undefined)
    expect(facade.isHighlighted(a)).toBe(false)
  })
})

describe('StudioFacade — validation', () => {
  function setup() {
    const studio = new Studio({ components: [RequiredField] })
    const facade = TestBed.configureTestingModule({ providers: [StudioFacade] }).inject(StudioFacade)
    facade.bind(studio)
    return { studio, facade, add: () => studio.addNode(studio.root.id, { name: 'Controls/Required' }) }
  }

  it('flags a freshly added node whose required field is still null', () => {
    const { facade, add } = setup()
    const id = add()
    expect(facade.errorsOf(id)).toEqual([{ path: ['label'], label: 'Label', messages: ['Label is required'] }])
    expect(facade.errorCount()).toBe(1)
    expect(facade.nodesWithErrors()).toEqual([id])
  })

  it('clears the error once the field is filled', () => {
    const { studio, facade, add } = setup()
    const id = add()
    studio.setProp(id, ['label'], 'Email')
    expect(facade.errorsOf(id)).toEqual([])
    expect(facade.errorCount()).toBe(0)
    expect(facade.nodesWithErrors()).toEqual([])
  })

  it('aggregates across nodes and keeps error-free ones out of the map', () => {
    const { studio, facade, add } = setup()
    const a = add()
    const b = add()
    studio.setProp(a, ['label'], 'Set')
    expect(facade.errorCount()).toBe(1)
    expect(facade.nodesWithErrors()).toEqual([b])
    expect(facade.errorsOf(a)).toEqual([])
  })
})
