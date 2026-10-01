import type { Node, NodeId } from './node'
import type { RelationInstance } from './relations'
import { Tree, TreeError, createNode } from './tree'

const id = (s: string) => s as NodeId

const buildRoot = (): Node =>
  createNode({
    id: id('root'),
    name: 'Form',
    children: [
      createNode({
        id: id('row-1'),
        name: 'Row',
        children: [createNode({ id: id('email'), name: 'TextInput' })]
      }),
      createNode({ id: id('submit'), name: 'Button' })
    ]
  })

const makeTree = () => new Tree(buildRoot())

describe('createNode', () => {
  it('generates an id when omitted', () => {
    expect(createNode({ name: 'X' }).id).not.toBe(createNode({ name: 'X' }).id)
  })

  it('defaults props and relations to empty, keeps children only when passed', () => {
    const n = createNode({ name: 'X' })
    expect(n.props).toEqual({})
    expect(n.relations).toEqual({})
    expect(n.children).toBeUndefined()
  })
})

describe('Tree.find / parentOf', () => {
  const tree = makeTree()

  it('finds nodes by id', () => {
    expect(tree.find(id('root'))).toBe(tree.root)
    expect(tree.find(id('email'))?.name).toBe('TextInput')
    expect(tree.find(id('nope'))).toBeUndefined()
  })

  it('returns the immediate parent', () => {
    expect(tree.parentOf(id('email'))?.id).toBe('row-1')
    expect(tree.parentOf(id('row-1'))?.id).toBe('root')
    expect(tree.parentOf(id('root'))).toBeUndefined()
  })
})

describe('Tree.add', () => {
  it('appends to a parent without children', () => {
    const tree = new Tree(createNode({ id: id('root'), name: 'Form' }))
    const nodeId = tree.add(id('root'), { name: 'TextInput' })
    expect(tree.root.children).toHaveLength(1)
    expect(tree.root.children![0].id).toBe(nodeId)
  })

  it('inserts at a given index', () => {
    const tree = makeTree()
    tree.add(id('root'), { name: 'Divider' }, 1)
    expect(tree.root.children!.map(c => c.name)).toEqual(['Row', 'Divider', 'Button'])
  })

  it('clamps a negative or oversized index', () => {
    const a = makeTree()
    a.add(id('root'), { name: 'H' }, -5)
    expect(a.root.children![0].name).toBe('H')

    const b = makeTree()
    b.add(id('root'), { name: 'T' }, 999)
    expect(b.root.children!.at(-1)?.name).toBe('T')
  })

  it('preserves the id when provided', () => {
    const tree = makeTree()
    const nodeId = tree.add(id('root'), { id: id('custom'), name: 'X' })
    expect(nodeId).toBe('custom')
    expect(tree.find(id('custom'))).toBeTruthy()
  })

  it('throws when the parent does not exist', () => {
    expect(() => makeTree().add(id('nope'), { name: 'X' })).toThrow(TreeError)
  })
})

describe('Tree.remove', () => {
  it('removes a leaf', () => {
    const tree = makeTree()
    tree.remove(id('email'))
    expect(tree.find(id('email'))).toBeUndefined()
    expect(tree.find(id('row-1'))?.children).toEqual([])
  })

  it('removes a subtree', () => {
    const tree = makeTree()
    tree.remove(id('row-1'))
    expect(tree.find(id('row-1'))).toBeUndefined()
    expect(tree.find(id('email'))).toBeUndefined()
  })

  it('throws when removing the root', () => {
    expect(() => makeTree().remove(id('root'))).toThrow(/root/)
  })

  it('throws when the node does not exist', () => {
    expect(() => makeTree().remove(id('nope'))).toThrow(/not found/)
  })
})

describe('Tree.move', () => {
  it('reparents a node', () => {
    const tree = makeTree()
    tree.move(id('email'), id('root'))
    expect(tree.parentOf(id('email'))?.id).toBe('root')
    expect(tree.find(id('row-1'))?.children).toEqual([])
  })

  it('places at a given index', () => {
    const tree = makeTree()
    tree.move(id('email'), id('root'), 0)
    expect(tree.root.children![0].id).toBe('email')
  })

  it('rejects moving the root', () => {
    expect(() => makeTree().move(id('root'), id('row-1'))).toThrow(/root/)
  })

  it('rejects moving a node into itself', () => {
    expect(() => makeTree().move(id('row-1'), id('row-1'))).toThrow(/itself/)
  })

  it('rejects moving a node into one of its descendants', () => {
    expect(() => makeTree().move(id('row-1'), id('email'))).toThrow(/descendant/)
  })

  it('preserves the moved subtree', () => {
    const tree = makeTree()
    tree.move(id('row-1'), id('submit'))
    expect(tree.find(id('email'))?.name).toBe('TextInput')
  })
})

describe('Tree.setProp', () => {
  it('sets a top-level prop', () => {
    const tree = makeTree()
    tree.setProp(id('email'), ['label'], 'Email')
    expect(tree.find(id('email'))?.props['label']).toBe('Email')
  })

  it('sets a nested prop (group)', () => {
    const tree = makeTree()
    tree.setProp(id('email'), ['validators', 'emailRegexp'], '.+@.+')
    const props = tree.find(id('email'))?.props as { validators: { emailRegexp: string } }
    expect(props.validators.emailRegexp).toBe('.+@.+')
  })

  it('preserves sibling keys when writing nested', () => {
    const tree = makeTree()
    tree.setProp(id('email'), ['validators', 'required'], true)
    tree.setProp(id('email'), ['validators', 'emailRegexp'], '.+@.+')
    expect(tree.find(id('email'))?.props['validators']).toEqual({ required: true, emailRegexp: '.+@.+' })
  })

  it('throws on an empty path', () => {
    expect(() => makeTree().setProp(id('email'), [], 'x')).toThrow(/empty/)
  })

  it('throws when the node is missing', () => {
    expect(() => makeTree().setProp(id('nope'), ['label'], 'x')).toThrow(/not found/)
  })
})

describe('Tree.setRelation / removeRelation', () => {
  const visible: RelationInstance = {
    variant: 'builtin',
    returns: 'boolean',
    ast: { op: 'isEmpty', arg: { kind: 'ref', nodeId: 'other' } }
  }

  it('sets a relation', () => {
    const tree = makeTree()
    tree.setRelation(id('email'), 'visible', visible)
    expect(tree.find(id('email'))?.relations['visible']).toEqual(visible)
  })

  it('overwrites an existing relation', () => {
    const tree = makeTree()
    tree.setRelation(id('email'), 'visible', visible)
    const other: RelationInstance = { ...visible, ast: { op: 'formValid' } }
    tree.setRelation(id('email'), 'visible', other)
    expect(tree.find(id('email'))?.relations['visible']).toEqual(other)
  })

  it('removes a relation', () => {
    const tree = makeTree()
    tree.setRelation(id('email'), 'visible', visible)
    tree.removeRelation(id('email'), 'visible')
    expect(tree.find(id('email'))?.relations['visible']).toBeUndefined()
  })

  it('removeRelation is a no-op when the relation is absent', () => {
    const tree = makeTree()
    tree.removeRelation(id('email'), 'visible')
    expect(tree.find(id('email'))?.relations).toEqual({})
  })

  it('throws when the node is missing', () => {
    expect(() => makeTree().setRelation(id('nope'), 'x', visible)).toThrow(/not found/)
    expect(() => makeTree().removeRelation(id('nope'), 'x')).toThrow(/not found/)
  })
})
