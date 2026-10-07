import { StudioError } from './error'
import type { Node, NodeId } from './node'
import type { RelationInstance } from './relations'
import { Tree, createNode, type NewNode } from './tree'

// Helpers --------------------------------------------------------------------

const leaf = (id: string): NewNode => ({ id: id as NodeId, name: 'Leaf' })
const box = (id: string, ...children: NewNode[]): NewNode => ({ id: id as NodeId, name: 'Box', children })

const make = (root: NewNode) => new Tree(createNode(root))
const ids = (nodes: readonly Node[] | undefined) => (nodes ?? []).map(node => node.id)

function* walk(node: Node): Generator<Node> {
  yield node
  for (const child of node.children ?? []) yield* walk(child)
}
const all = (tree: Tree) => [...walk(tree.root)]
const id = (value: string) => value as NodeId

// Behaviour ------------------------------------------------------------------

describe('Tree lookups', () => {
  const tree = make(box('root', box('a', leaf('a1'), leaf('a2')), leaf('b')))

  it('finds nodes anywhere in the tree', () => {
    expect(tree.find(id('a2'))?.id).toBe('a2')
    expect(tree.find(id('root'))).toBe(tree.root)
    expect(tree.find(id('nope'))).toBeUndefined()
  })

  it('returns the parent, and none for the root or an unknown id', () => {
    expect(tree.parentOf(id('a1'))?.id).toBe('a')
    expect(tree.parentOf(id('a'))).toBe(tree.root)
    expect(tree.parentOf(id('root'))).toBeUndefined()
    expect(tree.parentOf(id('nope'))).toBeUndefined()
  })

  it('treats a node as its own descendant, and finds nested ones', () => {
    expect(tree.isDescendant(id('a'), id('a'))).toBe(true)
    expect(tree.isDescendant(id('a'), id('a2'))).toBe(true)
    expect(tree.isDescendant(id('root'), id('a1'))).toBe(true)
    expect(tree.isDescendant(id('a'), id('b'))).toBe(false)
    expect(tree.isDescendant(id('a1'), id('a'))).toBe(false)
    expect(tree.isDescendant(id('nope'), id('a'))).toBe(false)
    expect(tree.isDescendant(id('a'), id('nope'))).toBe(false)
  })
})

describe('Tree structural sharing', () => {
  it('re-creates only the path to a change and shares everything else', () => {
    const tree = make(box('root', box('a', leaf('a1'), leaf('a2')), box('b', leaf('b1'))))
    const before = Object.fromEntries(all(tree).map(node => [node.id, node]))

    tree.setProp(id('a1'), ['x'], 1)

    const after = Object.fromEntries(all(tree).map(node => [node.id, node]))
    for (const changed of ['root', 'a', 'a1']) expect(after[changed]).not.toBe(before[changed])
    for (const same of ['a2', 'b', 'b1']) expect(after[same]).toBe(before[same])
  })

  it('does not mutate the previous root', () => {
    const tree = make(box('root', leaf('a')))
    const previous = tree.root
    tree.add(id('root'), leaf('b'))
    expect(ids(previous.children)).toEqual(['a'])
    expect(ids(tree.root.children)).toEqual(['a', 'b'])
  })
})

describe('Tree.add', () => {
  it('appends by default and honours an index, clamped to the range', () => {
    const tree = make(box('root', leaf('a'), leaf('b')))
    tree.add(id('root'), leaf('c'))
    tree.add(id('root'), leaf('d'), 0)
    tree.add(id('root'), leaf('e'), 99)
    tree.add(id('root'), leaf('f'), -5)
    expect(ids(tree.root.children)).toEqual(['f', 'd', 'a', 'b', 'c', 'e'])
  })

  it('creates the children list on a node that had none', () => {
    const tree = make(box('root', leaf('a')))
    tree.add(id('a'), leaf('a1'))
    expect(ids(tree.find(id('a'))?.children)).toEqual(['a1'])
  })

  it('adds a whole subtree and returns the new id', () => {
    const tree = make(box('root'))
    expect(tree.add(id('root'), box('x', leaf('x1')))).toBe('x')
    expect(tree.find(id('x1'))).toBeDefined()
  })

  it('rejects an unknown parent', () => {
    expect(() => make(box('root')).add(id('nope'), leaf('a'))).toThrow(StudioError)
  })
})

