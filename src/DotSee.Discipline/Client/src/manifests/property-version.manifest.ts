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

const DEFAULT_PREV_LABEL = 'Previous version';
const DEFAULT_NEXT_LABEL = 'Next version';

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
        label: captions.previousVersionCaption ?? DEFAULT_PREV_LABEL,
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
        label: captions.nextVersionCaption ?? DEFAULT_NEXT_LABEL,
      },
    },
  ];
}
