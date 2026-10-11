import type { Meta, StoryObj } from '@storybook/angular'
import { moduleMetadata, componentWrapperDecorator } from '@storybook/angular'
import { computed, signal } from '@angular/core'
import { FoldersSidebarComponent } from './folders-sidebar.component'
import { CanvasNodeComponent } from './canvas-node/canvas-node.component'
import { StudioFacade } from '../studio-facade.service'

class MockStudioFacade {
  picking = signal(false)
  selectedId = signal(null)
  inspectedId = signal(null)
  treeSortOptions = {}

  nodeSignal = (idFn: () => string) => computed(() => ({ id: idFn(), name: 'MockComponent', children: [] }))
  component = () => ({ label: 'Mock Node', description: 'Mock Description', container: false })
  iconOf = () => 'check_circle'
  pickable = () => true
  linksOf = () => ({ to: [], from: [] })
  isHighlighted = () => false
  nodeLabel = () => 'Mock'

  select = () => undefined
  inspect = () => undefined
  removeNode = () => undefined
  highlight = () => undefined
  clearHighlight = () => undefined
  resolvePick = () => undefined
  applyDrop = () => false
}

const meta: Meta<FoldersSidebarComponent> = {
  title: 'FoldersSidebar',
  component: FoldersSidebarComponent,
  parameters: { layout: 'fullscreen' },
  decorators: [
    moduleMetadata({
      imports: [CanvasNodeComponent],
      providers: [{ provide: StudioFacade, useClass: MockStudioFacade }]
    }),
    componentWrapperDecorator(
      story => `
        <div style="height: 100vh; width: 320px; overflow: hidden; border-right: 1px solid rgba(16, 24, 40, 0.08); background: var(--ds-sidebar-bg, #f7f9fa)">
          ${story}
        </div>`
    )
  ]
}

export default meta

type Story = StoryObj<FoldersSidebarComponent>

export const Default: Story = {
  args: {
    folders: [
      {
        id: 1,
        name: 'UI',
        children: [
          {
            id: 2,
            name: 'Controllers',
            items: [
              { id: 'f1', name: 'input' },
              { id: 'f2', name: 'calendar' }
            ]
          }
        ]
      },
      { id: 4, name: 'Документы' }
    ]
  },
  render: args => ({
    props: args,
    template: `
      <ds-folders-sidebar [folders]="folders"></ds-folders-sidebar>
    `
  })
}
