import type { NodeId } from './node'
import type { RelationInstance } from './relations'
import { Registry } from './registry'
import { Store } from './store'
import { Tree, createNode } from './tree'

const id = (s: string) => s as NodeId

const makeStore = () => {
  const root = createNode({
    id: id('root'),
    name: 'Form',
    children: [createNode({ id: id('email'), name: 'TextInput' })]
  })
  return new Store(new Tree(root), new Registry())
}

describe('Store selection', () => {
  it('starts with no selection', () => {
    expect(makeStore().selectedId).toBeNull()
  })

  it('updates the selection and fires', () => {
    const store = makeStore()
    const spy = jest.fn()
    store.subscribe(spy)
    store.select(id('email'))
    expect(store.selectedId).toBe('email')
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('does not fire when selecting the same id', () => {
    const store = makeStore()
    store.select(id('email'))
    const spy = jest.fn()
    store.subscribe(spy)
    store.select(id('email'))
    expect(spy).not.toHaveBeenCalled()
  })

  it('clears the selection when the selected node is removed', () => {
    const store = makeStore()
    store.select(id('email'))
    store.removeNode(id('email'))
    expect(store.selectedId).toBeNull()
  })
})

describe('Store mutations', () => {
  it('addNode delegates to tree and returns the new id', () => {
    const store = makeStore()
    const nodeId = store.addNode(id('root'), { name: 'Divider' })
    expect(store.tree.find(nodeId)?.name).toBe('Divider')
  })

  it('removeNode delegates to tree', () => {
    const store = makeStore()
    store.removeNode(id('email'))
    expect(store.tree.find(id('email'))).toBeUndefined()
  })

  it('moveNode delegates to tree', () => {
    const store = makeStore()
    const newId = store.addNode(id('root'), { id: id('row'), name: 'Row' })
    store.moveNode(id('email'), newId)
    expect(store.tree.parentOf(id('email'))?.id).toBe('row')
  })

  it('setProp delegates to tree', () => {
    const store = makeStore()
    store.setProp(id('email'), ['label'], 'Email')
    expect(store.tree.find(id('email'))?.props['label']).toBe('Email')
  })

  it('setRelation / removeRelation delegate to tree', () => {
    const store = makeStore()
    const visible: RelationInstance = {
      variant: 'builtin',
      returns: 'boolean',
      ast: { op: 'formValid' }
    }
    store.setRelation(id('email'), 'visible', visible)
    expect(store.tree.find(id('email'))?.relations['visible']).toEqual(visible)
    store.removeRelation(id('email'), 'visible')
    expect(store.tree.find(id('email'))?.relations['visible']).toBeUndefined()
  })

  it('emits on every mutation', () => {
    const store = makeStore()
    const spy = jest.fn()
    store.subscribe(spy)

    store.addNode(id('root'), { id: id('x'), name: 'X' })
    store.setProp(id('x'), ['label'], 'X')
    store.setRelation(id('x'), 'visible', { variant: 'builtin', returns: 'boolean', ast: { op: 'formValid' } })
    store.removeRelation(id('x'), 'visible')
    store.moveNode(id('x'), id('root'), 0)
    store.removeNode(id('x'))

    expect(spy).toHaveBeenCalledTimes(6)
  })

  it('does not emit when the underlying tree op throws', () => {
    const store = makeStore()
    const spy = jest.fn()
    store.subscribe(spy)
    expect(() => store.removeNode(id('nope'))).toThrow()
    expect(spy).not.toHaveBeenCalled()
  })
})

describe('Store subscriptions', () => {
  it('fires all listeners', () => {
    const store = makeStore()
    const a = jest.fn()
    const b = jest.fn()
    store.subscribe(a)
    store.subscribe(b)
    store.select(id('email'))
    expect(a).toHaveBeenCalledTimes(1)
    expect(b).toHaveBeenCalledTimes(1)
  })

  it('unsubscribe stops a listener', () => {
    const store = makeStore()
    const spy = jest.fn()
    const unsub = store.subscribe(spy)
    unsub()
    store.select(id('email'))
    expect(spy).not.toHaveBeenCalled()
  })
})
