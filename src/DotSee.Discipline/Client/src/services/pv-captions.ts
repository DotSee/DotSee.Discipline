const DEFAULT_NO_VERSIONS = 'No previous versions';

let _noVersionsCaption = DEFAULT_NO_VERSIONS;

export function setNoVersionsCaption(caption: string | null): void {
  _noVersionsCaption = caption ?? DEFAULT_NO_VERSIONS;
}

export function getNoVersionsCaption(): string {
  return _noVersionsCaption;
}
