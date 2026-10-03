/**
 * Converts a camelCase / snake_case / kebab-case identifier into a space-separated
 * title-cased label — used by the inspector to derive a field label from a prop key
 * when the primitive does not carry an explicit `label`.
 *
 *   humanize('ariaLabel')  -> 'Aria Label'
 *   humanize('maxLength')  -> 'Max Length'
 *   humanize('URL')        -> 'URL'
 *   humanize('httpURL')    -> 'Http URL'
 */
export function humanize(key: string): string {
  if (!key) return ''
  return key
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .split(/\s+/)
    .filter(Boolean)
    .map(capitalizeWord)
    .join(' ')
}

function capitalizeWord(word: string): string {
  if (word === word.toUpperCase()) return word
  return word[0]!.toUpperCase() + word.slice(1)
}
