import type { ManifestEntityAction } from '@umbraco-cms/backoffice/extension-registry';

/**
 * Creates the entity action manifest for toggling visibility of unset language variants.
 * The caption is loaded from appsettings.json via the API.
 * 
 * @param caption The label text for the menu item from configuration
 * @returns The entity action manifest
 */
export function createEntityActionManifest(caption: string): ManifestEntityAction {
  return {
    type: 'entityAction',
    kind: 'default',
    alias: 'DotSee.Discipline.VariantsHider.ToggleAction',
    name: 'Toggle Unset Variants Display',
    weight: 100,
    api: () => import('../actions/toggle-variants.action.js'),
    forEntityTypes: ['document-root'],
    meta: {
      icon: 'icon-axis-rotation',
      label: caption,
    },
    conditions: [
      {
        alias: 'Umb.Condition.SectionAlias',
        match: 'Umb.Section.Content',
      },
    ],
  };
}
