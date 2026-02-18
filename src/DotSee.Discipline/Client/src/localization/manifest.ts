import type { ManifestLocalization } from '@umbraco-cms/backoffice/extension-registry';

export const localizationManifest: ManifestLocalization = {
  type: 'localization',
  alias: 'DotSee.Discipline.VariantsHider.Localization.En',
  name: 'DotSee Variants Hider Localization (English)',
  meta: {
    culture: 'en',
  },
  js: () => import('./en.js'),
};

export const manifests = [localizationManifest];
