import { Component, input, signal } from '@angular/core'
import { Studio } from '@dynamic-ui/studio'
import type { Meta, StoryObj } from '@storybook/angular'
import { StudioWorkbenchComponent } from '../../studio-workbench.component'

const components = [
  Studio.defineComponent({
    name: 'Containers/Form',
    label: 'Form',
    icon: 'article',
    description: 'Root form container',
    props: {},
    children: { cardinality: 'many' }
  }),
  Studio.defineComponent({
    name: 'Containers/Section',
    label: 'Section',
    icon: 'view_agenda',
    description: 'Groups related fields',
    props: { title: Studio.text() },
    children: { cardinality: 'many' }
  }),
  Studio.defineComponent({
    name: 'Containers/Row',
    label: 'Row',
    icon: 'table_rows',
    description: 'Lays fields in a single row',
    props: {},
    children: { cardinality: 'many' }
  }),
  Studio.defineComponent({
    name: 'Controls/TextInput',
    label: 'Text input',
    icon: 'text_fields',
    description: 'Single-line text field',
    props: {
      label: Studio.text(),
      placeholder: Studio.text(),
      ariaLabel: Studio.text(),
      size: Studio.enum(['sm', 'md', 'lg'], { default: 'md' }),
      // Group primitive — the inspector renders this as a fieldset with its own
      // legend ("Validation") so related props are visually clustered.
      validation: Studio.group(
        {
          required: Studio.checkbox(),
          minLength: Studio.decimal({ min: 0, max: 1000 }),
          maxLength: Studio.decimal({ min: 0, max: 1000 }),
          pattern: Studio.text()
        },
        { label: 'Validation' }
      )
    },
    relations: {
      required: Studio.relation({ returns: 'boolean' }),
      visible: Studio.relation({ returns: 'boolean' })
    }
  }),
  Studio.defineComponent({
    name: 'Controls/Checkbox',
    label: 'Checkbox',
    icon: 'check_box',
    description: 'Boolean toggle',
    props: { label: Studio.text(), default: Studio.checkbox() }
  }),
  Studio.defineComponent({
    name: 'Controls/Select',
    label: 'Select',
    icon: 'arrow_drop_down_circle',
    description: 'Dropdown list',
    props: {
      label: Studio.text(),
      options: Studio.select({ multiple: true, label: 'Options' }),
      defaultValue: Studio.select({ label: 'Default value' }),
      appearance: Studio.enum(['outlined', 'filled', 'underline'], { default: 'outlined' })
    }
  })
]

function populatedStudio(): Studio {
  const root = Studio.createNode({
    name: 'Containers/Form',
    props: {},
    children: [
      Studio.createNode({
        name: 'Containers/Section',
        title: 'Personal details',
        props: { title: 'Personal details' },
        children: [
          Studio.createNode({
            name: 'Containers/Row',
            props: {},
            children: [
              Studio.createNode({ name: 'Controls/TextInput', title: 'First name', props: { label: 'First name', placeholder: 'Enter first name' } }),
              Studio.createNode({ name: 'Controls/TextInput', title: 'Last name', props: { label: 'Last name', placeholder: 'Enter last name' } })
            ]
          }),
          Studio.createNode({ name: 'Controls/TextInput', title: 'Email', props: { label: 'Email', placeholder: 'you@example.com' } })
        ]
      }),
      Studio.createNode({
        name: 'Containers/Section',
        title: 'Access',
        props: { title: 'Access' },
        children: [
          Studio.createNode({ name: 'Controls/Select', title: 'Role', props: { label: 'Role' } }),
          Studio.createNode({ name: 'Controls/Checkbox', title: 'Send invitation', props: { label: 'Send invitation' } })
        ]
      })
    ]
  })
  return new Studio({ components, root })
}

function emptyStudio(): Studio {
  return new Studio({ components, root: Studio.createNode({ name: 'Containers/Form', props: {} }) })
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
  readonly studio = input.required<Studio>()
}

const meta: Meta<CanvasStoryHost> = {
  title: 'Canvas',
  component: CanvasStoryHost,
  parameters: { layout: 'fullscreen' }
}

export default meta
type Story = StoryObj<CanvasStoryHost>

export const Default: Story = { args: { studio: populatedStudio() } }
export const Empty: Story = { args: { studio: emptyStudio() } }
