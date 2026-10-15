/**
 * Converts a camelCase / snake_case / kebab-case identifier into a space-separated
 * title-cased label — used by the inspector to derive a field label from a prop key.
 *
 *   humanize('ariaLabel')  -> 'Aria Label'
 *   humanize('maxLength')  -> 'Max Length'
 *   humanize('URL')        -> 'URL'
 *   humanize('httpURL')    -> 'Http URL'
 */
export declare function humanize(key: string): string;
