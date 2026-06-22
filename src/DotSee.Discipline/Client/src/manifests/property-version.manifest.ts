const targetEditors = [
  'Umb.PropertyEditorUi.TextBox',
  'Umb.PropertyEditorUi.TextArea',
  'Umb.PropertyEditorUi.Tiptap',
];

export interface PropertyVersionCaptions {
  nextVersionCaption: string | null;
  previousVersionCaption: string | null;
  noVersionsCaption: string | null;
}

const PREV_LABEL_KEY = '#dotseeDiscipline_propertyVersions_previousVersion';
const NEXT_LABEL_KEY = '#dotseeDiscipline_propertyVersions_nextVersion';

/** Use the caption only when it has non-whitespace content; otherwise fall back to the localized key. */
function labelOrFallback(caption: string | null, fallbackKey: string): string {
  return caption && caption.trim() ? caption : fallbackKey;
}

export function createPropertyVersionManifests(captions: PropertyVersionCaptions) {
  return [
    {
      type: 'propertyAction' as const,
      alias: 'DotSee.Discipline.PropertyVersions.PrevVersion',
      name: 'Previous Version',
      api: () => import('../actions/prev-version.action.js'),
      element: () => import('../elements/version-action.element.js'),
      forPropertyEditorUis: targetEditors,
      meta: {
        icon: 'icon-arrow-left',
        label: labelOrFallback(captions.previousVersionCaption, PREV_LABEL_KEY),
      },
    },
    {
      type: 'propertyAction' as const,
      alias: 'DotSee.Discipline.PropertyVersions.NextVersion',
      name: 'Next Version',
      api: () => import('../actions/next-version.action.js'),
      element: () => import('../elements/version-action.element.js'),
      forPropertyEditorUis: targetEditors,
      meta: {
        icon: 'icon-arrow-right',
        label: labelOrFallback(captions.nextVersionCaption, NEXT_LABEL_KEY),
      },
    },
  ];
}
