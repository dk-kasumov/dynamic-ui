import { Studio, describeExpression, fromExpression, toExpression } from './studio'
import type { NodeId, RelationRuleSet } from './studio'

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
  container: true
})

const makeStudio = () => new Studio({ components: [TextInput, Button, Form] })

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
    const emailId = studio.addNode(studio.root.id, { name: 'Controls/TextInput' })
    const submitId = studio.addNode(studio.root.id, { name: 'Controls/Button' })

    // Configure them (gear panel edits).
    studio.setProp(emailId, ['label'], 'Email')
    studio.setProp(emailId, ['placeholder'], 'you@example.com')
    studio.setProp(submitId, ['label'], 'Submit')

    // Dynamic relation: submit is disabled while the email is empty.
    studio.setRelation(submitId, 'disabled', {
      variant: 'builtin',
      returns: 'boolean',
      expression: { operator: 'isEmpty', operand: { kind: 'reference', nodeId: emailId } }
    })

    // UI can walk the tree to render it.
    expect(studio.root.children).toHaveLength(2)
    expect(studio.findNode(emailId)?.props['label']).toBe('Email')
    expect(studio.findNode(submitId)?.relations['disabled']?.variant).toBe('builtin')
  })

  it('tracks selection and clears it when the selected node is removed', () => {
    const studio = makeStudio()
    const id = studio.addNode(studio.root.id, { name: 'Controls/TextInput' })
    studio.select(id)
    expect(studio.selectedId).toBe(id)
    studio.removeNode(id)
    expect(studio.selectedId).toBeNull()
  })

  it('emits a fresh snapshot through state$ on every change', () => {
    const studio = makeStudio()
    const spy = jest.fn()
    const sub = studio.state$.subscribe(spy)
    expect(spy).toHaveBeenCalledTimes(1) // BehaviorSubject replays the current snapshot

    const id = studio.addNode(studio.root.id, { name: 'Controls/TextInput' })
    studio.setProp(id, ['label'], 'X')
    studio.select(id)
    expect(spy).toHaveBeenCalledTimes(4)

    sub.unsubscribe()
    studio.setProp(id, ['label'], 'Y')
    expect(spy).toHaveBeenCalledTimes(4)
  })

  it('replaces the root but shares untouched subtrees on mutation', () => {
    const studio = makeStudio()
    const sectionId = studio.addNode(studio.root.id, { name: 'Containers/Form' })
    const fieldId = studio.addNode(sectionId, { name: 'Controls/TextInput' })
    const other = studio.addNode(studio.root.id, { name: 'Controls/Button' })

    const before = studio.root
    const otherBefore = studio.findNode(other)
    studio.setProp(fieldId, ['label'], 'Email')

    expect(studio.root).not.toBe(before) // root is a new reference
    expect(studio.findNode(other)).toBe(otherBefore) // untouched sibling kept its reference
  })

  it('derives a component label from the last segment of its name', () => {
    const studio = makeStudio()
    expect(studio.getComponent('Controls/TextInput')?.label).toBe('TextInput')
  })

  it('rejects moves that would create a cycle', () => {
    const studio = makeStudio()
    const outer = studio.addNode(studio.root.id, { name: 'Containers/Form' })
    const inner = studio.addNode(outer, { name: 'Controls/TextInput' })
    expect(() => studio.moveNode(outer, inner)).toThrow(/descendant/)
  })

  it('offers relation targets excluding self and descendants', () => {
    const studio = makeStudio()
    const section = studio.addNode(studio.root.id, { name: 'Containers/Form' })
    const inner = studio.addNode(section, { name: 'Controls/TextInput' })
    const sibling = studio.addNode(studio.root.id, { name: 'Controls/Button' })

    const ids = studio.relationTargets(section).map(n => n.id)
    expect(ids).toContain(sibling)
    expect(ids).not.toContain(section) // not itself
    expect(ids).not.toContain(inner) // not a descendant
  })
})

describe('relation rules codec', () => {
  const a = 'a' as NodeId
  const b = 'b' as NodeId

  it('round-trips a multi-rule set through the expression tree', () => {
    const set: RelationRuleSet = {
      combine: 'or',
      rules: [
        { target: a, operator: 'isValid' },
        { target: b, operator: 'equals', value: 'admin' }
      ]
    }
    expect(fromExpression(toExpression(set)!)).toEqual(set)
  })

  it('returns null for an empty rule set and describes a built expression', () => {
    expect(toExpression({ combine: 'and', rules: [] })).toBeNull()
    const expr = toExpression({ combine: 'and', rules: [{ target: a, operator: 'isEmpty' }] })!
    expect(describeExpression(expr, id => (id === a ? 'Email' : id))).toBe('Email is empty')
  })
})
