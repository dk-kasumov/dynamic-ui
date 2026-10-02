import { Component, signal } from '@angular/core'
import { Studio } from '@dynamic-ui/studio'
import type { Meta, StoryObj } from '@storybook/angular'
import { StudioWorkbenchComponent } from '../../studio-workbench.component'

const components = [
  Studio.defineComponent({
    name: 'Containers/Form',
    label: 'Form',
    description: 'Корневой контейнер формы',
    props: {},
    children: { cardinality: 'many' }
  }),
  Studio.defineComponent({
    name: 'Containers/Section',
    label: 'Section',
    description: 'Группирует связанные поля',
    props: { title: Studio.text() },
    children: { cardinality: 'many' }
  }),
  Studio.defineComponent({
    name: 'Containers/Row',
    label: 'Row',
    description: 'Поля в одну строку',
    props: {},
    children: { cardinality: 'many' }
  }),
  Studio.defineComponent({
    name: 'Controls/TextInput',
    label: 'Text input',
    description: 'Текстовое поле',
    props: { label: Studio.text(), placeholder: Studio.text() },
    relations: {
      required: Studio.relation({ returns: 'boolean' }),
      visible: Studio.relation({ returns: 'boolean' })
    }
  }),
  Studio.defineComponent({
    name: 'Controls/Checkbox',
    label: 'Checkbox',
    description: 'Чекбокс',
    props: { label: Studio.text(), default: Studio.checkbox() }
  }),
  Studio.defineComponent({
    name: 'Controls/Select',
    label: 'Select',
    description: 'Выпадающий список',
    props: { label: Studio.text() }
  })
]

function buildStudio(): Studio {
  const root = Studio.createNode({
    name: 'Containers/Form',
    props: {},
    children: [
      Studio.createNode({
        name: 'Containers/Section',
        props: { title: 'Персональные данные' },
        children: [
          Studio.createNode({
            name: 'Containers/Row',
            props: {},
            children: [
              Studio.createNode({ name: 'Controls/TextInput', props: { label: 'Имя', placeholder: 'Введите имя' } }),
              Studio.createNode({ name: 'Controls/TextInput', props: { label: 'Фамилия', placeholder: 'Введите фамилию' } })
            ]
          }),
          Studio.createNode({ name: 'Controls/TextInput', props: { label: 'Email', placeholder: 'you@example.com' } })
        ]
      }),
      Studio.createNode({
        name: 'Containers/Section',
        props: { title: 'Доступ' },
        children: [
          Studio.createNode({ name: 'Controls/Select', props: { label: 'Роль' } }),
          Studio.createNode({ name: 'Controls/Checkbox', props: { label: 'Отправить приглашение' } })
        ]
      })
    ]
  })
  return new Studio({ components, root })
}

@Component({
  selector: 'ds-canvas-story-host',
  standalone: true,
  imports: [StudioWorkbenchComponent],
  template: `<div class="shell"><ds-studio-workbench [studio]="studio()" /></div>`,
  styles: `
    :host { display: block; height: 100%; }
    .shell {
      height: 100vh; min-height: 600px;
      border: 1px solid rgba(16,24,40,.08); border-radius: 12px;
      overflow: hidden; box-shadow: 0 20px 50px rgba(16,24,40,.08);
    }
  `
})
class CanvasStoryHost {
  readonly studio = signal(buildStudio())

  constructor() {
    console.log(this.studio().root)
  }
}

const meta: Meta<CanvasStoryHost> = {
  title: 'Canvas',
  component: CanvasStoryHost,
  parameters: { layout: 'fullscreen' }
}

export default meta
type Story = StoryObj<CanvasStoryHost>

export const Default: Story = {}

@Component({
  selector: 'ds-canvas-empty-host',
  standalone: true,
  imports: [StudioWorkbenchComponent],
  template: `<div class="shell"><ds-studio-workbench [studio]="studio()" /></div>`,
  styles: `
    :host { display: block; height: 100%; }
    .shell {
      height: 100vh; min-height: 600px;
      border: 1px solid rgba(16,24,40,.08); border-radius: 12px;
      overflow: hidden; box-shadow: 0 20px 50px rgba(16,24,40,.08);
    }
  `
})
class CanvasEmptyHost {
  readonly studio = signal(
    new Studio({ components, root: Studio.createNode({ name: 'Containers/Form', props: {} }) })
  )
}

export const Empty: StoryObj<CanvasEmptyHost> = {
  render: () => ({ template: '<ds-canvas-empty-host />', moduleMetadata: { imports: [CanvasEmptyHost] } })
}
