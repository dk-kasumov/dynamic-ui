import { Studio } from './studio'
import type { NodeId } from './studio'

// A realistic set of registered components the UI would receive at app boot.
const TextInput = Studio.defineComponent({
  name: 'Controls/TextInput',
  props: {
    label: Studio.text(),
    placeholder: Studio.text(),
    maxLength: Studio.decimal()
  },
  relations: {
    visible: Studio.relation({ returns: 'boolean' }),
    required: Studio.relation({ returns: 'boolean' })
  }
})

const Button = Studio.defineComponent({
  name: 'Controls/Button',
  props: { label: Studio.text() },
  relations: { disabled: Studio.relation({ returns: 'boolean' }) }
})

const Form = Studio.defineComponent({
  name: 'Containers/Form',
  props: { title: Studio.text() },
  children: { cardinality: 'many' }
})

const rootId = 'root' as NodeId

const makeStudio = () =>
  new Studio({
    components: [TextInput, Button, Form],
    root: Studio.createNode({ id: rootId, name: 'Containers/Form' })
  })

describe('Studio DSL', () => {
  it('exposes schema factories as statics', () => {
    expect(Studio.text({ default: 'anon' })).toEqual({ kind: 'text', default: 'anon' })
    expect(Studio.enum(['sm', 'md', 'lg']).options).toEqual(['sm', 'md', 'lg'])
    expect(Studio.relation().variant).toBe('builtin')
    expect(Studio.relation.custom({ id: 'tz' }).variant).toBe('custom')
  })
})

describe('Studio — end-to-end usage', () => {
  it('serves the palette: lists and looks up registered components', () => {
    const studio = makeStudio()
    expect(studio.getComponents().map(c => c.name)).toEqual([
      'Controls/TextInput',
      'Controls/Button',
      'Containers/Form'
    ])
    expect(studio.getComponent('Controls/TextInput')?.props['label']?.kind).toBe('text')
    expect(studio.getComponent('Nope')).toBeUndefined()
  })

  it('builds a form the way a UI would', () => {
    const studio = makeStudio()

    // Drop two controls into the form.
    const emailId = studio.addNode(rootId, { name: 'Controls/TextInput' })
    const submitId = studio.addNode(rootId, { name: 'Controls/Button' })

    // Configure them (gear panel edits).
    studio.setProp(emailId, ['label'], 'Email')
    studio.setProp(emailId, ['placeholder'], 'you@example.com')
    studio.setProp(submitId, ['label'], 'Submit')

    // Dynamic relation: submit is disabled while the email is empty.
    studio.setRelation(submitId, 'disabled', {
      variant: 'builtin',
      returns: 'boolean',
      ast: { op: 'isEmpty', arg: { kind: 'ref', nodeId: emailId } }
    })

    // UI can walk the tree to render it.
    expect(studio.root.children).toHaveLength(2)
    expect(studio.findNode(emailId)?.props['label']).toBe('Email')
    expect(studio.findNode(submitId)?.relations['disabled']?.variant).toBe('builtin')
  })

  it('tracks selection and clears it when the selected node is removed', () => {
    const studio = makeStudio()
    const id = studio.addNode(rootId, { name: 'Controls/TextInput' })
    studio.select(id)
    expect(studio.selectedId).toBe(id)
    studio.removeNode(id)
    expect(studio.selectedId).toBeNull()
  })

  it('notifies subscribers on every state change', () => {
    const studio = makeStudio()
    const spy = jest.fn()
    const unsubscribe = studio.subscribe(spy)

    const id = studio.addNode(rootId, { name: 'Controls/TextInput' })
    studio.setProp(id, ['label'], 'X')
    studio.select(id)
    expect(spy).toHaveBeenCalledTimes(3)

    unsubscribe()
    studio.setProp(id, ['label'], 'Y')
    expect(spy).toHaveBeenCalledTimes(3)
  })

  it('rejects moves that would create a cycle', () => {
    const studio = makeStudio()
    const outer = studio.addNode(rootId, { name: 'Containers/Form' })
    const inner = studio.addNode(outer, { name: 'Controls/TextInput' })
    expect(() => studio.moveNode(outer, inner)).toThrow(/descendant/)
  })
})
