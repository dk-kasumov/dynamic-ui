import type { ComponentDefinition } from '@dynamic-ui/studio'

/** Material Icons ligature to show when neither the node nor its component sets an icon. */
export const defaultIcon = (def: ComponentDefinition): string => (def.container ? 'dashboard' : 'tune')

/** Applies the Material fallback to an icon token resolved by the core. */
export const iconOrDefault = (icon: string | undefined, def: ComponentDefinition): string => icon || defaultIcon(def)

/** Last path segment of a component name: `Controls/TextInput` → `TextInput`. */
export const shortName = (fqn: string): string => fqn.slice(fqn.lastIndexOf('/') + 1)
