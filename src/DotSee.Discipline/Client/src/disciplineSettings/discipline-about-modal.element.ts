import { css, html, customElement } from '@umbraco-cms/backoffice/external/lit';
import { UmbModalBaseElement } from '@umbraco-cms/backoffice/modal';

/**
 * "About" dialog for the DotSee.Discipline package. All copy comes from the localization files.
 */
@customElement('dotsee-discipline-about-modal')
export class DisciplineAboutModalElement extends UmbModalBaseElement {
  override render() {
    return html`
      <umb-body-layout headline=${this.localize.term('dotseeDiscipline_about_headline')}>
        <div class="about">
          <p>${this.localize.term('dotseeDiscipline_about_body')}</p>
          <p>
            ${this.localize.term('dotseeDiscipline_about_createdBy')}
            <a
              href=${this.localize.term('dotseeDiscipline_about_companyUrl')}
              target="_blank"
              rel="noopener noreferrer"
              >${this.localize.term('dotseeDiscipline_about_company')}</a
            >
          </p>
        </div>
        <uui-button
          slot="actions"
          look="primary"
          color="positive"
          label=${this.localize.term('dotseeDiscipline_common_close')}
          @click=${() => this._submitModal()}
        ></uui-button>
      </umb-body-layout>
    `;
  }

  static styles = [
    css`
      .about {
        padding: var(--uui-size-space-5, 16px);
        max-width: 460px;
        line-height: 1.5;
      }
      .about p {
        margin: 0 0 var(--uui-size-space-4, 16px);
      }
      .about p:last-child {
        margin-bottom: 0;
      }
      a {
        color: var(--uui-color-interactive, #3544b1);
      }
    `,
  ];
}

export default DisciplineAboutModalElement;

declare global {
  interface HTMLElementTagNameMap {
    'dotsee-discipline-about-modal': DisciplineAboutModalElement;
  }
}
