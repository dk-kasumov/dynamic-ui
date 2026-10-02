import { Component, input, model } from '@angular/core';

@Component({
  selector: 'ds-folders-search',
  standalone: true,
  styleUrl: './folders-search.component.scss',
  template: `
    <input
      class="search"
      type="search"
      [value]="value()"
      [placeholder]="placeholder()"
      [attr.aria-label]="placeholder()"
      (input)="onInput($event)"
    />
  `,
})
export class FoldersSearchComponent {
  value = model('');
  placeholder = input('Поиск папок');

  onInput(event: Event) {
    this.value.set((event.target as HTMLInputElement).value);
  }
}
