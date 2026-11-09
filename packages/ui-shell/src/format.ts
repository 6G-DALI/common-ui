/**
 * Dates and times as the 6G-DALI front ends show them: ISO 8601 order, always in UTC, so one moment reads the same
 * for every user, in every list, log and chart, and matches what the services store (`2026-11-06T10:52:50+00:00`).
 *
 *   formatDateTime('2026-11-06T12:52:50+02:00')  // '2026-11-06 10:52:50 UTC'
 *   formatDate('2026-11-06T23:30:00-05:00')      // '2026-11-07'
 *   formatTime(new Date())                        // '10:52:50 UTC'
 *
 * Nothing here uses the browser's locale or time zone. A value that is empty gives `fallback` (an em dash); a value
 * that is not a date is returned as it came, so no data is hidden.
 */

export type DateInput = string | number | Date | null | undefined

export interface FormatOptions {
  /** Append ` UTC`. Default true. Turn it off where a column or axis already says the time is UTC. */
  zone?: boolean
  /** Show milliseconds (`10:52:50.123`), for log lines. Default false. */
  millis?: boolean
  /** What to show for an empty value. Default `—`. */
  fallback?: string
}

const DASH = '—'

// ISO 8601 date-times with no zone ("2026-11-06T10:52:50", "2026-11-06 10:52:50"). JavaScript would read them as local
// time; every 6G-DALI service writes UTC, so they are read as UTC.
const ZONELESS = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/

function parse(value: DateInput): Date | null {
  if (value === null || value === undefined || value === '') return null
  let date: Date
  if (value instanceof Date) {
    date = value
  } else if (typeof value === 'string') {
    const text = value.trim()
    date = new Date(ZONELESS.test(text) ? `${text.replace(' ', 'T')}Z` : text)
  } else {
    date = new Date(value)
  }
  return Number.isNaN(date.getTime()) ? null : date
}

const isEmpty = (value: DateInput) => value === null || value === undefined || value === ''
const pad = (n: number, width = 2) => String(n).padStart(width, '0')

function clock(date: Date, millis: boolean): string {
  const hms = `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`
  return millis ? `${hms}.${pad(date.getUTCMilliseconds(), 3)}` : hms
}

const day = (date: Date) => `${pad(date.getUTCFullYear(), 4)}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`

/** `2026-11-06 10:52:50 UTC`. */
export function formatDateTime(value: DateInput, { zone = true, millis = false, fallback = DASH }: FormatOptions = {}): string {
  if (isEmpty(value)) return fallback
  const date = parse(value)
  if (!date) return String(value)
  return `${day(date)} ${clock(date, millis)}${zone ? ' UTC' : ''}`
}

/**
 * `2026-11-06`. A date-only value (`2026-11-06`, what the catalogue stores for `issued` and `modified`) is a calendar
 * day, not a moment, so it is returned as it is and never shifted by a time zone.
 */
export function formatDate(value: DateInput, { fallback = DASH }: Pick<FormatOptions, 'fallback'> = {}): string {
  if (isEmpty(value)) return fallback
  if (typeof value === 'string' && DATE_ONLY.test(value.trim())) {
    const text = value.trim()
    return parse(text) ? text : value
  }
  const date = parse(value)
  return date ? day(date) : String(value)
}

/** `10:52:50 UTC`. */
export function formatTime(value: DateInput, { zone = true, millis = false, fallback = DASH }: FormatOptions = {}): string {
  if (isEmpty(value)) return fallback
  const date = parse(value)
  if (!date) return String(value)
  return `${clock(date, millis)}${zone ? ' UTC' : ''}`
}
