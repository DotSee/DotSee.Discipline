import { html, customElement, property, state, ifDefined, when, nothing } from '@umbraco-cms/backoffice/external/lit';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';

@customElement('dotsee-version-action')
export class VersionActionElement extends UmbLitElement {
  @property({ attribute: false })
  manifest?: any;

  @state()
  private _href?: string;

  @state()
  private _disabled = false;

  @state()
  private _hidden = false;

  @state()
  private _label?: string;

  #api: any;
  #boundNavHandler = () => this.#refreshState();

  set api(api: any) {
    this.#api = api;
    this.#api?.getHref?.().then((href: string | undefined) => {
      this._href = href;
    });
    this.#refreshState();
  }

  #refreshState() {
    if (typeof this.#api?.getDisabledState === 'function') {
      this._disabled = this.#api.getDisabledState();
    }
    if (typeof this.#api?.isHidden === 'function') {
      this._hidden = this.#api.isHidden();
    }
    if (typeof this.#api?.getLabel === 'function') {
      this._label = this.#api.getLabel();
    }
    this.requestUpdate();
  }

  override connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener('dotsee-version-nav-changed', this.#boundNavHandler);
    this.#refreshState();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener('dotsee-version-nav-changed', this.#boundNavHandler);
  }

  async #onClickLabel(event: Event) {
    event.stopPropagation();
    if (this._disabled) return;
    await this.#api?.execute().catch(() => { });
    this.#refreshState();
  }

  #onClick(event: Event) {
    event.stopPropagation();
  }

  override render() {
    if (this._hidden) return nothing;

    const rawLabel = this._label ?? this.manifest?.meta.label;
    const label = this.localize.string(rawLabel);

    return html`
      <uui-menu-item
        label=${label}
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
