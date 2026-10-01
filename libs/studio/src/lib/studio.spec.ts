import { Studio, createNode, defineComponent } from './studio'
import type { PropsOf, RelationNamesOf } from './component'

describe('Studio primitives', () => {
  it('text() returns a text descriptor', () => {
    expect(Studio.text()).toEqual({ kind: 'text' })
    expect(Studio.text({ label: 'Name', default: 'anon' })).toEqual({
      kind: 'text',
      label: 'Name',
      default: 'anon'
    })
  })

  it('decimal(), checkbox(), select() return their descriptors', () => {
    expect(Studio.decimal({ min: 0, max: 100 })).toEqual({
      kind: 'decimal',
      min: 0,
      max: 100
    })
    expect(Studio.checkbox({ default: true })).toEqual({
      kind: 'checkbox',
      default: true
    })
    expect(Studio.select({ multiple: true })).toEqual({
      kind: 'select',
      multiple: true
    })
  })

  it('enum() narrows the value type to its options', () => {
    const role = Studio.enum(['user', 'admin', 'guest'] as const)
    expect(role.kind).toBe('enum')
    expect(role.options).toEqual(['user', 'admin', 'guest'])
  })

  it('group() nests primitives', () => {
    const g = Studio.group({
      first: Studio.text(),
      age: Studio.decimal()
    })
    expect(g.kind).toBe('group')
    expect(g.shape.first.kind).toBe('text')
    expect(g.shape.age.kind).toBe('decimal')
  })
})

describe('Studio.relation', () => {
  it('builtin relation defaults to returns=boolean', () => {
    const r = Studio.relation()
    expect(r.kind).toBe('relation')
    expect(r.variant).toBe('builtin')
    expect(r.returns).toBe('boolean')
  })

  it('builtin relation respects returns parameter', () => {
    const r = Studio.relation({ returns: 'value' })
    expect(r.returns).toBe('value')
  })

  it('builtin relation accepts filters, operators, presets', () => {
    const r = Studio.relation({
      returns: 'boolean',
      targetFilter: { kinds: ['Controls/TextInput'], scope: 'form' },
      operators: ['eq', 'isEmpty', 'isValid'],
      mode: 'simple',
      presets: [
        {
          label: 'When target is valid',
          ast: { op: 'isValid', arg: { kind: 'ref', nodeId: '$pick' } }
        }
      ]
    })
    expect(r.operators).toEqual(['eq', 'isEmpty', 'isValid'])
    expect(r.presets).toHaveLength(1)
  })

  it('custom relation carries id and default payload', () => {
    const r = Studio.relation.custom<{ from: string; to: string }>({
      id: 'timeSlot',
      default: { from: '09:00', to: '18:00' }
    })
    expect(r.variant).toBe('custom')
    expect(r.id).toBe('timeSlot')
    expect(r.default).toEqual({ from: '09:00', to: '18:00' })
  })
})

describe('defineComponent', () => {
  const textInput = defineComponent({
    name: 'Controls/TextInput',
    props: {
      label: Studio.text(),
      placeholder: Studio.text(),
      disabled: Studio.checkbox(),
      maxLength: Studio.decimal()
    },
    relations: {
      visible: Studio.relation({ returns: 'boolean' }),
      required: Studio.relation({ returns: 'boolean' })
    }
  })

  const stepper = defineComponent({
    name: 'Containers/Stepper',
    props: {
      orientation: Studio.enum(['horizontal', 'vertical'] as const)
    },
    children: {
      cardinality: 'many',
      kinds: ['Containers/Step'],
      min: 1
    }
  })

  it('preserves literal names and descriptor shapes', () => {
    expect(textInput.name).toBe('Controls/TextInput')
    expect(textInput.props.label.kind).toBe('text')
    expect(textInput.relations.visible.variant).toBe('builtin')
  })

  it('fills relations with an empty object when omitted', () => {
    expect(stepper.relations).toEqual({})
  })

  it('exposes children configuration for containers', () => {
    expect(stepper.children).toEqual({
      cardinality: 'many',
      kinds: ['Containers/Step'],
      min: 1
    })
  })

  it('leaf components have undefined children', () => {
    expect(textInput.children).toBeUndefined()
  })

  // Type-level sanity: these variables exist only to force the compiler to check
  // that the inference helpers extract the right shapes. They are never used.
  it('PropsOf extracts materialized prop value types (compile-time check)', () => {
    type P = PropsOf<typeof textInput>
    const _p: P = {
      label: 'Email',
      placeholder: 'you@example.com',
      disabled: false,
      maxLength: 120
    }
    const _names: RelationNamesOf<typeof textInput> = 'visible'
    expect(_p.label).toBe('Email')
    expect(_names).toBe('visible')
  })
})

describe('Studio facade', () => {
  const textInput = defineComponent({
    name: 'Controls/TextInput',
    props: { label: Studio.text() }
  })

  const button = defineComponent({
    name: 'Controls/Button',
    props: { label: Studio.text() }
  })

  it('wires registry, tree, and store together', () => {
    const studio = new Studio({
      components: [textInput, button],
      root: createNode({ name: 'Form' })
    })

    expect(studio.registry.has('Controls/TextInput')).toBe(true)
    expect(studio.registry.has('Controls/Button')).toBe(true)
    expect(studio.store.tree.root.name).toBe('Form')
    expect(studio.store.selectedId).toBeNull()
  })

  it('can be mutated through its store', () => {
    const studio = new Studio({
      components: [textInput],
      root: createNode({ name: 'Form' })
    })
    const rootId = studio.store.tree.root.id

    const fieldId = studio.store.addNode(rootId, { name: 'Controls/TextInput' })

    expect(studio.store.tree.find(fieldId)?.name).toBe('Controls/TextInput')
  })

  it('two instances are independent', () => {
    const a = new Studio({ components: [textInput], root: createNode({ name: 'Form' }) })
    const b = new Studio({ components: [textInput], root: createNode({ name: 'Form' }) })

    a.store.addNode(a.store.tree.root.id, { name: 'Controls/TextInput' })

    expect(a.store.tree.root.children).toHaveLength(1)
    expect(b.store.tree.root.children).toBeUndefined()
  })

  it('exposes the same DSL factories as static methods', () => {
    expect(Studio.text()).toEqual({ kind: 'text' })
    expect(Studio.relation().kind).toBe('relation')
  })
})
