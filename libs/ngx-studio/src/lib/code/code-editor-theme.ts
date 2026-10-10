import { HighlightStyle } from '@codemirror/language'
import { EditorView } from '@codemirror/view'
import { tags as t } from '@lezer/highlight'

export const codeHighlightStyle = HighlightStyle.define([
  { tag: t.propertyName, color: 'var(--ds-code-key)' },
  { tag: t.string, color: 'var(--ds-code-string)' },
  { tag: [t.number, t.integer, t.float], color: 'var(--ds-code-number)' },
  { tag: [t.bool, t.null, t.atom], color: 'var(--ds-code-keyword)' },
  { tag: [t.punctuation, t.separator, t.squareBracket, t.brace], color: 'var(--ds-code-punctuation)' }
])

export const codeEditorTheme = EditorView.theme({
  '&': { fontSize: '12px', color: 'var(--ds-text)', backgroundColor: 'transparent' },
  '&.cm-focused': { outline: 'none' },
  '.cm-scroller': { fontFamily: 'var(--ds-code-font)', lineHeight: '20px' },
  '.cm-content': { padding: '8px 0', caretColor: 'var(--ds-accent)' },
  '.cm-line': { padding: '0 12px 0 8px' },
  '.cm-cursor': { borderLeftColor: 'var(--ds-accent)' },
  '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground': {
    background: 'var(--ds-accent-soft)'
  },
  '&.cm-focused .cm-activeLine': { backgroundColor: 'var(--ds-chip-bg)' },
  '.cm-activeLine': { backgroundColor: 'transparent' },
  '.cm-gutters': {
    backgroundColor: 'var(--ds-chip-bg)',
    color: 'var(--ds-text-muted)',
    border: 'none',
    borderRight: '1px solid var(--ds-border)'
  },
  '.cm-activeLineGutter': { backgroundColor: 'transparent' },
  '&.cm-focused .cm-activeLineGutter': { color: 'var(--ds-text)' },
  '.cm-lineNumbers .cm-gutterElement': { minWidth: '28px', padding: '0 8px 0 10px' },
  '.cm-placeholder': { color: 'var(--ds-text-muted)' },
  '.cm-matchingBracket': { backgroundColor: 'var(--ds-accent-soft)', outline: '1px solid var(--ds-accent-ring)' },
  '.cm-lintRange-error': { backgroundImage: 'none', textDecoration: 'underline wavy var(--ds-code-error)' },
  '.cm-tooltip': {
    border: '1px solid var(--ds-border)',
    borderRadius: '8px',
    backgroundColor: 'var(--ds-card-bg)',
    color: 'var(--ds-text)',
    boxShadow: 'var(--ds-card-shadow-hover)',
    overflow: 'hidden'
  }
})
