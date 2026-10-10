import * as v from 'valibot'
import { Studio } from './studio'
import type { Primitive } from './primitives'
import { validateProps } from './validation'

const define = (props: Record<string, Primitive>) => Studio.defineComponent({ title: 'Controls/X', props })

describe('validateProps', () => {
  it('returns no errors when every value passes its schema', () => {
    const def = define({ label: Studio.text({ validation: v.pipe(v.string(), v.nonEmpty()) }) })
    expect(validateProps(def, { label: 'Hi' })).toEqual([])
  })

  it('ignores props that declare no validation schema', () => {
    const def = define({ label: Studio.text(), count: Studio.decimal() })
    expect(validateProps(def, { label: null, count: null })).toEqual([])
  })

  it('reports the path, humanized label and messages of a failing value', () => {
    const def = define({ maxLength: Studio.text({ validation: v.pipe(v.string('Must be text'), v.nonEmpty('Required')) }) })
    expect(validateProps(def, { maxLength: null })).toEqual([
      { path: ['maxLength'], label: 'Max Length', messages: ['Must be text'] }
    ])
  })

  it('collects every failing message for one field', () => {
    const def = define({
      pin: Studio.text({ validation: v.pipe(v.string(), v.minLength(5, 'Too short'), v.regex(/\d/, 'Needs a digit')) })
    })
    const [error] = validateProps(def, { pin: 'ab' })
    expect(error?.messages).toEqual(['Too short', 'Needs a digit'])
  })

  it('validates group members recursively, with nested paths', () => {
    const def = define({
      box: Studio.group({
        x: Studio.text({ validation: v.pipe(v.string(), v.nonEmpty('X is required')) }),
        y: Studio.text()
      })
    })
    expect(validateProps(def, { box: { x: '', y: 'ok' } })).toEqual([
      { path: ['box', 'x'], label: 'X', messages: ['X is required'] }
    ])
  })
})

describe('Studio.validate', () => {
  const Field = Studio.defineComponent({
    title: 'Controls/Field',
    props: { label: Studio.text({ validation: v.pipe(v.string('Label is required'), v.nonEmpty('Label is required')) }) }
  })

  it('maps only the nodes that have failures, and clears them once fixed', () => {
    const studio = new Studio({ components: [Field] })
    const a = studio.addNode(studio.root.id, { name: 'Controls/Field' })
    const b = studio.addNode(studio.root.id, { name: 'Controls/Field' })

    expect([...studio.validate().keys()]).toEqual([a, b])

    studio.setProp(a, ['label'], 'Email')
    const errors = studio.validate()
    expect([...errors.keys()]).toEqual([b])
    expect(errors.get(b)).toEqual([{ path: ['label'], label: 'Label', messages: ['Label is required'] }])
  })
})
