import { AfterViewInit, Directive, ElementRef, NgZone, OnDestroy, inject, input, output } from '@angular/core'
import Sortable, { type Options, type SortableEvent } from 'sortablejs'

/**
 * Event emitted after a drop that would change the data. The directive has
 * already reverted SortableJS's DOM mutation at this point, so Angular is
 * still the source of truth — consumers mutate their store and let the
 * next render place the item where it now logically belongs.
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
 * Minimal Angular wrapper around SortableJS.
 *
 * SortableJS is a DOM-first library: it moves nodes around directly as the
 * user drags. Angular owns the DOM via `@for`, so letting SortableJS leave
 * its mutations in place would race with the next change detection cycle.
 * The convention — used by every mature Angular wrapper — is:
 *
 *   1. Let SortableJS reparent/reorder DOM during the drag (so the user
 *      sees the normal animation feedback).
 *   2. In `onEnd`, undo the DOM move so Angular's view model and the DOM
 *      agree again.
 *   3. Emit a semantic event. The consumer updates the data store, which
 *      triggers Angular to render the correct order from scratch.
 *
 * This directive is deliberately unopinionated about `data-*` attributes
 * and payload shape; callers decode `item`/`to`/`from` themselves because
 * the semantics differ between the canvas tree and the palette source.
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

  #sortable?: Sortable

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
    this.#sortable?.destroy()
    this.#sortable = undefined
  }

  #handleEnd(evt: SortableEvent): void {
    document.body.classList.remove('ds-has-drag')

    const didMove = evt.from !== evt.to || evt.oldIndex !== evt.newIndex
    if (!didMove) return

    const isClone = (evt as unknown as { pullMode?: string }).pullMode === 'clone'
    const item = evt.item

    // Revert SortableJS's DOM move so Angular's view model matches the DOM
    // before the next CD cycle runs.
    if (isClone) {
      item.parentElement?.removeChild(item)
    } else if (evt.from !== evt.to) {
      item.parentElement?.removeChild(item)
      insertAtIndex(evt.from, item, evt.oldIndex ?? 0)
    } else {
      item.parentElement?.removeChild(item)
      insertAtIndex(evt.from, item, evt.oldIndex ?? 0)
    }

    this.#zone.run(() => {
      this.dsSortableDrop.emit({
        from: evt.from,
        to: evt.to,
        oldIndex: evt.oldIndex ?? 0,
        newIndex: evt.newIndex ?? 0,
        item,
        isClone
      })
    })
  }
}

function insertAtIndex(parent: HTMLElement, el: HTMLElement, index: number): void {
  if (index >= parent.children.length) parent.appendChild(el)
  else parent.insertBefore(el, parent.children[index])
}