describe('Tree.remove', () => {
  it('removes a node together with its subtree', () => {
    const tree = make(box('root', box('a', leaf('a1')), leaf('b')))
    tree.remove(id('a'))
    expect(ids(tree.root.children)).toEqual(['b'])
    expect(tree.find(id('a1'))).toBeUndefined()
  })

  it('rejects the root and unknown ids', () => {
    const tree = make(box('root', leaf('a')))
    expect(() => tree.remove(id('root'))).toThrow('Cannot remove the root node')
    expect(() => tree.remove(id('nope'))).toThrow(StudioError)
  })
})

describe('Tree.remove and relations', () => {
  const dependsOn = (...targets: string[]): RelationInstance => ({
    combine: 'and',
    rules: targets.map(target => ({ target: id(target), operator: 'isNotEmpty' }))
  })
  const targetsOf = (tree: Tree, nodeId: string, relation: string) =>
    tree.find(id(nodeId))?.relations[relation]?.rules.map(rule => rule.target)

  it('drops the rules that pointed into the removed subtree and keeps the others', () => {
    const tree = make(box('root', box('a', leaf('a1')), leaf('b'), leaf('c')))
    tree.setRelation(id('c'), 'visible', dependsOn('a1', 'b'))

    tree.remove(id('a'))
    expect(targetsOf(tree, 'c', 'visible')).toEqual(['b'])
  })

  it('removes a relation once none of its rules are left', () => {
    const tree = make(box('root', leaf('a'), leaf('c')))
    tree.setRelation(id('c'), 'visible', dependsOn('a'))
    tree.remove(id('a'))
    expect(tree.find(id('c'))?.relations).toEqual({})
  })

  it('leaves unrelated nodes untouched', () => {
    const tree = make(box('root', leaf('a'), leaf('b'), leaf('c')))
    tree.setRelation(id('c'), 'visible', dependsOn('b'))
    const before = tree.find(id('c'))
    tree.remove(id('a'))
    expect(tree.find(id('c'))).toBe(before)
  })

  it('does not drop relations when a node is only moved', () => {
    const tree = make(box('root', box('a', leaf('a1')), leaf('b'), leaf('c')))
    tree.setRelation(id('c'), 'visible', dependsOn('a1'))
    tree.move(id('a1'), id('b'))
    expect(targetsOf(tree, 'c', 'visible')).toContain('a1')
  })

  it('ignores relations that point out of the removed subtree', () => {
    const tree = make(box('root', box('a', leaf('a1')), leaf('b')))
    tree.setRelation(id('a1'), 'visible', dependsOn('b'))
    tree.remove(id('a'))
    expect(ids(tree.root.children)).toEqual(['b'])
    expect(tree.find(id('b'))?.relations).toEqual({})
  })
})

describe('Tree.move', () => {
  const order = (tree: Tree, parent = 'root') => ids(tree.find(id(parent))?.children)

  it('moves a node into another parent at an index', () => {
    const tree = make(box('root', box('a', leaf('a1')), box('b', leaf('b1'), leaf('b2'))))
    tree.move(id('a1'), id('b'), 1)
    expect(order(tree, 'a')).toEqual([])
    expect(order(tree, 'b')).toEqual(['b1', 'a1', 'b2'])
    expect(tree.parentOf(id('a1'))?.id).toBe('b')
  })

  it('reorders within the same parent, with the index counted after the node is lifted out', () => {
    const forward = make(box('root', leaf('a'), leaf('b'), leaf('c')))
    forward.move(id('a'), id('root'), 2)
    expect(order(forward)).toEqual(['b', 'c', 'a'])

    const backward = make(box('root', leaf('a'), leaf('b'), leaf('c')))
    backward.move(id('c'), id('root'), 0)
    expect(order(backward)).toEqual(['c', 'a', 'b'])
  })

  it('keeps the moved subtree intact', () => {
    const tree = make(box('root', box('a', leaf('a1')), leaf('b')))
    tree.move(id('a'), id('b'))
    expect(ids(tree.find(id('a'))?.children)).toEqual(['a1'])
    expect(tree.isDescendant(id('b'), id('a1'))).toBe(true)
  })

  it('rejects moves that would break the tree', () => {
    const tree = make(box('root', box('a', box('a1')), leaf('b')))
    expect(() => tree.move(id('root'), id('a'))).toThrow('Cannot move the root node')
    expect(() => tree.move(id('a'), id('a'))).toThrow('into itself')
    expect(() => tree.move(id('a'), id('a1'))).toThrow('descendants')
    expect(() => tree.move(id('nope'), id('b'))).toThrow(StudioError)
    expect(() => tree.move(id('b'), id('nope'))).toThrow(StudioError)
  })

  it('leaves the tree untouched when a move is rejected', () => {
    const tree = make(box('root', box('a', box('a1')), leaf('b')))
    const before = tree.root
    expect(() => tree.move(id('a'), id('a1'))).toThrow()
    expect(tree.root).toBe(before)
  })
})

