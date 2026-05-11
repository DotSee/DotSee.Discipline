import type { ManifestEntityAction } from '@umbraco-cms/backoffice/extension-registry';

/**
 * Creates the entity action manifest for toggling visibility of unset language variants.
 * The caption is loaded from appsettings.json via the API; when empty, the localized
 * default label is used (resolved via the # prefix at render time).
 */
export function createEntityActionManifest(caption: string): ManifestEntityAction {
  const label = caption && caption.length > 0 ? caption : '#dotseeDiscipline_variantsHider_toggle';
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
      label,
    },
    conditions: [
      {
        alias: 'Umb.Condition.SectionAlias',
        match: 'Umb.Section.Content',
      },
    ],
  };
}
