import { Component, model } from '@angular/core'

@Component({
  selector: 'ds-folders-search',
  standalone: true,
  styleUrl: './folders-search.component.scss',
  template: `
    <label class="search">
      <svg class="search__icon" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
        <circle cx="6.5" cy="6.5" r="4.5" fill="none" stroke="currentColor" stroke-width="1.5" />
        <line x1="10.5" y1="10.5" x2="14" y2="14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      </svg>
      <input
        class="search__input"
        type="search"
        placeholder="Search"
        aria-label="Search"
        [value]="value()"
        (input)="value.set($any($event.target).value)"
      />
    </label>
  `
})
export class FoldersSearchComponent {
  value = model('')
}
