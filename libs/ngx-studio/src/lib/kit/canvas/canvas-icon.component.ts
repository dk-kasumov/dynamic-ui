import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core'

type GlyphId = 'form' | 'row' | 'section' | 'text' | 'checkbox' | 'select' | 'dot'

@Component({
  selector: 'ds-canvas-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg class="glyph" viewBox="0 0 20 20" aria-hidden="true">
      @switch (glyph()) {
        @case ('form') {
          <rect x="3" y="3" width="14" height="14" rx="3" />
          <path d="M6 8h8M6 11h8M6 14h5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" fill="none" />
        }
        @case ('row') {
          <rect x="2" y="7" width="7" height="6" rx="1.5" />
          <rect x="11" y="7" width="7" height="6" rx="1.5" />
        }
        @case ('section') {
          <rect x="3" y="4" width="14" height="4" rx="1.5" />
          <rect x="3" y="12" width="14" height="4" rx="1.5" />
        }
        @case ('text') {
          <rect x="3" y="7" width="14" height="6" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.4" />
          <path d="M6 10h3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
        }
        @case ('checkbox') {
          <rect x="4" y="4" width="12" height="12" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.4" />
          <path d="M7 10.5l2.2 2L13.5 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none" />
        }
        @case ('select') {
          <rect x="3" y="6" width="14" height="8" rx="1.6" fill="none" stroke="currentColor" stroke-width="1.4" />
          <path d="M7.5 9.5L10 12l2.5-2.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none" />
        }
        @default {
          <circle cx="10" cy="10" r="3" />
        }
      }
    </svg>
  `,
  styles: `
    :host { display: inline-flex; }
    .glyph {
      width: 1em;
      height: 1em;
      fill: currentColor;
    }
  `
})
export class CanvasIconComponent {
  name = input<string>('')
  glyph = computed<GlyphId>(() => {
    const n = this.name().toLowerCase()
    if (n.includes('form')) return 'form'
    if (n.includes('row')) return 'row'
    if (n.includes('section') || n.includes('card') || n.includes('group')) return 'section'
    if (n.includes('text') || n.includes('input')) return 'text'
    if (n.includes('check')) return 'checkbox'
    if (n.includes('select') || n.includes('drop')) return 'select'
    return 'dot'
  })
}
