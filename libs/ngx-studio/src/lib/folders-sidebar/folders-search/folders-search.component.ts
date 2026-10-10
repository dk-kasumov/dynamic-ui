import { Component, model } from '@angular/core'

@Component({
  selector: 'ds-folders-search',
  standalone: true,
  styleUrl: './folders-search.component.scss',
  template: `
    <label class="search">
      <span class="search__icon material-icons" aria-hidden="true">search</span>
      <input
        class="search__input"
        type="search"
        placeholder="Search"
        [value]="value()"
        (input)="value.set($any($event.target).value)"
      />
    </label>
  `
})
export class FoldersSearchComponent {
  value = model('')
}
