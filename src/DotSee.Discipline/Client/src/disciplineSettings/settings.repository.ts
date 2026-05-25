import type { BlueprintOption, DisciplineSettings, DisciplineSettingsResponse, DocTypeOption, PropertyOption } from './types.js';

const BASE = '/umbraco/api/discipline';

export type TokenGetter = () => Promise<string | undefined>;

export class DisciplineSettingsRepository {
  constructor(private readonly getToken: TokenGetter) {}

  private async headers(extra: Record<string, string> = {}): Promise<HeadersInit> {
    const token = await this.getToken();
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...extra,
    };
  }

  async getSettings(): Promise<DisciplineSettingsResponse> {
    const response = await fetch(`${BASE}/settings`, {
      method: 'GET',
      headers: await this.headers(),
    });
    if (!response.ok) {
      throw new Error(`Failed to load Discipline settings (${response.status})`);
    }
    return (await response.json()) as DisciplineSettingsResponse;
  }

  async saveSettings(settings: DisciplineSettings): Promise<DisciplineSettingsResponse> {
    const response = await fetch(`${BASE}/settings`, {
      method: 'PUT',
      headers: await this.headers(),
      body: JSON.stringify(settings),
    });
    if (!response.ok) {
      throw new Error(`Failed to save Discipline settings (${response.status})`);
    }
    return (await response.json()) as DisciplineSettingsResponse;
  }

  async getDocTypes(): Promise<DocTypeOption[]> {
    const response = await fetch(`${BASE}/doctypes`, {
      method: 'GET',
      headers: await this.headers(),
    });
    if (!response.ok) {
      throw new Error(`Failed to load doctypes (${response.status})`);
    }
    return (await response.json()) as DocTypeOption[];
  }

  async getTrueFalseProperties(): Promise<PropertyOption[]> {
    const response = await fetch(`${BASE}/properties/truefalse`, {
      method: 'GET',
      headers: await this.headers(),
    });
    if (!response.ok) {
      throw new Error(`Failed to load true/false properties (${response.status})`);
    }
    return (await response.json()) as PropertyOption[];
  }

  async getTextContentProperties(): Promise<PropertyOption[]> {
    const response = await fetch(`${BASE}/properties/text-content`, {
      method: 'GET',
      headers: await this.headers(),
    });
    if (!response.ok) {
      throw new Error(`Failed to load text content properties (${response.status})`);
    }
    return (await response.json()) as PropertyOption[];
  }

  async getTextInputProperties(): Promise<PropertyOption[]> {
    const response = await fetch(`${BASE}/properties/text-input`, {
      method: 'GET',
      headers: await this.headers(),
    });
    if (!response.ok) {
      throw new Error(`Failed to load text input properties (${response.status})`);
    }
    return (await response.json()) as PropertyOption[];
  }

  async getBlueprints(): Promise<BlueprintOption[]> {
    const response = await fetch(`${BASE}/blueprints`, {
      method: 'GET',
      headers: await this.headers(),
    });
    if (!response.ok) {
      throw new Error(`Failed to load blueprints (${response.status})`);
    }
    return (await response.json()) as BlueprintOption[];
  }

  async importFromAppSettings(): Promise<DisciplineSettingsResponse> {
    const response = await fetch(`${BASE}/import-from-appsettings`, {
      method: 'POST',
      headers: await this.headers(),
    });
    if (!response.ok) {
      throw new Error(`Failed to import from appsettings (${response.status})`);
    }
    return (await response.json()) as DisciplineSettingsResponse;
  }
}
