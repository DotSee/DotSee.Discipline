import type { DisciplineSettings, DisciplineSettingsResponse, DocTypeOption, PropertyOption } from './types.js';

const BASE = '/umbraco/api/discipline';

export class DisciplineSettingsRepository {
  constructor(private readonly authToken: string) {}

  private headers(extra: Record<string, string> = {}): HeadersInit {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.authToken}`,
      ...extra,
    };
  }

  async getSettings(): Promise<DisciplineSettingsResponse> {
    const response = await fetch(`${BASE}/settings`, {
      method: 'GET',
      headers: this.headers(),
    });
    if (!response.ok) {
      throw new Error(`Failed to load Discipline settings (${response.status})`);
    }
    return (await response.json()) as DisciplineSettingsResponse;
  }

  async saveSettings(settings: DisciplineSettings): Promise<DisciplineSettingsResponse> {
    const response = await fetch(`${BASE}/settings`, {
      method: 'PUT',
      headers: this.headers(),
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
      headers: this.headers(),
    });
    if (!response.ok) {
      throw new Error(`Failed to load doctypes (${response.status})`);
    }
    return (await response.json()) as DocTypeOption[];
  }

  async getTrueFalseProperties(): Promise<PropertyOption[]> {
    const response = await fetch(`${BASE}/properties/truefalse`, {
      method: 'GET',
      headers: this.headers(),
    });
    if (!response.ok) {
      throw new Error(`Failed to load true/false properties (${response.status})`);
    }
    return (await response.json()) as PropertyOption[];
  }

  async getTextContentProperties(): Promise<PropertyOption[]> {
    const response = await fetch(`${BASE}/properties/text-content`, {
      method: 'GET',
      headers: this.headers(),
    });
    if (!response.ok) {
      throw new Error(`Failed to load text content properties (${response.status})`);
    }
    return (await response.json()) as PropertyOption[];
  }

  async getTextInputProperties(): Promise<PropertyOption[]> {
    const response = await fetch(`${BASE}/properties/text-input`, {
      method: 'GET',
      headers: this.headers(),
    });
    if (!response.ok) {
      throw new Error(`Failed to load text input properties (${response.status})`);
    }
    return (await response.json()) as PropertyOption[];
  }

  async importFromAppSettings(): Promise<DisciplineSettingsResponse> {
    const response = await fetch(`${BASE}/import-from-appsettings`, {
      method: 'POST',
      headers: this.headers(),
    });
    if (!response.ok) {
      throw new Error(`Failed to import from appsettings (${response.status})`);
    }
    return (await response.json()) as DisciplineSettingsResponse;
  }
}
