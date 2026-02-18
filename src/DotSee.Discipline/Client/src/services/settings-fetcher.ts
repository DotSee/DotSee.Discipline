/**
 * Settings response from the API.
 */
export interface VariantsHiderSettings {
  enabled: boolean;
  caption: string;
}

/**
 * Default settings used when API call fails.
 */
const DEFAULT_SETTINGS: VariantsHiderSettings = {
  enabled: false,
  caption: 'Toggle unset variants display',
};

/**
 * Fetch VariantsHider settings from the API.
 * Returns default settings if the API call fails.
 */
export async function fetchVariantsHiderSettings(): Promise<VariantsHiderSettings> {
  try {
    const response = await fetch('/umbraco/api/variantshider/settings', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return {
        enabled: data.enabled === true || data.enabled === 'true',
        caption: data.caption || DEFAULT_SETTINGS.caption,
      };
    }
    
    console.warn('[DotSee.Discipline.VariantsHider] Failed to fetch settings, using defaults');
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('[DotSee.Discipline.VariantsHider] Error fetching settings:', error);
    return DEFAULT_SETTINGS;
  }
}
