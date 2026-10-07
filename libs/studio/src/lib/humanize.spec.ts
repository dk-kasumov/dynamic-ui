import { humanize } from './humanize'

describe('humanize', () => {
  it.each([
    ['ariaLabel', 'Aria Label'],
    ['maxLength', 'Max Length'],
    ['first_name_or_alias', 'First Name Or Alias'],
    ['max-length', 'Max Length'],
    ['URL', 'URL'],
    ['httpURL', 'Http URL'],
    ['URLSlug', 'URL Slug'],
    ['label', 'Label'],
    ['x', 'X'],
    ['line1Height', 'Line1 Height'],
    ['', '']
  ])('humanize(%j) -> %j', (input, expected) => {
    expect(humanize(input)).toBe(expected)
  })
})
