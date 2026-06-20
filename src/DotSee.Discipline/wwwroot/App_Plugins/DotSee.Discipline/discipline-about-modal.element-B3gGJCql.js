import { html as n, css as c, customElement as u } from "@umbraco-cms/backoffice/external/lit";
import { UmbModalBaseElement as p } from "@umbraco-cms/backoffice/modal";
var d = Object.defineProperty, m = Object.getOwnPropertyDescriptor, b = (e, t, i) => t in e ? d(e, t, { enumerable: !0, configurable: !0, writable: !0, value: i }) : e[t] = i, _ = (e, t, i, r) => {
  for (var o = r > 1 ? void 0 : r ? m(t, i) : t, a = e.length - 1, s; a >= 0; a--)
    (s = e[a]) && (o = s(o) || o);
  return o;
}, h = (e, t, i) => b(e, t + "", i);
let l = class extends p {
  render() {
    return n`
      <umb-body-layout headline=${this.localize.term("dotseeDiscipline_about_headline")}>
        <div class="about">
          <p>${this.localize.term("dotseeDiscipline_about_body")}</p>
          <p>
            ${this.localize.term("dotseeDiscipline_about_createdBy")}
            <a
              href=${this.localize.term("dotseeDiscipline_about_companyUrl")}
              target="_blank"
              rel="noopener noreferrer"
              >${this.localize.term("dotseeDiscipline_about_company")}</a
            >
          </p>
        </div>
        <uui-button
          slot="actions"
          look="primary"
          color="positive"
          label=${this.localize.term("dotseeDiscipline_common_close")}
          @click=${() => this._submitModal()}
        ></uui-button>
      </umb-body-layout>
    `;
  }
};
h(l, "styles", [
  c`
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
    `
]);
l = _([
  u("dotsee-discipline-about-modal")
], l);
const y = l;
export {
  l as DisciplineAboutModalElement,
  y as default
};
//# sourceMappingURL=discipline-about-modal.element-B3gGJCql.js.map
