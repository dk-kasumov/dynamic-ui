/**
 * Primitive descriptors — atomic shapes used in a component's `props`.
 *
 * Each primitive carries its value type in a phantom slot keyed by a
 * module-private symbol so it never leaks into IntelliSense or data.
 * Extract it in types with {@link ValueOf}.
 */

import type { GenericSchema } from 'valibot'

declare const VALUE: unique symbol

export interface Primitive<Kind extends string = string, Value = unknown> {
  kind: Kind
  description?: string
  /** Helper text rendered under the field in the inspector. */
  hint?: string
  /**
   * Optional valibot schema. The inspector validates the field's value against it
   * and surfaces any issues; the value is stored either way — validation never blocks.
   */
  validation?: GenericSchema
  [VALUE]?: Value
}

export interface TextPrimitive extends Primitive<'text', string> {
  default?: string
}

export interface DecimalPrimitive extends Primitive<'decimal', number> {
  default?: number
  min?: number
  max?: number
}

export interface CheckboxPrimitive extends Primitive<'checkbox', boolean> {
  default?: boolean
}

/** A JSON document, edited as text and stored as the raw source string. */
export interface CodePrimitive extends Primitive<'code', string> {
  default?: string
}

/** A time of day, stored as an ISO `HH:mm` string. */
export interface TimePrimitive extends Primitive<'time', string> {
  default?: string
}

export interface DateRange {
  start: string | null
  end: string | null
}

/**
 * A calendar date stored as an ISO `yyyy-MM-dd` string — or, with `range`,
 * a {@link DateRange} of them. `format` only affects how the date is displayed
 * and typed.
 */
export interface DatePrimitive extends Primitive<'date', string | DateRange> {
  /** Select a start and end date instead of a single one. Defaults to `false`. */
  range?: boolean
  /** A date-fns format string such as `dd-MM-yyyy`; defaults to the Angular Material `shortDate` format. */
  format?: string
  default?: string | DateRange
}

export interface SelectPrimitive<T = string> extends Primitive<'select', T | T[]> {
  multiple?: boolean
  default?: T | T[]
}

export interface EnumPrimitive<Options extends readonly string[]> extends Primitive<'enum', Options[number]> {
  options: Options
  default?: Options[number]
}

export interface GroupPrimitive<Shape extends Record<string, Primitive>> extends Primitive<
  'group',
  { [K in keyof Shape]: ValueOf<Shape[K]> }
> {
  shape: Shape
}

export type ValueOf<P extends Primitive> = P extends Primitive<string, infer V> ? V : never

// Factories ------------------------------------------------------------------

type Options<P extends Primitive, Omitted extends keyof P = never> = Omit<P, 'kind' | Omitted>

export function text(opts: Options<TextPrimitive> = {}): TextPrimitive {
  return { kind: 'text', ...opts }
}

export function decimal(opts: Options<DecimalPrimitive> = {}): DecimalPrimitive {
  return { kind: 'decimal', ...opts }
}

export function checkbox(opts: Options<CheckboxPrimitive> = {}): CheckboxPrimitive {
  return { kind: 'checkbox', ...opts }
}

export function code(opts: Options<CodePrimitive> = {}): CodePrimitive {
  return { kind: 'code', ...opts }
}

export function time(opts: Options<TimePrimitive> = {}): TimePrimitive {
  return { kind: 'time', ...opts }
}

export function date(opts: Options<DatePrimitive> = {}): DatePrimitive {
  return { kind: 'date', ...opts }
}

export function select<T = string>(opts: Options<SelectPrimitive<T>> = {}): SelectPrimitive<T> {
  return { kind: 'select', ...opts }
}

export function enumeration<const O extends readonly string[]>(
  options: O,
  opts: Options<EnumPrimitive<O>, 'options'> = {}
): EnumPrimitive<O> {
  return { kind: 'enum', options, ...opts }
}

export function group<const Shape extends Record<string, Primitive>>(
  shape: Shape,
  opts: Options<GroupPrimitive<Shape>, 'shape'> = {}
): GroupPrimitive<Shape> {
  return { kind: 'group', shape, ...opts }
}
