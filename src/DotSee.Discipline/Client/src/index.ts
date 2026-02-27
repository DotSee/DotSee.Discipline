import { UmbEntryPointOnInit } from '@umbraco-cms/backoffice/extension-api';
import { createEntityActionManifest } from './manifests/entity-action.manifest.js';
import { createPropertyVersionManifests } from './manifests/property-version.manifest.js';
import { manifests as localizationManifests } from './localization/manifest.js';
import { initializeVariantsHiderService, getVariantsHiderService } from './services/service-instance.js';
import { fetchVariantsHiderSettings, fetchPropertyVersionsSettings } from './services/settings-fetcher.js';
import { setNoVersionsCaption } from './services/pv-captions.js';

// Re-export for external use
export { VariantsHiderService } from './services/variants-hider.service.js';
export { getVariantsHiderService };

export const onInit: UmbEntryPointOnInit = async (_host, extensionRegistry) => {
  console.log('[DotSee.Discipline] Initializing...');

  // Fetch settings for both features in parallel
  const [pvSettings, settings] = await Promise.all([
    fetchPropertyVersionsSettings(),
    fetchVariantsHiderSettings(),
  ]);

  // Register property version navigation actions if enabled
  if (pvSettings.enabled) {
    setNoVersionsCaption(pvSettings.noVersionsCaption);
    const pvManifests = createPropertyVersionManifests({
      nextVersionCaption: pvSettings.nextVersionCaption,
      previousVersionCaption: pvSettings.previousVersionCaption,
      noVersionsCaption: pvSettings.noVersionsCaption,
    });
    extensionRegistry.registerMany(pvManifests);
    console.log('[DotSee.Discipline] Property version actions registered');
  } else {
    console.log('[DotSee.Discipline.PropertyVersions] Feature is disabled in configuration');
  }

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
