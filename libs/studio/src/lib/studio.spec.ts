import { Studio, buildLinkIndex } from './studio'
import type { NodeId, RelationInstance } from './studio'

// A realistic set of registered components the UI would receive at app boot.
const TextInput = Studio.defineComponent({
  title: 'Controls/TextInput',
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
  title: 'Controls/Button',
  props: { label: Studio.text() },
  relations: { disabled: Studio.relation({ returns: 'boolean' }) }
})

const Form = Studio.defineComponent({
  title: 'Containers/Form',
  props: { title: Studio.text() },
  container: true
})

const makeStudio = () => new Studio({ components: [TextInput, Button, Form] })

describe('Studio DSL', () => {
  it('exposes primitive and relation factories as statics', () => {
    expect(Studio.text({ default: 'anon' })).toEqual({ kind: 'text', default: 'anon' })
    expect(Studio.enum(['sm', 'md', 'lg']).options).toEqual(['sm', 'md', 'lg'])
    expect(Studio.code({ default: '{}' })).toEqual({ kind: 'code', default: '{}' })
    expect(Studio.time()).toEqual({ kind: 'time' })
    expect(Studio.date({ range: true, format: 'DD-MM-YYYY' })).toEqual({
      kind: 'date',
      range: true,
      format: 'DD-MM-YYYY'
    })
    expect(Studio.relation()).toEqual({ kind: 'relation', returns: 'boolean' })
    expect(Studio.relation({ returns: 'value' }).returns).toBe('value')
  })

  it('accepts a hint on every primitive', () => {
    const hint = 'Name in format Name - Surname'
    expect(Studio.text({ hint }).hint).toBe(hint)
    expect(Studio.decimal({ hint }).hint).toBe(hint)
    expect(Studio.checkbox({ hint }).hint).toBe(hint)
    expect(Studio.select({ hint }).hint).toBe(hint)
    expect(Studio.enum(['a', 'b'], { hint }).hint).toBe(hint)
    expect(Studio.group({ a: Studio.text() }, { hint }).hint).toBe(hint)
    expect(Studio.code({ hint }).hint).toBe(hint)
    expect(Studio.time({ hint }).hint).toBe(hint)
    expect(Studio.date({ hint }).hint).toBe(hint)
  })

  it('seeds a new node with every declared prop: provided wins, else default, else null — recursively for groups', () => {
    const Widget = Studio.defineComponent({
      title: 'Controls/Widget',
      props: {
        label: Studio.text(),
        size: Studio.decimal({ default: 3 }),
        box: Studio.group({ x: Studio.text({ default: 'a' }), y: Studio.text() })
      }
    })
    const studio = new Studio({ components: [Widget] })
    const id = studio.addNode(studio.root.id, { name: 'Controls/Widget', props: { label: 'Hi' } })
    expect(studio.findNode(id)?.props).toEqual({ label: 'Hi', size: 3, box: { x: 'a', y: null } })
  })

  it('materializes props across a whole added subtree and for the constructor root', () => {
    const Box = Studio.defineComponent({
      title: 'Containers/Box',
      props: { title: Studio.text({ default: 'Untitled' }) },
      container: true
    })
    const Leaf = Studio.defineComponent({ title: 'Controls/Leaf', props: { name: Studio.text() } })

    const studio = new Studio({ components: [Box, Leaf], root: { name: 'Containers/Box' } })
    expect(studio.root.props).toEqual({ title: 'Untitled' })

    const boxId = studio.addNode(studio.root.id, { name: 'Containers/Box', children: [{ name: 'Controls/Leaf' }] })
    const box = studio.findNode(boxId)
    expect(box?.props).toEqual({ title: 'Untitled' })
    expect(box?.children?.[0]?.props).toEqual({ name: null })
  })

  it('stores code, time and date values as plain JSON-safe data', () => {
    const Event = Studio.defineComponent({
      title: 'Controls/Event',
      props: {
        payload: Studio.code(),
        startsAt: Studio.time(),
        day: Studio.date(),
        window: Studio.date({ range: true })
      }
    })
    const studio = new Studio({ components: [Event] })
    const id = studio.addNode(studio.root.id, { name: 'Controls/Event' })

    studio.setProp(id, ['payload'], '{ "a": 1 }')
    studio.setProp(id, ['startsAt'], '09:30')
    studio.setProp(id, ['day'], '2026-10-06')
    studio.setProp(id, ['window'], { start: '2026-10-06', end: '2026-10-09' })

    const props = studio.findNode(id)?.props
    expect(JSON.parse(JSON.stringify(props))).toEqual({
      payload: '{ "a": 1 }',
      startsAt: '09:30',
      day: '2026-10-06',
      window: { start: '2026-10-06', end: '2026-10-09' }
    })
  })
})

