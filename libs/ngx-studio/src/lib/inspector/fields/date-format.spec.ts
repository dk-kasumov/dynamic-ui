import { fromIsoDate, fromIsoTime, toDatePattern, toIsoDate, toIsoTime } from './date-format'

describe('toDatePattern', () => {
  it('defaults to the Angular shortDate format of the locale', () => {
    expect(toDatePattern(undefined, 'en-US')).toBe('M/d/yy')
    expect(toDatePattern('shortDate', 'en-US')).toBe('M/d/yy')
  })

  it('resolves the other named Angular formats', () => {
    expect(toDatePattern('mediumDate', 'en-US')).toBe('MMM d, y')
    expect(toDatePattern('longDate', 'en-US')).toBe('MMMM d, y')
    expect(toDatePattern('fullDate', 'en-US')).toBe('EEEE, MMMM d, y')
  })

  it('falls back to en-US for locales without registered data', () => {
    expect(toDatePattern('shortDate', 'xx-YY')).toBe('M/d/yy')
  })

  it('passes Angular-style custom patterns through', () => {
    expect(toDatePattern('dd-MM-yyyy', 'en-US')).toBe('dd-MM-yyyy')
  })

  it('translates moment-style tokens', () => {
    expect(toDatePattern('DD-MM-YYYY', 'en-US')).toBe('dd-MM-yyyy')
    expect(toDatePattern('D/M/YY', 'en-US')).toBe('d/M/yy')
  })

  it('leaves quoted literals untouched', () => {
    expect(toDatePattern(`'Day' DD`, 'en-US')).toBe(`'Day' dd`)
  })
})

describe('ISO conversion', () => {
  it('round-trips calendar dates without timezone drift', () => {
    expect(toIsoDate(fromIsoDate('2026-10-06'))).toBe('2026-10-06')
    expect(fromIsoDate('2026-10-06')?.getDate()).toBe(6)
  })

  it('round-trips times of day', () => {
    expect(toIsoTime(fromIsoTime('09:30'))).toBe('09:30')
    expect(toIsoTime(fromIsoTime('23:05'))).toBe('23:05')
  })

  it('treats empty and invalid input as null', () => {
    expect(fromIsoDate('')).toBeNull()
    expect(fromIsoDate('nope')).toBeNull()
    expect(fromIsoTime(undefined)).toBeNull()
    expect(toIsoDate(null)).toBeNull()
    expect(toIsoTime(new Date('invalid'))).toBeNull()
  })
})