describe('Tree node edits', () => {
  it('sets props at a path, creating the objects on the way', () => {
    const tree = make(box('root', leaf('a')))
    tree.setProp(id('a'), ['style', 'color'], 'red')
    tree.setProp(id('a'), ['style', 'size'], 2)
    expect(tree.find(id('a'))?.props).toEqual({ style: { color: 'red', size: 2 } })
    expect(() => tree.setProp(id('a'), [], 1)).toThrow('Prop path cannot be empty')
  })

  it('sets and clears meta fields', () => {
    const tree = make(box('root', leaf('a')))
    tree.setMeta(id('a'), { icon: 'home', title: 'Home', fieldName: 'my field' })
    expect(tree.find(id('a'))).toMatchObject({ icon: 'home', title: 'Home', fieldName: 'my_field' })
    tree.setMeta(id('a'), { icon: null, fieldName: '' })
    expect(tree.find(id('a'))).not.toHaveProperty('icon')
    expect(tree.find(id('a'))).not.toHaveProperty('fieldName')
    expect(tree.find(id('a'))?.title).toBe('Home')
  })

  it('sets and removes relations', () => {
    const tree = make(box('root', leaf('a')))
    const relation: RelationInstance = { combine: 'and', rules: [{ target: id('a'), operator: 'isEmpty' }] }
    tree.setRelation(id('a'), 'visible', relation)
    expect(tree.find(id('a'))?.relations['visible']).toBe(relation)
    tree.removeRelation(id('a'), 'visible')
    expect(tree.find(id('a'))?.relations).toEqual({})
  })

  it('rejects edits to unknown nodes', () => {
    const tree = make(box('root'))
    expect(() => tree.setProp(id('nope'), ['a'], 1)).toThrow(StudioError)
    expect(() => tree.setMeta(id('nope'), { icon: 'x' })).toThrow(StudioError)
    expect(() => tree.setRelation(id('nope'), 'r', { combine: 'and', rules: [] })).toThrow(
      StudioError
    )
  })
})

// Randomised invariants ---------------------------------------------------------

/** Small deterministic PRNG so a failure can be replayed from its seed. */
function rng(seed: number) {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

describe('Tree invariants under random edits', () => {
  function check(tree: Tree): void {
    const nodes = all(tree)
    const seen = new Set(nodes.map(node => node.id))
    expect(seen.size).toBe(nodes.length) // ids are unique, and (being finite) there is no cycle
    expect(tree.parentOf(tree.root.id)).toBeUndefined()
    for (const node of nodes) {
      expect(tree.find(node.id)).toBe(node)
      for (const child of node.children ?? []) expect(tree.parentOf(child.id)).toBe(node)
    }
  }

  it.each([1, 2, 3, 4, 5])('keeps the tree consistent (seed %i)', seed => {
    const random = rng(seed)
    const pick = <T>(items: T[]): T => items[Math.floor(random() * items.length)]!
    const tree = make(box('root'))
    let next = 0

    for (let step = 0; step < 120; step++) {
      const nodes = all(tree)
      const roll = random()
      if (roll < 0.45) {
        const subtree: NewNode = random() < 0.3 ? box(`n${next++}`, leaf(`n${next++}`)) : leaf(`n${next++}`)
        const count = nodes.length + 1 + (subtree.children?.length ?? 0)
        tree.add(pick(nodes).id, subtree, random() < 0.5 ? Math.floor(random() * 5) : undefined)
        expect(all(tree)).toHaveLength(count)
      } else if (roll < 0.8 && nodes.length > 1) {
        const moved = pick(nodes.slice(1))
        const targets = nodes.filter(node => !tree.isDescendant(moved.id, node.id))
        const before = new Set(nodes.map(node => node.id))
        tree.move(moved.id, pick(targets).id, random() < 0.5 ? Math.floor(random() * 5) : undefined)
        expect(new Set(all(tree).map(node => node.id))).toEqual(before)
      } else if (nodes.length > 1) {
        const removed = pick(nodes.slice(1))
        const gone = [...walk(removed)].length
        tree.remove(removed.id)
        expect(all(tree)).toHaveLength(nodes.length - gone)
      }
      check(tree)
    }
  })
})
