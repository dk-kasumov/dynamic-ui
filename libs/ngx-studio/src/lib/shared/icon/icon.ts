import { isContainer, type ComponentDefinition } from '@dynamic-ui/studio'

export const defaultIcon = (def: ComponentDefinition): string => (isContainer(def) ? 'dashboard' : 'tune')

export const iconOrDefault = (icon: string | undefined, def: ComponentDefinition): string => icon || defaultIcon(def)
