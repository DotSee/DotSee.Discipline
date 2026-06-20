import { html, customElement, property } from '@umbraco-cms/backoffice/external/lit';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';

/**
 * Custom section sidebar app for DotSee.Discipline.
 *
 * The built-in `kind: 'menu'` sidebar app always renders an <h3> group headline (e.g.
 * "DotSee Discipline") above the menu items. We don't want that group — just the single
 * "Discipline" link — so this element renders only the menu's extension slot (no headline).
 */
@customElement('dotsee-discipline-sidebar-app')
export class DotseeDisciplineSidebarAppElement extends UmbLitElement {
  @property({ type: Object, attribute: false })
  manifest?: { meta?: { menu?: string } };

  override render() {
    return html`
      <umb-extension-slot
        type="menu"
        .filter=${(menu: { alias: string }) => menu.alias === this.manifest?.meta?.menu}
        .defaultElement=${'umb-menu'}
      ></umb-extension-slot>
    `;
  }
}

export default DotseeDisciplineSidebarAppElement;

declare global {
  interface HTMLElementTagNameMap {
    'dotsee-discipline-sidebar-app': DotseeDisciplineSidebarAppElement;
  }
}
