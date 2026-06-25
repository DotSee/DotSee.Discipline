import type { ManifestLocalization } from '@umbraco-cms/backoffice/extension-registry';

export const englishLocalizationManifest: ManifestLocalization = {
  type: 'localization',
  alias: 'DotSee.Discipline.Localization.En',
  name: 'DotSee Discipline Localization (English)',
  meta: {
    culture: 'en',
  },
  js: () => import('./en.js'),
};

export const manifests: ManifestLocalization[] = [englishLocalizationManifest];
