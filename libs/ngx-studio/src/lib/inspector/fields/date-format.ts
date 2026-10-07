import { FormatWidth, getLocaleDateFormat } from '@angular/common'
import { MAT_DATE_LOCALE, type MatDateFormats } from '@angular/material/core'
import { provideDateFnsAdapter } from '@angular/material-date-fns-adapter'
import type { Provider } from '@angular/core'
import { enUS } from 'date-fns/locale'
import { format, isValid, parse, parseISO } from 'date-fns'

/** Used when a date primitive does not specify a `format`. */
export const DEFAULT_DATE_FORMAT = 'shortDate'

/** Dates are stored as ISO calendar dates, times as 24h `HH:mm`. */
const ISO_DATE = 'yyyy-MM-dd'
const ISO_TIME = 'HH:mm'

const NAMED_FORMATS: Record<string, FormatWidth> = {
  shortDate: FormatWidth.Short,
  mediumDate: FormatWidth.Medium,
  longDate: FormatWidth.Long,
  fullDate: FormatWidth.Full
}

const MOMENT_TOKENS: Record<string, string> = { YYYY: 'yyyy', YY: 'yy', DD: 'dd', D: 'd' }

/**
 * Resolves a primitive's `format` to a date-fns pattern. Accepts the named Angular
 * formats (`shortDate`, `mediumDate`, …) as well as custom patterns; the common
 * moment-style tokens (`DD-MM-YYYY`) are translated since date-fns would reject them.
 */
export function toDatePattern(formatName: string | undefined, locale: string): string {
  const requested = formatName ?? DEFAULT_DATE_FORMAT
  const width = NAMED_FORMATS[requested]
  if (width !== undefined) {
    try {
      return getLocaleDateFormat(locale, width)
    } catch {
      return getLocaleDateFormat('en-US', width)
    }
  }
  // Even parts are pattern tokens, odd parts are 'quoted literals' that must stay untouched.
  return requested
    .split(/('[^']*')/)
    .map((part, i) => (i % 2 ? part : part.replace(/YYYY|YY|DD|D/g, token => MOMENT_TOKENS[token]!)))
    .join('')
}

export function fromIsoDate(value: string | null | undefined): Date | null {
  if (!value) return null
  const date = parseISO(value)
  return isValid(date) ? date : null
}

export function toIsoDate(value: Date | null | undefined): string | null {
  return value && isValid(value) ? format(value, ISO_DATE) : null
}

export function fromIsoTime(value: string | null | undefined): Date | null {
  if (!value) return null
  const date = parse(value, ISO_TIME, new Date())
  return isValid(date) ? date : null
}

export function toIsoTime(value: Date | null | undefined): string | null {
  return value && isValid(value) ? format(value, ISO_TIME) : null
}

/** Component-level providers so the fields work without any global date adapter setup. */
export function provideDateFnsFieldAdapter(): Provider[] {
  return [provideDateFnsAdapter(), { provide: MAT_DATE_LOCALE, useValue: enUS }]
}

/** Date formats whose input pattern is read lazily, so it follows the primitive's `format`. */
export function dateFormatsFrom(pattern: () => string): MatDateFormats {
  return {
    parse: {
      get dateInput() {
        return pattern()
      }
    },
    display: {
      get dateInput() {
        return pattern()
      },
      monthYearLabel: 'LLL uuuu',
      dateA11yLabel: 'PP',
      monthYearA11yLabel: 'LLLL uuuu'
    }
  }
}
