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

export interface BlockParams {
  parentPropertyAlias: string;
  blockElementKey: string;
}

const stateMap = new Map<string, VersionState>();

function makeKey(contentKey: string, propertyAlias: string, culture: string | null, block?: BlockParams): string {
  const base = `${contentKey}-${propertyAlias}-${culture ?? ''}`;
  return block ? `${base}-${block.blockElementKey}` : base;
}

async function fetchVersions(contentKey: string, propertyAlias: string, culture: string | null, authToken: string, block?: BlockParams): Promise<VersionEntry[]> {
  const params = new URLSearchParams({
    contentKey,
    propertyAlias,
  });
  if (culture) {
    params.set('culture', culture);
  }
  if (block) {
    params.set('parentPropertyAlias', block.parentPropertyAlias);
    params.set('blockElementKey', block.blockElementKey);
  }

  const url = `/umbraco/api/propertyversions/history?${params.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
  });

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return data;
}

async function getOrFetchState(contentKey: string, propertyAlias: string, culture: string | null, currentValue: string, authToken: string, block?: BlockParams): Promise<VersionState> {
  const key = makeKey(contentKey, propertyAlias, culture, block);
  let state = stateMap.get(key);

  if (!state) {
    const versions = await fetchVersions(contentKey, propertyAlias, culture, authToken, block);
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

export async function navigatePrev(contentKey: string, propertyAlias: string, culture: string | null, currentValue: string, authToken: string, block?: BlockParams): Promise<string | null> {
  const state = await getOrFetchState(contentKey, propertyAlias, culture, currentValue, authToken, block);

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

export async function navigateNext(contentKey: string, propertyAlias: string, culture: string | null, currentValue: string, authToken: string, block?: BlockParams): Promise<string | null> {
  const state = await getOrFetchState(contentKey, propertyAlias, culture, currentValue, authToken, block);

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

export function canGoPrev(contentKey: string, propertyAlias: string, culture: string | null, block?: BlockParams): boolean {
  const key = makeKey(contentKey, propertyAlias, culture, block);
  const state = stateMap.get(key);
  if (!state || state.versions.length === 0) return true;
  return state.currentIndex + 1 < state.versions.length;
}

export function canGoNext(contentKey: string, propertyAlias: string, culture: string | null, block?: BlockParams): boolean {
  const key = makeKey(contentKey, propertyAlias, culture, block);
  const state = stateMap.get(key);
  if (!state || state.versions.length === 0) return false;
  return state.currentIndex > 0;
}

export async function prefetch(contentKey: string, propertyAlias: string, culture: string | null, currentValue: string, authToken: string, block?: BlockParams): Promise<void> {
  await getOrFetchState(contentKey, propertyAlias, culture, currentValue, authToken, block);
  fireNavigationEvent();
}

export function hasVersions(contentKey: string, propertyAlias: string, culture: string | null, block?: BlockParams): boolean {
  const key = makeKey(contentKey, propertyAlias, culture, block);
  const state = stateMap.get(key);
  if (!state) return true; // Not yet fetched — assume yes until we know
  return state.versions.length > 1;
}

export function clearCache(): void {
  stateMap.clear();
}
