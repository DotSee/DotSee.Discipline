export interface DisciplineUiStatus {
  uiEnabled: boolean;
}

/**
 * Probes the discipline settings endpoint to learn whether the backoffice UI
 * should be registered at all. Hits the lightweight GET /settings endpoint and
 * reads only the uiEnabled flag. Falls back to "enabled" on unexpected errors
 * so that a blip doesn't permanently hide the menu.
 */
export async function fetchDisciplineUiStatus(authToken: string): Promise<DisciplineUiStatus> {
  try {
    const response = await fetch('/umbraco/api/discipline/settings', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    if (!response.ok) {
      return { uiEnabled: true };
    }
    const data = await response.json();
    return { uiEnabled: data?.uiEnabled !== false };
  } catch {
    return { uiEnabled: true };
  }
}
