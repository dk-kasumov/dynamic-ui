import { fromIsoDate, fromIsoTime, toDatePattern, toIsoDate, toIsoTime } from './date-format'

describe('toDatePattern', () => {
  it.each([
    [undefined, 'M/d/yy'],
    ['shortDate', 'M/d/yy'],
    ['mediumDate', 'MMM d, y'],
    ['longDate', 'MMMM d, y'],
    ['fullDate', 'EEEE, MMMM d, y'],
    ['dd-MM-yyyy', 'dd-MM-yyyy'],
    ['DD-MM-YYYY', 'dd-MM-yyyy'],
    ['D/M/YY', 'd/M/yy'],
    [`'Day' DD`, `'Day' dd`]
  ])('toDatePattern(%j, en-US) -> %j', (format, expected) => {
    expect(toDatePattern(format, 'en-US')).toBe(expected)
  })

  it('falls back to en-US for locales without registered data', () => {
    expect(toDatePattern('shortDate', 'xx-YY')).toBe('M/d/yy')
  })
})

describe('ISO conversion', () => {
  it('round-trips calendar dates without timezone drift', () => {
    expect(toIsoDate(fromIsoDate('2026-10-06'))).toBe('2026-10-06')
    expect(fromIsoDate('2026-10-06')?.getDate()).toBe(6)
  })

  it('round-trips times of day', () => {
    expect(toIsoTime(fromIsoTime('23:05'))).toBe('23:05')
  })

  it.each([
    ['fromIsoDate empty', () => fromIsoDate('')],
    ['fromIsoDate invalid', () => fromIsoDate('nope')],
    ['fromIsoTime undefined', () => fromIsoTime(undefined)],
    ['toIsoDate null', () => toIsoDate(null)],
    ['toIsoTime invalid date', () => toIsoTime(new Date('invalid'))]
  ])('treats %s as null', (_label, run) => {
    expect(run()).toBeNull()
  })
})