describe('Studio — end-to-end usage', () => {
  it('serves the palette: lists and looks up registered components', () => {
    const studio = makeStudio()
    expect(studio.getComponents().map(c => c.title)).toEqual([
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
      combine: 'and',
      rules: [{ target: emailId, operator: 'isEmpty' }]
    })

    // UI can walk the tree to render it.
    expect(studio.root.children).toHaveLength(2)
    expect(studio.findNode(emailId)?.props['label']).toBe('Email')
    expect(studio.findNode(submitId)?.relations['disabled']?.rules[0]?.target).toBe(emailId)
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

  it('derives a component label from the last segment of its title', () => {
    const studio = makeStudio()
    expect(studio.getComponent('Controls/TextInput')?.label).toBe('TextInput')
  })

  it('stores a field name per node, turning whitespace into underscores', () => {
    const studio = makeStudio()
    const id = studio.addNode(studio.root.id, { name: 'Controls/TextInput', fieldName: 'first name' })
    expect(studio.findNode(id)?.fieldName).toBe('first_name')

    studio.setMeta(id, { fieldName: 'last  Name ' })
    expect(studio.findNode(id)?.fieldName).toBe('last_Name_')

    studio.setMeta(id, { fieldName: 'email' })
    expect(studio.findNode(id)?.fieldName).toBe('email')

    studio.setMeta(id, { fieldName: '' })
    expect(studio.findNode(id)).not.toHaveProperty('fieldName')
  })
})

describe('relation instances', () => {
  it('stores conditions verbatim on the node', () => {
    const studio = makeStudio()
    const a = studio.addNode(studio.root.id, { name: 'Controls/TextInput' })
    const field = studio.addNode(studio.root.id, { name: 'Controls/TextInput' })
    const instance: RelationInstance = {
      combine: 'or',
      rules: [
        { target: a, operator: 'isValid' },
        { target: field, operator: 'equals', value: 'admin' }
      ]
    }
    studio.setRelation(field, 'visible', instance)
    expect(studio.findNode(field)?.relations['visible']).toEqual(instance)
  })
})

describe('Studio.defineAdapter', () => {
  it('maps the current AST with the adapter it was given', () => {
    const studio = makeStudio()
    studio.addNode(studio.root.id, { name: 'Controls/TextInput', fieldName: 'email' })
    studio.addNode(studio.root.id, { name: 'Controls/Button' })

    const fieldNames = Studio.defineAdapter({
      map: root => (root.children ?? []).flatMap(child => (child.fieldName ? [child.fieldName] : []))
    })
    expect(fieldNames.map(studio.root)).toEqual(['email'])
  })
})

describe('buildLinkIndex', () => {
  const dependsOn = (...targets: NodeId[]): RelationInstance => ({
    combine: 'and',
    rules: targets.map(target => ({ target, operator: 'isEmpty' }))
  })

  it('maps links in both directions', () => {
    const studio = makeStudio()
    const email = studio.addNode(studio.root.id, { name: 'Controls/TextInput' })
    const role = studio.addNode(studio.root.id, { name: 'Controls/TextInput' })
    const submit = studio.addNode(studio.root.id, { name: 'Controls/Button' })
    studio.setRelation(submit, 'disabled', dependsOn(email, role))

    const index = buildLinkIndex(studio.root)
    expect(index.get(submit)).toEqual({ to: [email, role], from: [] })
    expect(index.get(email)).toEqual({ to: [], from: [submit] })
    expect(index.get(role)).toEqual({ to: [], from: [submit] })
  })

  it('counts a target once even when several relations or rules point at it', () => {
    const studio = makeStudio()
    const email = studio.addNode(studio.root.id, { name: 'Controls/TextInput' })
    const field = studio.addNode(studio.root.id, { name: 'Controls/TextInput' })
    studio.setRelation(field, 'visible', dependsOn(email, email))
    studio.setRelation(field, 'required', dependsOn(email))

    const index = buildLinkIndex(studio.root)
    expect(index.get(field)?.to).toEqual([email])
    expect(index.get(email)?.from).toEqual([field])
  })

  it('gives unlinked nodes empty links and ignores targets that no longer exist', () => {
    const studio = makeStudio()
    const lonely = studio.addNode(studio.root.id, { name: 'Controls/Button' })
    const gone = studio.addNode(studio.root.id, { name: 'Controls/TextInput' })
    const field = studio.addNode(studio.root.id, { name: 'Controls/TextInput' })
    studio.setRelation(field, 'visible', dependsOn(gone))
    studio.removeNode(gone)

    const index = buildLinkIndex(studio.root)
    expect(index.get(lonely)).toEqual({ to: [], from: [] })
    expect(index.get(field)).toEqual({ to: [], from: [] })
  })
})

describe('Studio.relationTargets', () => {
  const build = () => {
    const studio = makeStudio()
    const section = studio.addNode(studio.root.id, { name: 'Containers/Form' })
    const inner = studio.addNode(section, { name: 'Controls/TextInput' })
    const sibling = studio.addNode(section, { name: 'Controls/Button' })
    const outside = studio.addNode(studio.root.id, { name: 'Controls/TextInput' })
    return { studio, section, inner, sibling, outside }
  }

  it('offers every other node, never the node itself or anything inside it', () => {
    const { studio, section, inner, sibling, outside } = build()
    expect(studio.relationTargets(inner).map(n => n.id)).toEqual([section, sibling, outside])
    expect(studio.relationTargets(section).map(n => n.id)).toEqual([outside])
  })

  it('narrows to siblings or to component kinds', () => {
    const { studio, inner, sibling, outside } = build()
    expect(studio.relationTargets(inner, { scope: 'siblings' }).map(n => n.id)).toEqual([sibling])
    expect(studio.relationTargets(sibling, { kinds: ['Controls/TextInput'] }).map(n => n.id)).toEqual([inner, outside])
  })
})

describe('Studio.removeNode', () => {
  it('publishes nothing when the removal is rejected', () => {
    const studio = makeStudio()
    const spy = jest.fn()
    studio.state$.subscribe(spy)
    expect(() => studio.removeNode(studio.root.id)).toThrow()
    expect(spy).toHaveBeenCalledTimes(1) // only the replayed initial snapshot
  })
})
