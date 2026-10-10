import type { ComponentDefinition } from '@dynamic-ui/studio'

export const defaultIcon = (def: ComponentDefinition): string => (def.container ? 'dashboard' : 'tune')

export const iconOrDefault = (icon: string | undefined, def: ComponentDefinition): string => icon || defaultIcon(def)
