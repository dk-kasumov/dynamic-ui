import type { Meta, StoryObj } from '@storybook/angular'
import { FoldersSidebarComponent } from './folders-sidebar.component'

const meta: Meta<FoldersSidebarComponent> = {
  title: 'FoldersSidebar',
  component: FoldersSidebarComponent
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
  }
}
