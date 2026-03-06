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
 * Settings response for PropertyVersions.
 */
export interface PropertyVersionsSettings {
  enabled: boolean;
  nextVersionCaption: string | null;
  previousVersionCaption: string | null;
  noVersionsCaption: string | null;
}

const DEFAULT_PV_SETTINGS: PropertyVersionsSettings = {
  enabled: false,
  nextVersionCaption: null,
  previousVersionCaption: null,
  noVersionsCaption: null,
};

/**
 * Fetch PropertyVersions settings from the API.
 * Passes the current document language to resolve dictionary captions.
 * Returns default settings (disabled) if the API call fails.
 */
export async function fetchPropertyVersionsSettings(authToken: string): Promise<PropertyVersionsSettings> {
  try {
    const culture = document.documentElement.lang || '';
    const url = culture
      ? `/umbraco/api/propertyversions/settings?culture=${encodeURIComponent(culture)}`
      : '/umbraco/api/propertyversions/settings';

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      return {
        enabled: data.enabled === true || data.enabled === 'true',
        nextVersionCaption: data.nextVersionCaption ?? null,
        previousVersionCaption: data.previousVersionCaption ?? null,
        noVersionsCaption: data.noVersionsCaption ?? null,
      };
    }

    return DEFAULT_PV_SETTINGS;
  } catch {
    return DEFAULT_PV_SETTINGS;
  }
}

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
    
    return DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}
