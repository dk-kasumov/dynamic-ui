import { Component, input } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import type { Meta, StoryObj } from '@storybook/angular'

@Component({
  selector: 'ds-button-demo',
  standalone: true,
  imports: [MatButtonModule],
  template: `<button mat-flat-button [disabled]="disabled()">{{ label() }}</button>`
})
class ButtonDemoComponent {
  label = input('Click me')
  disabled = input(false)
}

const meta: Meta<ButtonDemoComponent> = {
  title: 'Kit/Button',
  component: ButtonDemoComponent,
  argTypes: {
    label: { control: 'text' },
    disabled: { control: 'boolean' }
  }
}

export default meta
type Story = StoryObj<ButtonDemoComponent>

export const Default: Story = {
  args: { label: 'Click me', disabled: false }
}

export const Disabled: Story = {
  args: { label: 'Can’t click', disabled: true }
}
