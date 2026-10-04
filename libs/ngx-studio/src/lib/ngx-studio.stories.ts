import { Studio } from '@dynamic-ui/studio'
import { componentWrapperDecorator, type Meta, type StoryObj } from '@storybook/angular'
import { NgxStudioComponent } from './ngx-studio.component'

const components = [
  Studio.defineComponent({
    name: 'Containers/Form',
    label: 'Form',
    icon: 'article',
    description: 'Root form container',
    props: {},
    container: true
  }),
  Studio.defineComponent({
    name: 'Containers/Section',
    label: 'Section',
    icon: 'view_agenda',
    description: 'Groups related fields',
    props: { title: Studio.text() },
    container: true
  }),
  Studio.defineComponent({
    name: 'Containers/Row',
    label: 'Row',
    icon: 'table_rows',
    description: 'Lays fields in a single row',
    props: {},
    container: true
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
      isInfinitePagination: Studio.checkbox(),
      endpointOptions: Studio.text(),
      pageSize: Studio.text(),
      endpointMethod: Studio.enum(['GET', 'POST'], { default: 'GET' }),
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
              Studio.createNode({
                name: 'Controls/TextInput',
                title: 'First name',
                props: { label: 'First name', placeholder: 'Enter first name' }
              }),
              Studio.createNode({
                name: 'Controls/TextInput',
                title: 'Last name',
                props: { label: 'Last name', placeholder: 'Enter last name' }
              })
            ]
          }),
          Studio.createNode({
            name: 'Controls/TextInput',
            title: 'Email',
            props: { label: 'Email', placeholder: 'you@example.com' }
          })
        ]
      }),
      Studio.createNode({
        name: 'Containers/Section',
        title: 'Access',
        props: { title: 'Access' },
        children: [
          Studio.createNode({ name: 'Controls/Select', title: 'Role', props: { label: 'Role' } }),
          Studio.createNode({
            name: 'Controls/Checkbox',
            title: 'Send invitation',
            props: { label: 'Send invitation' }
          })
        ]
      })
    ]
  })
  return new Studio({ components, root })
}

function emptyStudio(): Studio {
  return new Studio({ components, root: Studio.createNode({ name: 'Containers/Form', props: {} }) })
}

const meta: Meta<NgxStudioComponent> = {
  title: 'Ngx Studio',
  component: NgxStudioComponent,
  parameters: { layout: 'fullscreen' },
  decorators: [
    componentWrapperDecorator(
      story => `
        <div style="height: 100vh; min-height: 600px; overflow: hidden; border: 1px solid rgba(16, 24, 40, 0.08); border-radius: 12px; box-shadow: 0 20px 50px rgba(16, 24, 40, 0.08)">
          ${story}
        </div>`
    )
  ]
}

export default meta
type Story = StoryObj<NgxStudioComponent>

export const Default: Story = { args: { studio: populatedStudio() } }
export const Empty: Story = { args: { studio: emptyStudio() } }
