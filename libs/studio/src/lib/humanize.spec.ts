import { humanize } from './humanize'

describe('humanize', () => {
  it('converts camelCase keys to space-separated title case', () => {
    expect(humanize('ariaLabel')).toBe('Aria Label')
    expect(humanize('maxLength')).toBe('Max Length')
    expect(humanize('firstName')).toBe('First Name')
  })

  it('splits snake_case and kebab-case', () => {
    expect(humanize('max_length')).toBe('Max Length')
    expect(humanize('max-length')).toBe('Max Length')
    expect(humanize('first_name_or_alias')).toBe('First Name Or Alias')
  })

  it('preserves fully-uppercase runs', () => {
    expect(humanize('URL')).toBe('URL')
    expect(humanize('httpURL')).toBe('Http URL')
    expect(humanize('URLSlug')).toBe('URL Slug')
  })

  it('capitalizes single-word keys', () => {
    expect(humanize('label')).toBe('Label')
    expect(humanize('x')).toBe('X')
  })

  it('returns empty string for empty input', () => {
    expect(humanize('')).toBe('')
  })

  it('handles numbers as word boundaries', () => {
    expect(humanize('line1Height')).toBe('Line1 Height')
    expect(humanize('step2Enabled')).toBe('Step2 Enabled')
  })
})
