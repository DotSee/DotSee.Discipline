import { UmbEntryPointOnInit } from '@umbraco-cms/backoffice/extension-api';
import { UMB_AUTH_CONTEXT } from '@umbraco-cms/backoffice/auth';
import { createEntityActionManifest } from './manifests/entity-action.manifest.js';
import { createPropertyVersionManifests } from './manifests/property-version.manifest.js';
import { manifests as localizationManifests } from './localization/manifest.js';
import { initializeVariantsHiderService, getVariantsHiderService } from './services/service-instance.js';
import { fetchVariantsHiderSettings, fetchPropertyVersionsSettings } from './services/settings-fetcher.js';
import { setNoVersionsCaption } from './services/pv-captions.js';
import { disciplineSettingsManifests } from './disciplineSettings/manifests.js';
import { fetchDisciplineUiStatus } from './disciplineSettings/ui-status.js';

// Re-export for external use
export { VariantsHiderService } from './services/variants-hider.service.js';
export { getVariantsHiderService };

export const onInit: UmbEntryPointOnInit = async (_host, extensionRegistry) => {
  // Get auth token for authenticated API calls
  const authContext = await _host.getContext(UMB_AUTH_CONTEXT);
  const authToken = await authContext.getLatestToken();

  // Fetch settings for all features in parallel
  const [pvSettings, settings, uiStatus] = await Promise.all([
    fetchPropertyVersionsSettings(authToken),
    fetchVariantsHiderSettings(),
    fetchDisciplineUiStatus(authToken),
  ]);

  // Register the backoffice settings UI when enabled via appsettings
  if (uiStatus.uiEnabled) {
    extensionRegistry.registerMany(disciplineSettingsManifests);
  }

  // Register property version navigation actions if enabled
  if (pvSettings.enabled) {
    setNoVersionsCaption(pvSettings.noVersionsCaption);
    const pvManifests = createPropertyVersionManifests({
      nextVersionCaption: pvSettings.nextVersionCaption,
      previousVersionCaption: pvSettings.previousVersionCaption,
      noVersionsCaption: pvSettings.noVersionsCaption,
    });
    extensionRegistry.registerMany(pvManifests);
  }

  // Only register the entity action if the feature is enabled
  if (settings.enabled) {
    const entityActionManifest = createEntityActionManifest(settings.caption);

    extensionRegistry.registerMany([
      entityActionManifest,
      ...localizationManifests,
    ]);

    const service = initializeVariantsHiderService();
    service.initializeWithSettings(settings);
  }
};
