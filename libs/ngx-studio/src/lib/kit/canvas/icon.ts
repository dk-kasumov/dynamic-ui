import type { ComponentDefinition } from '@dynamic-ui/studio'

/** Default Material Icons icon for container components (have children). */
const DEFAULT_CONTAINER_ICON = 'dashboard'
/** Default Material Icons icon for leaf/control components. */
const DEFAULT_CONTROL_ICON = 'tune'

/**
 * Resolves the Material Icons ligature name for a component.
 * Uses `def.icon` when provided, otherwise falls back to
 * `dashboard` for containers and `tune` for controls.
 */
export function resolveIcon(def: ComponentDefinition): string {
  if (def.icon) return def.icon
  const isContainer = !!def.children && def.children.cardinality !== 'none'
  return isContainer ? DEFAULT_CONTAINER_ICON : DEFAULT_CONTROL_ICON
}
