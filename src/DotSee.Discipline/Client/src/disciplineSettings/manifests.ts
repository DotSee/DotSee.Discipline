import { DISCIPLINE_SETTINGS_ENTITY_TYPE } from './types.js';

const WORKSPACE_ALIAS = 'DotSee.Discipline.Settings.Workspace';
const MENU_ALIAS = 'DotSee.Discipline.Settings.Menu';
const SIDEBAR_APP_ALIAS = 'DotSee.Discipline.Settings.SidebarApp';
const MENU_ITEM_ALIAS = 'DotSee.Discipline.Settings.MenuItem';

export const disciplineSettingsManifests: Array<UmbExtensionManifest> = [
  {
    type: 'workspace',
    alias: WORKSPACE_ALIAS,
    name: 'DotSee Discipline Settings Workspace',
    element: () => import('./discipline-settings.workspace.element.js'),
    meta: {
      entityType: DISCIPLINE_SETTINGS_ENTITY_TYPE,
    },
  },
  {
    type: 'menu',
    alias: MENU_ALIAS,
    name: 'DotSee Discipline Menu',
    meta: {
      label: '#dotseeDiscipline_menu_label',
    },
  },
  {
    type: 'menuItem',
    alias: MENU_ITEM_ALIAS,
    name: 'DotSee Discipline Menu Item',
    weight: 50,
    meta: {
      label: '#dotseeDiscipline_menu_itemLabel',
      icon: 'icon-settings-alt',
      entityType: DISCIPLINE_SETTINGS_ENTITY_TYPE,
      menus: [MENU_ALIAS],
    },
  },
  {
    // Custom element (not kind: 'menu') so no group headline is rendered — just the menu link.
    type: 'sectionSidebarApp',
    alias: SIDEBAR_APP_ALIAS,
    name: 'DotSee Discipline Sidebar App',
    weight: 50,
    element: () => import('./discipline-sidebar-app.element.js'),
    meta: {
      menu: MENU_ALIAS,
    },
    conditions: [
      {
        alias: 'Umb.Condition.SectionAlias',
        match: 'Umb.Section.Settings',
      },
    ],
  } as unknown as UmbExtensionManifest,
];
