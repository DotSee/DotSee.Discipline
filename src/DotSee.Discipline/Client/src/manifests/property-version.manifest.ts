const targetEditors = [
  'Umb.PropertyEditorUi.TextBox',
  'Umb.PropertyEditorUi.TextArea',
  'Umb.PropertyEditorUi.Tiptap',
];

export const propertyVersionManifests = [
  {
    type: 'propertyAction' as const,
    alias: 'DotSee.Discipline.PropertyVersions.PrevVersion',
    name: 'Previous Version',
    api: () => import('../actions/prev-version.action.js'),
    element: () => import('../elements/version-action.element.js'),
    forPropertyEditorUis: targetEditors,
    meta: {
      icon: 'icon-arrow-left',
      label: 'Previous version',
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
      label: 'Next version',
    },
  },
];
