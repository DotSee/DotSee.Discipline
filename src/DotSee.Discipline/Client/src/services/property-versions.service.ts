interface VersionEntry {
  versionId: number;
  value: string;
  versionDate: string;
}

interface VersionState {
  versions: VersionEntry[];
  currentIndex: number;
  originalValue: string;
}

const stateMap = new Map<string, VersionState>();

function makeKey(contentKey: string, propertyAlias: string, culture: string | null): string {
  return `${contentKey}-${propertyAlias}-${culture ?? ''}`;
}

async function fetchVersions(contentKey: string, propertyAlias: string, culture: string | null, authToken: string): Promise<VersionEntry[]> {
  const params = new URLSearchParams({
    contentKey,
    propertyAlias,
  });
  if (culture) {
    params.set('culture', culture);
  }

  const url = `/umbraco/api/propertyversions/history?${params.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
  });

  if (!response.ok) {
    console.error('[PropertyVersions] Failed to fetch versions:', response.status, response.statusText);
    return [];
  }

  const data = await response.json();
  return data;
}

async function getOrFetchState(contentKey: string, propertyAlias: string, culture: string | null, currentValue: string, authToken: string): Promise<VersionState> {
  const key = makeKey(contentKey, propertyAlias, culture);
  let state = stateMap.get(key);

  if (!state) {
    const versions = await fetchVersions(contentKey, propertyAlias, culture, authToken);
    state = {
      versions,
      currentIndex: 0,
      originalValue: currentValue,
    };
    stateMap.set(key, state);
  }

  return state;
}

function fireNavigationEvent(): void {
  document.dispatchEvent(new Event('dotsee-version-nav-changed'));
}

export async function navigatePrev(contentKey: string, propertyAlias: string, culture: string | null, currentValue: string, authToken: string): Promise<string | null> {
  const state = await getOrFetchState(contentKey, propertyAlias, culture, currentValue, authToken);

  if (state.versions.length === 0) {
    fireNavigationEvent();
    return null;
  }

  const nextIndex = state.currentIndex + 1;
  if (nextIndex >= state.versions.length) {
    fireNavigationEvent();
    return null;
  }

  state.currentIndex = nextIndex;
  fireNavigationEvent();
  return state.versions[nextIndex].value;
}

export async function navigateNext(contentKey: string, propertyAlias: string, culture: string | null, currentValue: string, authToken: string): Promise<string | null> {
  const state = await getOrFetchState(contentKey, propertyAlias, culture, currentValue, authToken);

  if (state.versions.length === 0) {
    fireNavigationEvent();
    return null;
  }

  const nextIndex = state.currentIndex - 1;
  if (nextIndex < 0) {
    fireNavigationEvent();
    return null;
  }

  state.currentIndex = nextIndex;
  fireNavigationEvent();
  return state.versions[nextIndex].value;
}

export function canGoPrev(contentKey: string, propertyAlias: string, culture: string | null): boolean {
  const key = makeKey(contentKey, propertyAlias, culture);
  const state = stateMap.get(key);
  if (!state || state.versions.length === 0) return true;
  return state.currentIndex + 1 < state.versions.length;
}

export function canGoNext(contentKey: string, propertyAlias: string, culture: string | null): boolean {
  const key = makeKey(contentKey, propertyAlias, culture);
  const state = stateMap.get(key);
  if (!state || state.versions.length === 0) return false;
  return state.currentIndex > 0;
}

export function clearCache(): void {
  stateMap.clear();
}
