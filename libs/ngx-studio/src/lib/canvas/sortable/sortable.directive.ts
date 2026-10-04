import { AfterViewInit, Directive, ElementRef, NgZone, OnDestroy, inject, input, output } from '@angular/core'
import Sortable, { type Options, type SortableEvent } from 'sortablejs'

/**
 * Drop event emitted after the directive has already reverted SortableJS's
 * DOM mutation — Angular remains the source of truth; consumers mutate their
 * store and let the next render place items where they logically belong.
 */
export interface DsSortableDropEvent {
  from: HTMLElement
  to: HTMLElement
  oldIndex: number
  newIndex: number
  item: HTMLElement
  /** True when the source list is `pull: 'clone'` (palette-style). */
  isClone: boolean
}

/**
 * Minimal Angular wrapper around SortableJS. SortableJS moves DOM nodes
 * directly during a drag; Angular owns the DOM via `@for`. We let SortableJS
 * animate during the drag, undo its DOM move in `onEnd`, then emit a semantic
 * event so the consumer can update data and let Angular re-render.
 *
 * Deliberately agnostic to `data-*` payloads — callers decode `item`/`to`/
 * `from` themselves since canvas-tree and palette semantics differ.
 */
@Directive({
  selector: '[dsSortable]',
  standalone: true
})
export class DsSortableDirective implements AfterViewInit, OnDestroy {
  readonly options = input<Partial<Options>>({})
  readonly dsSortableDrop = output<DsSortableDropEvent>()

  readonly #el = inject(ElementRef<HTMLElement>)
  readonly #zone = inject(NgZone)

  #sortable!: Sortable

  ngAfterViewInit(): void {
    this.#zone.runOutsideAngular(() => {
      this.#sortable = Sortable.create(this.#el.nativeElement, {
        animation: 200,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        swapThreshold: 0.65,
        invertSwap: true,
        emptyInsertThreshold: 24,
        delay: 60,
        delayOnTouchOnly: true,
        ghostClass: 'ds-sortable-ghost',
        chosenClass: 'ds-sortable-chosen',
        ...this.options(),
        onStart: () => document.body.classList.add('ds-has-drag'),
        onEnd: evt => this.#handleEnd(evt)
      })
    })
  }

  ngOnDestroy(): void {
    this.#sortable.destroy()
  }

  #handleEnd(evt: SortableEvent): void {
    document.body.classList.remove('ds-has-drag')
    if (evt.from === evt.to && evt.oldIndex === evt.newIndex) return

    const isClone = (evt as unknown as { pullMode?: string }).pullMode === 'clone'
    const { item, from } = evt
    const oldIndex = evt.oldIndex!
    const newIndex = evt.newIndex!

    // Revert SortableJS's DOM move so Angular's view model matches the DOM.
    item.remove()
    if (!isClone) insertAtIndex(from, item, oldIndex)

    this.#zone.run(() => {
      this.dsSortableDrop.emit({ from, to: evt.to, oldIndex, newIndex, item, isClone })
    })
  }
}

function insertAtIndex(parent: HTMLElement, el: HTMLElement, index: number): void {
  if (index >= parent.children.length) parent.appendChild(el)
  else parent.insertBefore(el, parent.children[index])
}
