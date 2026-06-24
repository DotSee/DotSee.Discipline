export interface DisciplineUiStatus {
  uiEnabled: boolean;
}

/**
 * Probes the discipline settings endpoint to learn whether the backoffice UI
 * should be registered at all. Hits the lightweight GET /settings endpoint and
 * reads only the uiEnabled flag.
 *
 * Secure-by-default: a missing token, an authentication failure / non-OK response,
 * or a network error all resolve to "not enabled" rather than registering the UI.
 * The probe re-runs on the next backoffice load, so a transient blip is recoverable.
 */
export async function fetchDisciplineUiStatus(authToken: string): Promise<DisciplineUiStatus> {
  // Don't send "Bearer undefined" / "Bearer " — without a valid token we can't confirm access.
  if (!authToken) {
    return { uiEnabled: false };
  }

  try {
    const response = await fetch('/umbraco/api/discipline/settings', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    if (!response.ok) {
      // Auth failure (401/403) or any other error → do not register the UI.
      return { uiEnabled: false };
    }
    const data = await response.json();
    return { uiEnabled: data?.uiEnabled !== false };
  } catch {
    // Network error → do not register the UI.
    return { uiEnabled: false };
  }
}
