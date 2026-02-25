import { UmbEntryPointOnInit } from '@umbraco-cms/backoffice/extension-api';
import { createEntityActionManifest } from './manifests/entity-action.manifest.js';
import { propertyVersionManifests } from './manifests/property-version.manifest.js';
import { manifests as localizationManifests } from './localization/manifest.js';
import { initializeVariantsHiderService, getVariantsHiderService } from './services/service-instance.js';
import { fetchVariantsHiderSettings } from './services/settings-fetcher.js';

// Re-export for external use
export { VariantsHiderService } from './services/variants-hider.service.js';
export { getVariantsHiderService };

export const onInit: UmbEntryPointOnInit = async (_host, extensionRegistry) => {
  console.log('[DotSee.Discipline] Initializing...');

  // Register property version navigation actions (always available)
  extensionRegistry.registerMany([
    ...propertyVersionManifests,
  ]);
  console.log('[DotSee.Discipline] Property version actions registered');

  // Fetch settings from API first to get the caption
  const settings = await fetchVariantsHiderSettings();

  // Only register the entity action if the feature is enabled
  if (settings.enabled) {
    // Create the entity action manifest with the caption from settings
    const entityActionManifest = createEntityActionManifest(settings.caption);

    // Register manifests
    extensionRegistry.registerMany([
      entityActionManifest,
      ...localizationManifests,
    ]);

    // Initialize the variants hider service with the fetched settings
    const service = initializeVariantsHiderService();
    service.initializeWithSettings(settings);

    console.log('[DotSee.Discipline.VariantsHider] Initialized successfully with caption:', settings.caption);
  } else {
    console.log('[DotSee.Discipline.VariantsHider] Feature is disabled in configuration');
  }
};
