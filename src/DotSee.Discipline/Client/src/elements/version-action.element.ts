import { html, customElement, property, state, ifDefined, when } from '@umbraco-cms/backoffice/external/lit';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';

@customElement('dotsee-version-action')
export class VersionActionElement extends UmbLitElement {
  @property({ attribute: false })
  manifest?: any;

  @state()
  private _href?: string;

  @state()
  private _disabled = false;

  #api: any;
  #boundNavHandler = () => this.#refreshDisabled();

  set api(api: any) {
    this.#api = api;
    this.#api?.getHref?.().then((href: string | undefined) => {
      this._href = href;
    });
    this.#refreshDisabled();
  }

  #refreshDisabled() {
    if (typeof this.#api?.getDisabledState === 'function') {
      this._disabled = this.#api.getDisabledState();
      this.requestUpdate();
    }
  }

  override connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener('dotsee-version-nav-changed', this.#boundNavHandler);
    this.#refreshDisabled();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener('dotsee-version-nav-changed', this.#boundNavHandler);
  }

  async #onClickLabel(event: Event) {
    event.stopPropagation();
    if (this._disabled) return;
    await this.#api?.execute().catch(() => { });
    this.#refreshDisabled();
  }

  #onClick(event: Event) {
    event.stopPropagation();
  }

  override render() {
    return html`
      <uui-menu-item
        label=${this.localize.string(this.manifest?.meta.label)}
        href=${ifDefined(this._href)}
        .disabled=${this._disabled}
        @click-label=${this.#onClickLabel}
        @click=${this.#onClick}>
        ${when(this.manifest?.meta.icon, (icon: string) => html`<umb-icon slot="icon" name=${icon}></umb-icon>`)}
      </uui-menu-item>
    `;
  }
}

export default VersionActionElement;
