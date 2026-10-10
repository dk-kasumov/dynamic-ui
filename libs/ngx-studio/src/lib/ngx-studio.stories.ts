import { Component, input } from '@angular/core'
import * as v from 'valibot'
import { Studio, type NewNode, type NodeId, type RelationInstance } from '@dynamic-ui/studio'
import { componentWrapperDecorator, moduleMetadata, type Meta, type StoryObj } from '@storybook/angular'
import { NgxStudioComponent } from './ngx-studio.component'
import { StudioPreviewDirective } from './views'

const components = [
  Studio.defineComponent({
    title: 'Containers/Form',
    icon: 'article',
    description: 'Root form container',
    props: {},
    container: true
  }),
  Studio.defineComponent({
    title: 'Containers/Fieldset',
    icon: 'view_agenda',
    description: 'Groups some fields',
    props: { title: Studio.text() },
    container: true
  }),
  Studio.defineComponent({
    title: 'Containers/Section',
    icon: 'view_agenda',
    description: 'Groups related fields',
    props: { title: Studio.text() },
    container: true
  }),
  Studio.defineComponent({
    title: 'Containers/Row',
    icon: 'table_rows',
    description: 'Lays fields in a single row',
    props: {},
    container: true
  }),
  Studio.defineComponent({
    title: 'Controls/Text Input',
    icon: 'text_fields',
    description: 'Single-line text field',
    props: {
      label: Studio.text({
        hint: 'Name in format Name - Surname',
        validation: v.pipe(v.string('Label is required'), v.nonEmpty('Label is required'))
      }),
      placeholder: Studio.text(),
      ariaLabel: Studio.text(),
      size: Studio.enum(['sm', 'md', 'lg'], { default: 'md' }),
      validation: Studio.group({
        required: Studio.checkbox(),
        minLength: Studio.decimal({ min: 0, max: 1000 }),
        maxLength: Studio.decimal({ min: 0, max: 1000 }),
        pattern: Studio.text()
      })
    },
    relations: {
      required: Studio.relation({ returns: 'boolean' }),
      visible: Studio.relation({ returns: 'boolean' })
    }
  }),
  Studio.defineComponent({
    title: 'Controls/Date Picker',
    icon: 'calendar_month',
    description: 'Date, date range and time inputs',
    props: {
      label: Studio.text(),
      date: Studio.date({ hint: 'Uses the Angular shortDate format' }),
      birthday: Studio.date({ format: 'DD-MM-YYYY', hint: 'Format: DD-MM-YYYY' }),
      period: Studio.date({ range: true, format: 'dd.MM.yyyy' }),
      time: Studio.time({ hint: 'Stored as HH:mm' })
    }
  }),
  Studio.defineComponent({
    title: 'Controls/Webhook',
    icon: 'webhook',
    description: 'Calls an endpoint with a JSON payload',
    props: {
      label: Studio.text(),
      payload: Studio.code({ hint: 'Sent as the JSON body of the request' })
    }
  }),
  Studio.defineComponent({
    title: 'Controls/Checkbox',
    icon: 'check_box',
    description: 'Boolean toggle',
    props: { label: Studio.text(), default: Studio.checkbox() }
  }),
  Studio.defineComponent({
    title: 'Controls/Select',
    icon: 'arrow_drop_down_circle',
    description: 'Dropdown list',
    props: {
      label: Studio.text(),
      isInfinitePagination: Studio.checkbox(),
      endpointOptions: Studio.text(),
      pageSize: Studio.text(),
      endpointMethod: Studio.enum(['GET', 'POST'], { default: 'GET' }),
      options: Studio.select({ multiple: true }),
      defaultValue: Studio.select(),
      appearance: Studio.enum(['outlined', 'filled', 'underline'], { default: 'outlined' })
    }
  })
]

const FIRST_NAME = 'first-name' as NodeId
const LAST_NAME = 'last-name' as NodeId

