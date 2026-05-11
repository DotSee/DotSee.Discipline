const DEFAULT_NO_VERSIONS_KEY = '#dotseeDiscipline_propertyVersions_noPreviousVersions';

let _noVersionsCaption = DEFAULT_NO_VERSIONS_KEY;

export function setNoVersionsCaption(caption: string | null): void {
  _noVersionsCaption = caption && caption.length > 0 ? caption : DEFAULT_NO_VERSIONS_KEY;
}

export function getNoVersionsCaption(): string {
  return _noVersionsCaption;
}
