import { Injectable, Signal, computed, inject } from '@angular/core'
import type { ComponentDefinition, Node, NodeId, NodeMetaPatch } from '@dynamic-ui/studio'
import { CanvasStore } from '../canvas/store/canvas-store.service'
import type { InspectorFieldChange } from './field-change'


@Injectable()
export class InspectorStore {
  readonly #canvas = inject(CanvasStore)


  readonly node: Signal<Node> = this.#canvas.inspectedNode as Signal<Node>

  readonly definition: Signal<ComponentDefinition> = computed(
    () => this.#canvas.component(this.node().name)!
  )

  readonly icon: Signal<string> = computed(
    () => this.#canvas.iconOf(this.node())
  )


  close(): void {
    this.#canvas.closeInspector()
  }

  setMeta(id: NodeId, patch: NodeMetaPatch): void {
    this.#canvas.setMeta(id, patch)
  }

  setProp(id: NodeId, change: InspectorFieldChange): void {
    this.#canvas.setProp(id, change.path, change.value)
  }
}
