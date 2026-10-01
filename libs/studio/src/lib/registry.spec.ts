import { Registry, RegistryError, Studio, defineComponent } from './studio'

const textInput = defineComponent({
  name: 'Controls/TextInput',
  props: { label: Studio.text() }
})

const checkbox = defineComponent({
  name: 'Controls/Checkbox',
  props: { label: Studio.text() }
})

describe('Registry', () => {
  let registry: Registry

  beforeEach(() => {
    registry = new Registry()
  })

  it('starts empty', () => {
    expect(registry.size).toBe(0)
    expect(registry.getAll()).toEqual([])
    expect(registry.getNames()).toEqual([])
  })

  it('registers and retrieves a component', () => {
    registry.register(textInput)

    expect(registry.size).toBe(1)
    expect(registry.has('Controls/TextInput')).toBe(true)
    expect(registry.get('Controls/TextInput')).toBe(textInput)
  })

  it('throws when registering a duplicate name', () => {
    registry.register(textInput)

    expect(() => registry.register(textInput)).toThrow(RegistryError)
    expect(() => registry.register(textInput)).toThrow(/already registered/)
  })

  it('throws when registering a component with an empty name', () => {
    const bad = defineComponent({ name: '', props: {} })

    expect(() => registry.register(bad)).toThrow(RegistryError)
    expect(() => registry.register(bad)).toThrow(/non-empty string/)
  })

  it('registerAll registers multiple components', () => {
    registry.registerAll([textInput, checkbox])

    expect(registry.size).toBe(2)
    expect(registry.getNames()).toEqual(['Controls/TextInput', 'Controls/Checkbox'])
  })

  it('registerAll fails fast on the first duplicate (prior registrations remain)', () => {
    registry.register(textInput)

    expect(() => registry.registerAll([checkbox, textInput])).toThrow(RegistryError)
    // checkbox was registered before the failure
    expect(registry.has('Controls/Checkbox')).toBe(true)
  })

  it('require returns the definition when it exists', () => {
    registry.register(textInput)

    expect(registry.require('Controls/TextInput')).toBe(textInput)
  })

  it('require throws when the component is missing', () => {
    expect(() => registry.require('Nope')).toThrow(RegistryError)
    expect(() => registry.require('Nope')).toThrow(/not registered/)
  })

  it('get returns undefined for a missing component', () => {
    expect(registry.get('Nope')).toBeUndefined()
  })

  it('unregister removes an existing component and returns true', () => {
    registry.register(textInput)

    expect(registry.unregister('Controls/TextInput')).toBe(true)
    expect(registry.has('Controls/TextInput')).toBe(false)
  })

  it('unregister returns false when the component does not exist', () => {
    expect(registry.unregister('Nope')).toBe(false)
  })

  it('clear removes all components', () => {
    registry.registerAll([textInput, checkbox])
    registry.clear()

    expect(registry.size).toBe(0)
    expect(registry.getAll()).toEqual([])
  })
})