const when = (...targets: NodeId[]): RelationInstance => ({
  combine: 'and',
  rules: targets.map(target => ({ target, operator: 'isNotEmpty' }))
})

function populatedStudio(): Studio {
  const root: NewNode = {
    name: 'Containers/Form',
    props: {},
    children: [
      {
        name: 'Containers/Section',
        title: 'Personal details',
        props: { title: 'Personal details' },
        children: [
          {
            name: 'Containers/Row',
            props: {},
            children: [
              {
                id: FIRST_NAME,
                name: 'Controls/Text Input',
                title: 'First name',
                fieldName: 'firstName',
                props: { label: 'First name', placeholder: 'Enter first name' }
              },
              {
                id: LAST_NAME,
                name: 'Controls/Text Input',
                title: 'Last name',
                fieldName: 'lastName',
                props: { label: 'Last name', placeholder: 'Enter last name' },
                relations: { visible: when(FIRST_NAME) }
              }
            ]
          },
          {
            name: 'Controls/Text Input',
            title: 'Email',
            fieldName: 'email',
            props: { label: 'Email', placeholder: 'you@example.com' },
            relations: { required: when(FIRST_NAME, LAST_NAME) }
          }
        ]
      },
      {
        name: 'Containers/Section',
        title: 'Access',
        props: { title: 'Access' },
        children: [
          { name: 'Controls/Select', title: 'Role', fieldName: 'role', props: { label: 'Role' } },
          {
            name: 'Controls/Checkbox',
            title: 'Send invitation',
            fieldName: 'sendInvitation',
            props: { label: 'Send invitation' }
          },
          {
            name: 'Controls/Date Picker',
            title: 'Valid period',
            fieldName: 'validPeriod',
            props: {
              label: 'Valid period',
              birthday: '1990-04-12',
              period: { start: '2026-10-06', end: '2026-10-09' },
              time: '09:30'
            }
          },
          {
            name: 'Controls/Webhook',
            title: 'Webhook',
            fieldName: 'webhook',
            props: {
              label: 'Webhook',
              payload: '{"event":"user.created","retry":{"max":3,"enabled":true},"tags":["a","b"],"note":null}'
            }
          }
        ]
      }
    ]
  }
  return new Studio({ components, root })
}

@Component({
  selector: 'demo-form',
  standalone: true,
  template: `
    <form style="display: grid; gap: 14px; font: 14px/1.4 inherit">
      @for (field of schema()?.fields ?? []; track field.name) {
        <label style="display: grid; gap: 6px">
          <span style="font-size: 12px; font-weight: 600; color: var(--ds-text-muted)">{{ field.name }}</span>
          <input
            [type]="field.type === 'Date Picker' ? 'date' : 'text'"
            [name]="field.name"
            style="height: 38px; padding: 0 12px; color: inherit; background: var(--ds-input-bg); border: 1px solid var(--ds-border); border-radius: 8px"
          />
        </label>
      } @empty {
        <p style="margin: 0; color: var(--ds-text-muted)">Give components a field name to see them here.</p>
      }
    </form>
  `
})
class DemoFormComponent {
  readonly schema = input<{ fields: { name: string; type?: string }[] }>()
}

const meta: Meta<NgxStudioComponent> = {
  title: 'Ngx Studio',
  component: NgxStudioComponent,
  parameters: { layout: 'fullscreen' },
  decorators: [
    moduleMetadata({ imports: [NgxStudioComponent, StudioPreviewDirective, DemoFormComponent] }),
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

const formSchema = Studio.defineAdapter({
  map: () => ({})
})

export const Default: Story = {
  args: { studio: populatedStudio() },
  render: args => ({
    props: { ...args, adapters: { formSchema } },
    template: `
      <ds-ngx-studio [studio]="studio" [adapters]="adapters">
        <ng-template dsStudioPreview let-outputs="outputs">
          <demo-form [schema]="outputs['formSchema']" />
        </ng-template>
      </ds-ngx-studio>`
  })
}
export const Empty: Story = { args: { studio: new Studio({ components }) } }
